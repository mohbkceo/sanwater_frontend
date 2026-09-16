import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, RefreshCw, Save, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components';
import { PERMISSIONS } from '@/configs/permissions';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';
import { usePermissions } from '@/hooks/usePermissions';
import {
  getFamilies,
  updateFamilyConfig,
  updateSubFamilyConfig,
} from '@/services/products/familyServices';

function ConfigEditor({ entry, label, canManage, onSave }) {
  const [form, setForm] = useState({
    displayName: entry.displayName || entry.key,
    description: entry.description || '',
    image: entry.image || '',
    order: entry.order ?? 0,
    isActive: entry.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, order: Number(form.order) || 0 });
      toast.success(`${label} settings saved`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to save ${label.toLowerCase()} settings`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
      <label className="space-y-1.5 text-xs font-semibold text-slate-600">
        Display Name
        <input
          value={form.displayName}
          onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
          disabled={!canManage}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-400"
        />
      </label>

      <label className="space-y-1.5 text-xs font-semibold text-slate-600">
        Display Order
        <input
          type="number"
          value={form.order}
          onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
          disabled={!canManage}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-400"
        />
      </label>

      <label className="space-y-1.5 text-xs font-semibold text-slate-600 md:col-span-2">
        Description
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          disabled={!canManage}
          rows={2}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-400"
        />
      </label>

      <label className="space-y-1.5 text-xs font-semibold text-slate-600 md:col-span-2">
        Image URL
        <input
          value={form.image}
          onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
          disabled={!canManage}
          placeholder="https://..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-400"
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          disabled={!canManage}
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        Active in public catalog
      </label>

      {canManage && (
        <Button type="submit" disabled={saving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white md:justify-self-end">
          <Save size={15} />
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      )}
    </form>
  );
}

function RawKey({ value, displayName }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs text-slate-500">Raw Key: {value}</span>
      {displayName !== value && (
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          Display Name: {displayName}
        </span>
      )}
    </div>
  );
}

export default function FamiliesControlPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);

  async function loadFamilies() {
    setLoading(true);
    try {
      const response = await getFamilies({ isAdmin: true });
      setFamilies(response?.data?.families || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load Families');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFamilies();
  }, []);

  return (
    <section className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/70 p-6 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              <Settings2 size={16} /> Catalog structure
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Families Control</h1>
            <p className="mt-2 text-sm text-slate-500">
              Membership is derived from Product Family and the first two Product ID characters.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={loadFamilies} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </header>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-3xl bg-white" />
            ))}
          </div>
        ) : families.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Package className="mx-auto text-slate-300" size={36} />
            <h2 className="mt-3 font-semibold text-slate-900">No derived Families yet</h2>
            <p className="mt-1 text-sm text-slate-500">Add Products with a Family and a Product ID of at least two characters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {families.map((family) => (
              <details key={family.key} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                      <h2 className="truncate text-lg font-semibold text-slate-950">{family.displayName}</h2>
                      {!family.isActive && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">Inactive</span>}
                    </div>
                    <div className="ml-7 mt-1"><RawKey value={family.key} displayName={family.displayName} /></div>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    {family.productCount} {family.productCount === 1 ? 'product' : 'products'}
                  </span>
                </summary>

                <div className="space-y-5 border-t border-slate-100 p-5 sm:p-6">
                  <ConfigEditor
                    key={`${family.key}-${family.displayName}-${family.order}-${family.isActive}`}
                    entry={family}
                    label="Family"
                    canManage={canManage}
                    onSave={async (data) => {
                      await updateFamilyConfig(family.key, data);
                      await loadFamilies();
                    }}
                  />

                  <div className="space-y-3 pl-2 sm:pl-6">
                    {family.subFamilies.map((subFamily) => (
                      <details key={subFamily.key} className="group/sub overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <ChevronRight size={16} className="shrink-0 text-slate-400 transition-transform group-open/sub:rotate-90" />
                              <h3 className="truncate font-semibold text-slate-900">{subFamily.displayName}</h3>
                              {!subFamily.isActive && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">Inactive</span>}
                            </div>
                            <div className="ml-6 mt-1"><RawKey value={subFamily.key} displayName={subFamily.displayName} /></div>
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-slate-500">{subFamily.productCount} products</span>
                        </summary>

                        <div className="space-y-4 border-t border-slate-100 p-4">
                          <ConfigEditor
                            key={`${family.key}-${subFamily.key}-${subFamily.displayName}-${subFamily.order}-${subFamily.isActive}`}
                            entry={subFamily}
                            label="Sub Family"
                            canManage={canManage}
                            onSave={async (data) => {
                              await updateSubFamilyConfig(family.key, subFamily.key, data);
                              await loadFamilies();
                            }}
                          />

                          <div className="overflow-hidden rounded-xl border border-slate-200">
                            {(subFamily.products || []).map((product) => (
                              <div key={product.serialNumber} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-900">{product.name || 'Unnamed Product'}</p>
                                  <p className="font-mono text-xs text-slate-500">{product.productId}</p>
                                </div>
                                {canManage && (
                                  <Link
                                    to={`${SANWATERGROUPROUTES.products.edit.fullPath}?serialNumber=${encodeURIComponent(product.serialNumber)}`}
                                    className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800"
                                  >
                                    Edit Product
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
