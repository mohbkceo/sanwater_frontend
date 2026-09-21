import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, FolderTree, ImagePlus, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components';
import { PERMISSIONS } from '@/configs/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { destroyImage, uploadImage } from '@/services/contents/imageHandler';
import {
  createFamily, createSubFamily, deleteFamily, deleteSubFamily,
  getFamilies, updateFamily, updateSubFamily,
} from '@/services/products/familyServices';

const EMPTY = { name: '', slug: '', description: '', image: null, order: 0, isActive: true };

function Dialog({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

function ImageDropzone({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Use a JPG, PNG, or WebP image.');
    if (file.size > 10 * 1024 * 1024) return toast.error('Image must be 10 MB or smaller.');
    setUploading(true);
    try {
      const response = await uploadImage(file, { folder: 'catalog-families' });
      onChange(response.data.path);
    } catch { toast.error('Image upload failed.'); }
    finally { setUploading(false); }
  }

  return (
    <div>
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <img src={value} alt="Family preview" className="h-48 w-full object-cover" />
          <div className="flex gap-2 p-3">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>Replace</Button>
            <Button type="button" variant="outline" onClick={() => onChange(null)} className="text-red-600">Remove</Button>
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
            <span className="mt-3 block text-sm font-semibold text-slate-700">{uploading ? 'Uploading…' : 'Drop image here or choose an image'}</span>
            <span className="mt-1 block text-xs text-slate-400">JPG, PNG or WebP · max 10 MB</span>
          </span>
        </button>
      )}
      <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleFile(event.target.files[0])} />
    </div>
  );
}

function EntityEditor({ kind, initial, familyId, onClose, onSaved }) {
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
        await destroyImage(initial.image).catch(() => toast.warning('Saved, but the previous image could not be removed.'));
      }
      toast.success(`${isFamily ? 'Family' : 'Sub Family'} ${editing ? 'updated' : 'created'}.`);
      await onSaved();
      onClose();
    } catch { toast.error(`Could not save ${isFamily ? 'Family' : 'Sub Family'}.`); }
    finally { setSaving(false); }
  }

  return (
    <Dialog title={`${editing ? 'Edit' : 'Create'} ${isFamily ? 'Family' : 'Sub Family'}`} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Name *<input required value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-400" /></label>
          <label className="text-sm font-medium text-slate-700">Slug<input value={form.slug || ''} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="auto-generated-if-empty" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-400" /></label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Description<textarea rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-400" /></label>
          <label className="text-sm font-medium text-slate-700">Display order<input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-400" /></label>
          <label className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Visible in public catalog</label>
        </div>
        <div><h3 className="mb-2 text-sm font-semibold text-slate-800">Image</h3><ImageDropzone value={form.image} onChange={(value) => set('image', value)} /></div>
        {isFamily && <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">SEO title<input value={form.seo.title || ''} onChange={(e) => setForm((c) => ({ ...c, seo: { ...c.seo, title: e.target.value } }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
          <label className="text-sm font-medium text-slate-700">SEO description<input value={form.seo.description || ''} onChange={(e) => setForm((c) => ({ ...c, seo: { ...c.seo, description: e.target.value } }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        </div>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button disabled={saving} className="bg-blue-600 text-white">{saving ? 'Saving…' : 'Save'}</Button></div>
      </form>
    </Dialog>
  );
}

function DeleteDialog({ target, families, onClose, onDeleted }) {
  const isFamily = target.kind === 'family';
  const entity = target.entity;
  const blocked = isFamily && (entity.subFamilyCount > 0 || entity.productCount > 0);
  const [password, setPassword] = useState('');
  const [replacement, setReplacement] = useState('');
  const [deleting, setDeleting] = useState(false);
  const replacements = useMemo(() => families.flatMap((family) => family.subFamilies.map((sub) => ({ ...sub, familyName: family.name }))).filter((sub) => sub._id !== entity._id), [families, entity._id]);

  async function submit(event) {
    event.preventDefault();
    if (!isFamily && entity.productCount > 0 && !replacement) return toast.error('Choose a replacement Sub Family.');
    setDeleting(true);
    try {
      if (isFamily) await deleteFamily(entity._id, password);
      else await deleteSubFamily(entity._id, { password, replacementSubFamilyId: replacement });
      if (entity.image) await destroyImage(entity.image);
      toast.success(`${isFamily ? 'Family' : 'Sub Family'} deleted.`);
      await onDeleted();
      onClose();
    } catch { toast.error('Delete failed. Check your password and the destination.'); }
    finally { setDeleting(false); }
  }

  return (
    <Dialog title={`Delete ${isFamily ? 'Family' : 'Sub Family'}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5 p-6">
        <p className="text-sm text-slate-600">You are about to permanently delete <strong>{entity.name}</strong>.</p>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-red-50 p-4 text-sm"><span>Sub Families: <strong>{entity.subFamilyCount || 0}</strong></span><span>Products: <strong>{entity.productCount || 0}</strong></span></div>
        {blocked ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Move or delete all Sub Families before deleting this Family.</p> : <>
          {!isFamily && entity.productCount > 0 && <label className="block text-sm font-medium text-slate-700">Replacement Sub Family *<select required value={replacement} onChange={(e) => setReplacement(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"><option value="">Select destination</option>{replacements.map((sub) => <option key={sub._id} value={sub._id}>{sub.familyName} — {sub.name}</option>)}</select></label>}
          <label className="block text-sm font-medium text-slate-700">Current password *<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
        </>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button>{!blocked && <Button disabled={deleting} className="bg-red-600 text-white hover:bg-red-700">{deleting ? 'Deleting…' : entity.productCount > 0 ? 'Move products & delete' : 'Delete permanently'}</Button>}</div>
      </form>
    </Dialog>
  );
}

export default function FamiliesControlPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);

  async function loadFamilies() {
    setLoading(true);
    try { const response = await getFamilies({ isAdmin: true }); setFamilies(response?.data?.families || []); }
    catch { toast.error('Failed to load Families.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadFamilies(); }, []);

  return (
    <section className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/70 p-6 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-blue-600"><FolderTree size={16} /> Catalog taxonomy</div><h1 className="text-3xl font-semibold text-slate-950">Families</h1><p className="mt-2 text-sm text-slate-500">Admin-managed Family → Sub Family → Product hierarchy.</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={loadFamilies} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></Button>{canManage && <Button onClick={() => setEditor({ kind: 'family' })} className="gap-2 bg-blue-600 text-white"><Plus size={16} /> Create Family</Button>}</div>
        </header>

        {loading ? <div className="space-y-4">{[1, 2, 3].map((n) => <div key={n} className="h-28 animate-pulse rounded-3xl bg-white" />)}</div> : families.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><FolderTree className="mx-auto text-slate-300" /><h2 className="mt-3 font-semibold">No Families yet</h2><p className="mt-1 text-sm text-slate-500">Create the first Family, then add its Sub Families.</p></div> : <div className="space-y-4">
          {families.map((family) => <details key={family._id} open className="group overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6"><div className="flex min-w-0 items-center gap-3">{family.image ? <img src={family.image} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><FolderTree size={20} /></div>}<div><div className="flex items-center gap-2"><ChevronRight size={17} className="transition group-open:rotate-90" /><h2 className="font-semibold text-slate-950">{family.name}</h2>{!family.isActive && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px]">Hidden</span>}</div><p className="ml-7 text-xs text-slate-400">/{family.slug} · {family.subFamilyCount} Sub Families</p></div></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{family.productCount} products</span></summary>
            <div className="border-t border-slate-100 p-5 sm:p-6">
              {canManage && <div className="mb-5 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditor({ kind: 'family', initial: family })} className="gap-2"><Pencil size={14} /> Edit Family</Button><Button variant="outline" onClick={() => setEditor({ kind: 'subFamily', familyId: family._id })} className="gap-2"><Plus size={14} /> Add Sub Family</Button><Button variant="outline" onClick={() => setDeleteTarget({ kind: 'family', entity: family })} className="ml-auto gap-2 text-red-600"><Trash2 size={14} /> Delete</Button></div>}
              <div className="space-y-2">{family.subFamilies.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No Sub Families.</p> : family.subFamilies.map((sub) => <div key={sub._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-semibold text-slate-900">{sub.name}</h3>{!sub.isActive && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px]">Hidden</span>}</div><p className="text-xs text-slate-400">/{sub.slug} · order {sub.order || 0}</p></div><span className="text-xs font-semibold text-slate-500">{sub.productCount} products</span>{canManage && <div className="flex gap-1"><Button variant="outline" onClick={() => setEditor({ kind: 'subFamily', familyId: family._id, initial: sub })}><Pencil size={14} /></Button><Button variant="outline" onClick={() => setDeleteTarget({ kind: 'subFamily', entity: sub })} className="text-red-600"><Trash2 size={14} /></Button></div>}</div>)}</div>
            </div>
          </details>)}
        </div>}
      </div>
      {editor && <EntityEditor {...editor} onClose={() => setEditor(null)} onSaved={loadFamilies} />}
      {deleteTarget && <DeleteDialog target={deleteTarget} families={families} onClose={() => setDeleteTarget(null)} onDeleted={loadFamilies} />}
    </section>
  );
}
