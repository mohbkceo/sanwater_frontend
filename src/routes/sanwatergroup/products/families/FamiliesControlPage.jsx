import { useTranslation } from "@/lib/i18n";
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, FolderTree, ImagePlus, Loader2, PackagePlus, Pencil, Plus, RefreshCw, Search, Trash2, Unlink, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components';
import { PERMISSIONS } from '@/configs/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { destroyImage, uploadImage } from '@/services/contents/imageHandler';
import {
  assignProductsToSubFamily, createFamily, createSubFamily, deleteFamily, deleteSubFamily,
  getFamilies, removeProductsFromSubFamily, updateFamily, updateSubFamily,
} from '@/services/products/familyServices';
import { getProducts } from '@/services/products/productServices';

const EMPTY = { name: '', slug: '', description: '', image: null, order: 0, isActive: true };

function Dialog({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-lg'}`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

function ProductPager({ page, totalPages, onPage }) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
      <Button type="button" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>{t("admin.families.previous")}</Button>
      <span>{t("admin.common.page_of", { page, total: totalPages })}</span>
      <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>{t("admin.families.next")}</Button>
    </div>
  );
}

function AssignProductsDialog({ family, subFamily, onClose, onAssigned }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [assignment, setAssignment] = useState('unassigned');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getProducts({ isAdmin: true, assignment, search, page, limit: 12, sortBy: 'name', sortOrder: 'asc' });
        if (!active) return;
        setProducts(response?.data?.products || []);
        setTotalPages(response?.data?.totalPages || 1);
        setTotalCount(response?.data?.totalCount || 0);
      } catch {
        if (active) toast.error(t("admin.families.could_not_load_products"));
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [assignment, page, search]);

  function toggleProduct(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelected((current) => {
      const next = new Set(current);
      const allVisibleSelected = products.length > 0 && products.every((product) => next.has(product._id));
      products.forEach((product) => allVisibleSelected ? next.delete(product._id) : next.add(product._id));
      return next;
    });
  }

  async function assign() {
    if (!selected.size) return;
    setSaving(true);
    try {
      await assignProductsToSubFamily(subFamily._id, [...selected]);
      toast.success(t(selected.size === 1 ? "admin.families.one_product_assigned" : "admin.families.products_assigned", { count: selected.size, family: subFamily.name }));
      await onAssigned();
      onClose();
    } catch { toast.error(t("admin.families.product_assignment_failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog title={t("admin.families.assign_products_to_family", { family: subFamily.name })} onClose={onClose} wide>
      <div className="space-y-5 p-6">
        <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900"><strong>{family.name} → {subFamily.name}</strong><p className="mt-1 text-xs text-blue-700">{t("admin.families.assigning_a_product_here_also_sets_its_parent_family")}</p></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1"><Search className="absolute start-3 top-3.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t("admin.families.search_by_name_id_or_serial")} className="h-11 w-full rounded-xl border border-slate-200 ps-10 pe-3 text-sm outline-none focus:border-blue-400" /></label>
          <select value={assignment} onChange={(event) => { setAssignment(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
            <option value="unassigned">{t("admin.families.unassigned")}</option><option value="assigned">{t("admin.families.assigned")}</option><option value="all">{t("admin.families.all")}</option>
          </select>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500"><button type="button" onClick={toggleVisible} className="font-semibold text-blue-700">{t("admin.families.select_all_visible")}</button><span>{t("admin.families.selection_count", { total: totalCount, selected: selected.size })}</span></div>
        <div className="min-h-64 space-y-2">
          {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-blue-600" /></div> : products.length === 0 ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">{t("admin.families.no_matching_products")}</div> : products.map((product) => (
            <label key={product._id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50/30">
              <input type="checkbox" checked={selected.has(product._id)} onChange={() => toggleProduct(product._id)} />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{product.productId} — {product.name || t("admin.families.unnamed_product")}</p><p className="mt-1 truncate text-xs text-slate-400">{product.serialNumber}{product.subFamily ? ` · ${product.family?.name || t("admin.families.unknown_family")} → ${product.subFamily.name}` : t("admin.families.unassigned_indicator")}</p></div>
            </label>
          ))}
        </div>
        <ProductPager page={page} totalPages={totalPages} onPage={setPage} />
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>{t("admin.families.cancel")}</Button><Button type="button" disabled={!selected.size || saving} onClick={assign} className="gap-2 bg-blue-600 text-white"><PackagePlus size={16} />{saving ? t("admin.families.assigning") : t(selected.size === 1 ? "admin.families.assign_one_product" : "admin.families.assign_product_count", { count: selected.size })}</Button></div>
      </div>
    </Dialog>
  );
}

function SubFamilyProductsDialog({ family, subFamily, canManage, onClose, onChanged }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name:asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(subFamily.productCount || 0);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [assigning, setAssigning] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sort.split(':');
      const response = await getProducts({ isAdmin: true, subFamily: subFamily._id, search, page, limit: 10, sortBy, sortOrder });
      setProducts(response?.data?.products || []);
      setTotalPages(response?.data?.totalPages || 1);
      setTotalCount(response?.data?.totalCount || 0);
    } catch { toast.error(t("admin.families.could_not_load_assigned_products")); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, subFamily._id]);

  async function remove(productIds) {
    if (!productIds.length) return;
    setRemoving(true);
    try {
      await removeProductsFromSubFamily(subFamily._id, productIds);
      toast.success(t(productIds.length === 1 ? "admin.families.one_product_unassigned" : "admin.families.products_unassigned", { count: productIds.length }));
      setSelected(new Set());
      await onChanged();
      await loadProducts();
    } catch { toast.error(t("admin.families.could_not_remove_the_assignment")); }
    finally { setRemoving(false); }
  }

  function toggle(id) {
    setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  return (
    <>
      <Dialog title={subFamily.name} onClose={onClose} wide>
        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-400">{t("admin.families.parent_family")}</p><p className="mt-1 font-semibold text-slate-900">{family.name}</p><p className="mt-1 text-xs text-slate-500">{subFamily.isActive ? t("admin.families.visible") : t("admin.families.hidden")} · {totalCount} {t("admin.families.assigned_products")}</p></div>{canManage && <Button type="button" onClick={() => setAssigning(true)} className="gap-2 bg-blue-600 text-white"><PackagePlus size={16} /> {t("admin.families.assign_products")}</Button>}</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><label className="relative flex-1"><Search className="absolute start-3 top-3.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t("admin.families.search_assigned_products")} className="h-11 w-full rounded-xl border border-slate-200 ps-10 pe-3 text-sm outline-none focus:border-blue-400" /></label><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="name:asc">{t("admin.families.name_a_z")}</option><option value="name:desc">{t("admin.families.name_z_a")}</option><option value="createdAt:desc">{t("admin.families.newest_first")}</option><option value="createdAt:asc">{t("admin.families.oldest_first")}</option></select>{canManage && selected.size > 0 && <Button type="button" variant="outline" disabled={removing} onClick={() => remove([...selected])} className="gap-2 text-red-600"><Unlink size={15} /> {t("admin.families.remove_selected")}{selected.size})</Button>}</div>
          <div className="min-h-64 space-y-2">
            {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-blue-600" /></div> : products.length === 0 ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">{t("admin.families.no_products_are_assigned_to_this_sub_family")}</div> : products.map((product) => (
              <div key={product._id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">{canManage && <input type="checkbox" checked={selected.has(product._id)} onChange={() => toggle(product._id)} />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{product.productId} — {product.name || t("admin.families.unnamed_product")}</p><p className="mt-1 truncate text-xs text-slate-400">{product.serialNumber}</p></div>{canManage && <Button type="button" variant="outline" disabled={removing} onClick={() => remove([product._id])} className="gap-2 text-red-600"><Unlink size={14} /> {t("admin.families.remove")}</Button>}</div>
            ))}
          </div>
          <ProductPager page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      </Dialog>
      {assigning && <AssignProductsDialog family={family} subFamily={subFamily} onClose={() => setAssigning(false)} onAssigned={async () => { await onChanged(); await loadProducts(); }} />}
    </>
  );
}

function ImageDropzone({ value, onChange }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error(t("admin.families.use_a_jpg_png_or_webp_image"));
    if (file.size > 10 * 1024 * 1024) return toast.error(t("admin.families.image_must_be_10_mb_or_smaller"));
    setUploading(true);
    try {
      const response = await uploadImage(file, { folder: 'catalog-families' });
      onChange(response.data.path);
    } catch { toast.error(t("admin.families.image_upload_failed")); }
    finally { setUploading(false); }
  }

  return (
    <div>
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <img src={value} alt={t("admin.families.family_preview")} className="h-48 w-full object-cover" />
          <div className="flex gap-2 p-3">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>{t("admin.families.replace")}</Button>
            <Button type="button" variant="outline" onClick={() => onChange(null)} className="text-red-600">{t("admin.families.remove")}</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); handleFile(event.dataTransfer.files[0]); }}
          className={`grid min-h-44 w-full place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}
        >
          <span>
            {uploading ? <Loader2 className="mx-auto animate-spin text-blue-600" /> : <ImagePlus className="mx-auto text-slate-400" />}
            <span className="mt-3 block text-sm font-semibold text-slate-700">{uploading ? t("admin.families.uploading") : t("admin.families.drop_image_here_or_choose_an_image")}</span>
            <span className="mt-1 block text-xs text-slate-400">{t("admin.families.jpg_png_or_webp_max_10_mb")}</span>
          </span>
        </button>
      )}
      <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleFile(event.target.files[0])} />
    </div>
  );
}

function EntityEditor({ kind, initial, familyId, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ ...EMPTY, ...initial, seo: { title: '', description: '', noIndex: false, ...(initial?.seo || {}) } });
  const [saving, setSaving] = useState(false);
  const isFamily = kind === 'family';
  const editing = Boolean(initial?._id);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, ...(form.slug ? { slug: form.slug } : {}), description: form.description,
        image: form.image || null, order: Number(form.order) || 0, isActive: form.isActive,
        ...(isFamily ? { seo: form.seo } : {}),
      };
      if (isFamily) await (editing ? updateFamily(form._id, payload) : createFamily(payload));
      else await (editing ? updateSubFamily(form._id, payload) : createSubFamily(familyId, payload));
      if (editing && initial.image && initial.image !== payload.image) {
        await destroyImage(initial.image).catch(() => toast.warning(t("admin.families.saved_but_the_previous_image_could_not_be_removed")));
      }
      toast.success(t(isFamily ? (editing ? "admin.families.family_updated" : "admin.families.family_created") : (editing ? "admin.families.sub_family_updated" : "admin.families.sub_family_created")));
      await onSaved();
      onClose();
    } catch { toast.error(t(isFamily ? "admin.families.family_save_failed" : "admin.families.sub_family_save_failed")); }
    finally { setSaving(false); }
  }

  return (
    <Dialog title={t(isFamily ? (editing ? "admin.families.edit_family" : "admin.families.create_family") : (editing ? "admin.families.edit_sub_family" : "admin.families.create_sub_family"))} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">{t("admin.families.name")}<input required value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-400" /></label>
          <label className="text-sm font-medium text-slate-700">{t("admin.families.slug")}<input value={form.slug || ''} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder={t("admin.families.auto_generated_if_empty")} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-400" /></label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">{t("admin.families.description")}<textarea rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-400" /></label>
          <label className="text-sm font-medium text-slate-700">{t("admin.families.display_order")}<input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-400" /></label>
          <label className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> {t("admin.families.visible_in_public_catalog")}</label>
        </div>
        <div><h3 className="mb-2 text-sm font-semibold text-slate-800">{t("admin.families.image")}</h3><ImageDropzone value={form.image} onChange={(value) => set('image', value)} /></div>
        {isFamily && <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">{t("admin.families.seo_title")}<input value={form.seo.title || ''} onChange={(e) => setForm((c) => ({ ...c, seo: { ...c.seo, title: e.target.value } }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
          <label className="text-sm font-medium text-slate-700">{t("admin.families.seo_description")}<input value={form.seo.description || ''} onChange={(e) => setForm((c) => ({ ...c, seo: { ...c.seo, description: e.target.value } }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        </div>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>{t("admin.families.cancel")}</Button><Button disabled={saving} className="bg-blue-600 text-white">{saving ? t("admin.families.saving") : t("admin.families.save")}</Button></div>
      </form>
    </Dialog>
  );
}

function DeleteDialog({ target, families, onClose, onDeleted }) {
  const { t } = useTranslation();
  const isFamily = target.kind === 'family';
  const entity = target.entity;
  const blocked = isFamily && (entity.subFamilyCount > 0 || entity.productCount > 0);
  const [password, setPassword] = useState('');
  const [replacement, setReplacement] = useState('');
  const [deleting, setDeleting] = useState(false);
  const replacements = useMemo(() => families.flatMap((family) => family.subFamilies.map((sub) => ({ ...sub, familyName: family.name }))).filter((sub) => sub._id !== entity._id), [families, entity._id]);

  async function submit(event) {
    event.preventDefault();
    if (!isFamily && entity.productCount > 0 && !replacement) return toast.error(t("admin.families.choose_a_replacement_sub_family"));
    setDeleting(true);
    try {
      if (isFamily) await deleteFamily(entity._id, password);
      else await deleteSubFamily(entity._id, { password, replacementSubFamilyId: replacement });
      if (entity.image) await destroyImage(entity.image);
      toast.success(t(isFamily ? "admin.families.family_deleted" : "admin.families.sub_family_deleted"));
      await onDeleted();
      onClose();
    } catch { toast.error(t("admin.families.delete_failed_check_your_password_and_the_destination")); }
    finally { setDeleting(false); }
  }

  return (
    <Dialog title={t(isFamily ? "admin.families.delete_family" : "admin.families.delete_sub_family")} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5 p-6">
        <p className="text-sm text-slate-600">{t("admin.families.delete_confirmation", { name: entity.name })}</p>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-red-50 p-4 text-sm"><span>{t("admin.families.sub_families")} <strong>{entity.subFamilyCount || 0}</strong></span><span>{t("admin.families.products_label")} <strong>{entity.productCount || 0}</strong></span></div>
        {blocked ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{t("admin.families.move_or_delete_all_sub_families_before_deleting_this")}</p> : <>
          {!isFamily && entity.productCount > 0 && <label className="block text-sm font-medium text-slate-700">{t("admin.families.replacement_sub_family")}<select required value={replacement} onChange={(e) => setReplacement(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="">{t("admin.families.select_destination")}</option>{replacements.map((sub) => <option key={sub._id} value={sub._id}>{sub.familyName} — {sub.name}</option>)}</select></label>}
          <label className="block text-sm font-medium text-slate-700">{t("admin.families.current_password")}<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        </>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>{t("admin.families.cancel")}</Button>{!blocked && <Button disabled={deleting} className="bg-red-600 text-white hover:bg-red-700">{deleting ? t("admin.families.deleting") : entity.productCount > 0 ? t("admin.families.move_products_delete") : t("admin.families.delete_permanently")}</Button>}</div>
      </form>
    </Dialog>
  );
}

export default function FamiliesControlPage() {
  const { t } = useTranslation();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedSubFamily, setSelectedSubFamily] = useState(null);
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);

  async function loadFamilies() {
    setLoading(true);
    try { const response = await getFamilies({ isAdmin: true }); setFamilies(response?.data?.families || []); }
    catch { toast.error(t("admin.families.failed_to_load_families")); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadFamilies(); }, []);

  return (
    <section className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/70 p-6 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-blue-600"><FolderTree size={16} /> {t("admin.families.catalog_taxonomy")}</div><h1 className="text-3xl font-semibold text-slate-950">{t("admin.families.families")}</h1><p className="mt-2 text-sm text-slate-500">{t("admin.families.admin_managed_family_sub_family_product_hierarchy")}</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={loadFamilies} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></Button>{canManage && <Button onClick={() => setEditor({ kind: 'family' })} className="gap-2 bg-blue-600 text-white"><Plus size={16} /> {t("admin.families.create_family")}</Button>}</div>
        </header>

        {loading ? <div className="space-y-4">{[1, 2, 3].map((n) => <div key={n} className="h-28 animate-pulse rounded-3xl bg-white" />)}</div> : families.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><FolderTree className="mx-auto text-slate-300" /><h2 className="mt-3 font-semibold">{t("admin.families.no_families_yet")}</h2><p className="mt-1 text-sm text-slate-500">{t("admin.families.create_the_first_family_then_add_its_sub_families")}</p></div> : <div className="space-y-4">
          {families.map((family) => <details key={family._id} open className="group overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6"><div className="flex min-w-0 items-center gap-3">{family.image ? <img src={family.image} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><FolderTree size={20} /></div>}<div><div className="flex items-center gap-2"><ChevronRight size={17} className="transition group-open:rotate-90" /><h2 className="font-semibold text-slate-950">{family.name}</h2>{!family.isActive && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px]">{t("admin.families.hidden")}</span>}</div><p className="ms-7 text-xs text-slate-400">/{family.slug} · {family.subFamilyCount} {t("admin.families.sub_families_count_label")}</p></div></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{family.productCount} {t("admin.families.product_count_label")}</span></summary>
            <div className="border-t border-slate-100 p-5 sm:p-6">
              {canManage && <div className="mb-5 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditor({ kind: 'family', initial: family })} className="gap-2"><Pencil size={14} /> {t("admin.families.edit_family")}</Button><Button variant="outline" onClick={() => setEditor({ kind: 'subFamily', familyId: family._id })} className="gap-2"><Plus size={14} /> {t("admin.families.add_sub_family")}</Button><Button variant="outline" onClick={() => setDeleteTarget({ kind: 'family', entity: family })} className="ms-auto gap-2 text-red-600"><Trash2 size={14} /> {t("admin.families.delete")}</Button></div>}
              <div className="space-y-2">{family.subFamilies.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">{t("admin.families.no_sub_families")}</p> : family.subFamilies.map((sub) => <div key={sub._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"><button type="button" onClick={() => setSelectedSubFamily({ family, subFamily: sub })} className="min-w-0 flex-1 text-start"><div className="flex items-center gap-2"><h3 className="font-semibold text-slate-900">{sub.name}</h3>{!sub.isActive && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px]">{t("admin.families.hidden")}</span>}</div><p className="text-xs text-slate-400">/{sub.slug} {t("admin.families.order")} {sub.order || 0}</p></button><span className="text-xs font-semibold text-slate-500">{sub.productCount} {t("admin.families.product_count_label")}</span><div className="flex gap-1"><Button variant="outline" onClick={() => setSelectedSubFamily({ family, subFamily: sub })}>{t("admin.families.open")}</Button>{canManage && <><Button variant="outline" onClick={() => setEditor({ kind: 'subFamily', familyId: family._id, initial: sub })}><Pencil size={14} /></Button><Button variant="outline" onClick={() => setDeleteTarget({ kind: 'subFamily', entity: sub })} className="text-red-600"><Trash2 size={14} /></Button></>}</div></div>)}</div>
            </div>
          </details>)}
        </div>}
      </div>
      {editor && <EntityEditor {...editor} onClose={() => setEditor(null)} onSaved={loadFamilies} />}
      {deleteTarget && <DeleteDialog target={deleteTarget} families={families} onClose={() => setDeleteTarget(null)} onDeleted={loadFamilies} />}
      {selectedSubFamily && <SubFamilyProductsDialog {...selectedSubFamily} canManage={canManage} onClose={() => setSelectedSubFamily(null)} onChanged={loadFamilies} />}
    </section>
  );
}
