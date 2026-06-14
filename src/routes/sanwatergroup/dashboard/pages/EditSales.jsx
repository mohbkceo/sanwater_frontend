import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  GripVertical,
  Phone,
  MapPin,
  ExternalLink,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getPageContent,
  updatePageContent,
} from '@/services/contents/pageContent';

const SLUG = 'sales-contact';

const EMPTY_FORM = {
  slug: SLUG,
  mainTitle: '',
  subTitle: '',
  logo: '/logo-white.svg',
  contactSections: [],
  salesData: [],
};

function createEmptyPhone() {
  return { label: '', number: '' };
}

function createEmptyContactSection() {
  return {
    region: '',
    companies: [''],
    phones: [createEmptyPhone()],
    address: '',
    maps: '',
    gradient: 'from-cyan-500/20 to-blue-600/20',
  };
}

function createEmptySalesItem() {
  return {
    title: '',
    phones: [''],
  };
}

function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeForm(data) {
  return {
    slug: data?.slug || SLUG,
    mainTitle: data?.mainTitle || '',
    subTitle: data?.subTitle || '',
    logo: data?.logo || '/logo-white.svg',
    contactSections: safeArray(data?.contactSections).map((section) => ({
      region: section?.region || '',
      companies: safeArray(section?.companies, ['']).length
        ? safeArray(section?.companies, [''])
        : [''],
      phones: safeArray(section?.phones, [createEmptyPhone()]).length
        ? safeArray(section?.phones, [createEmptyPhone()]).map((phone) => ({
            label: phone?.label || '',
            number: phone?.number || '',
          }))
        : [createEmptyPhone()],
      address: section?.address || '',
      maps: section?.maps || '',
      gradient:
        section?.gradient || 'from-cyan-500/20 to-blue-600/20',
    })),
    salesData: safeArray(data?.salesData).map((item) => ({
      title: item?.title || '',
      phones: safeArray(item?.phones, ['']).length
        ? safeArray(item?.phones, [''])
        : [''],
    })),
  };
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function moveItem(array, from, to) {
  const next = [...array];
  if (from < 0 || to < 0 || from >= next.length || to >= next.length) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function SectionShell({ title, subtitle, children, action }) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.05)] md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-relaxed text-gray-500">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }) {
  return <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{children}</label>;
}

function TextInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={
        `w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${className}`
      }
    />
  );
}

function TextArea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={
        `min-h-[110px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${className}`
      }
    />
  );
}

function ActionButton({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-cyan-500 text-white hover:bg-cyan-600',
    subtle: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default function EditSalesPage() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [initialData, setInitialData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(true);

  const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(initialData), [formData, initialData]);

  const loadPage = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPageContent(SLUG);
      const normalized = normalizeForm(data);
      setFormData(normalized);
      setInitialData(deepClone(normalized));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load page content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (!success) return undefined;
    const t = setTimeout(() => setSuccess(''), 2500);
    return () => clearTimeout(t);
  }, [success]);

  const updateTopLevel = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateContactSection = (index, updater) => {
    setFormData((prev) => ({
      ...prev,
      contactSections: prev.contactSections.map((section, i) => (i === index ? updater(section) : section)),
    }));
  };

  const updateSalesItem = (index, updater) => {
    setFormData((prev) => ({
      ...prev,
      salesData: prev.salesData.map((item, i) => (i === index ? updater(item) : item)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = normalizeForm(formData);
      const saved = await updatePageContent(SLUG, payload);
      const normalized = normalizeForm(saved || payload);
      setFormData(normalized);
      setInitialData(deepClone(normalized));
      setSuccess('Page updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save page content.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(deepClone(initialData));
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-gray-900">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          <span className="text-sm font-medium text-gray-600">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-700 uppercase">
                CMS Editor
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">Edit Sales Contact Page</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                Manage the public page content, add or reorder sections, and save directly to MongoDB.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ActionButton variant="subtle" onClick={() => setPreview((v) => !v)}>
                {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {preview ? 'Hide Preview' : 'Show Preview'}
              </ActionButton>
              <ActionButton variant="subtle" onClick={handleReset} disabled={!isDirty || saving}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </ActionButton>
              <ActionButton onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </ActionButton>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className={`rounded-full px-3 py-1 ${isDirty ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isDirty ? 'Unsaved changes' : 'Synced'}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">Slug: {SLUG}</span>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}
        </div>

        <div className={`grid gap-6 ${preview ? 'xl:grid-cols-[1.15fr_0.85fr]' : 'grid-cols-1'}`}>
          <div className="space-y-6">
            <SectionShell title="Page Identity" subtitle="These fields appear at the top of the public page.">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Main title</FieldLabel>
                  <TextInput
                    value={formData.mainTitle}
                    onChange={(e) => updateTopLevel('mainTitle', e.target.value)}
                    placeholder="Contactez notre équipe"
                  />
                </div>
                <div>
                  <FieldLabel>Logo path</FieldLabel>
                  <TextInput
                    value={formData.logo}
                    onChange={(e) => updateTopLevel('logo', e.target.value)}
                    placeholder="/logo-white.svg"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Subtitle</FieldLabel>
                  <TextArea
                    value={formData.subTitle}
                    onChange={(e) => updateTopLevel('subTitle', e.target.value)}
                    placeholder="Nos bureaux et équipes commerciales sont disponibles..."
                  />
                </div>
              </div>
            </SectionShell>

            <SectionShell
              title="Office Sections"
              subtitle="Each block represents one regional office card on the public page."
              action={
                <ActionButton
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      contactSections: [...prev.contactSections, createEmptyContactSection()],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add office
                </ActionButton>
              }
            >
              <div className="space-y-5">
                {formData.contactSections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                    No office sections yet. Add one to start building the page.
                  </div>
                ) : null}

                {formData.contactSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Office #{sectionIndex + 1}</h3>
                          <p className="text-xs text-gray-500">Reorder, edit, or remove this block.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <ActionButton
                          variant="ghost"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              contactSections: moveItem(prev.contactSections, sectionIndex, sectionIndex - 1),
                            }))
                          }
                          disabled={sectionIndex === 0}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton
                          variant="ghost"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              contactSections: moveItem(prev.contactSections, sectionIndex, sectionIndex + 1),
                            }))
                          }
                          disabled={sectionIndex === formData.contactSections.length - 1}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              contactSections: prev.contactSections.filter((_, i) => i !== sectionIndex),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </ActionButton>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <FieldLabel>Region</FieldLabel>
                        <TextInput
                          value={section.region}
                          onChange={(e) =>
                            updateContactSection(sectionIndex, (current) => ({ ...current, region: e.target.value }))
                          }
                          placeholder="Algiers (Central)"
                        />
                      </div>

                      <div>
                        <FieldLabel>Gradient class</FieldLabel>
                        <TextInput
                          value={section.gradient}
                          onChange={(e) =>
                            updateContactSection(sectionIndex, (current) => ({ ...current, gradient: e.target.value }))
                          }
                          placeholder="from-cyan-500/20 to-blue-600/20"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FieldLabel>Address</FieldLabel>
                        <TextArea
                          value={section.address}
                          onChange={(e) =>
                            updateContactSection(sectionIndex, (current) => ({ ...current, address: e.target.value }))
                          }
                          placeholder="Cité Freri 02 El - Hamiz D.E.B, Algiers"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FieldLabel>Google Maps URL</FieldLabel>
                        <TextInput
                          value={section.maps}
                          onChange={(e) =>
                            updateContactSection(sectionIndex, (current) => ({ ...current, maps: e.target.value }))
                          }
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Companies</h4>
                          <ActionButton
                            variant="subtle"
                            className="px-3 py-2 text-xs"
                            onClick={() =>
                              updateContactSection(sectionIndex, (current) => ({
                                ...current,
                                companies: [...current.companies, ''],
                              }))
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </ActionButton>
                        </div>

                        <div className="space-y-3">
                          {section.companies.map((company, companyIndex) => (
                            <div key={companyIndex} className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                              <TextInput
                                value={company}
                                onChange={(e) =>
                                  updateContactSection(sectionIndex, (current) => {
                                    const next = [...current.companies];
                                    next[companyIndex] = e.target.value;
                                    return { ...current, companies: next };
                                  })
                                }
                                placeholder="Company name"
                              />
                              <ActionButton
                                variant="ghost"
                                className="px-3 py-3"
                                onClick={() =>
                                  updateContactSection(sectionIndex, (current) => ({
                                    ...current,
                                    companies: current.companies.filter((_, i) => i !== companyIndex),
                                  }))
                                }
                                disabled={section.companies.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </ActionButton>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Phones</h4>
                          <ActionButton
                            variant="subtle"
                            className="px-3 py-2 text-xs"
                            onClick={() =>
                              updateContactSection(sectionIndex, (current) => ({
                                ...current,
                                phones: [...current.phones, createEmptyPhone()],
                              }))
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </ActionButton>
                        </div>

                        <div className="space-y-3">
                          {section.phones.map((phone, phoneIndex) => (
                            <div key={phoneIndex} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                              <TextInput
                                value={phone.label}
                                onChange={(e) =>
                                  updateContactSection(sectionIndex, (current) => {
                                    const next = [...current.phones];
                                    next[phoneIndex] = { ...next[phoneIndex], label: e.target.value };
                                    return { ...current, phones: next };
                                  })
                                }
                                placeholder="Label"
                              />
                              <TextInput
                                value={phone.number}
                                onChange={(e) =>
                                  updateContactSection(sectionIndex, (current) => {
                                    const next = [...current.phones];
                                    next[phoneIndex] = { ...next[phoneIndex], number: e.target.value };
                                    return { ...current, phones: next };
                                  })
                                }
                                placeholder="Phone number"
                              />
                              <ActionButton
                                variant="ghost"
                                className="px-3 py-3"
                                onClick={() =>
                                  updateContactSection(sectionIndex, (current) => ({
                                    ...current,
                                    phones: current.phones.filter((_, i) => i !== phoneIndex),
                                  }))
                                }
                                disabled={section.phones.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </ActionButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>

            <SectionShell
              title="Sales Blocks"
              subtitle="These blocks show commercial contact numbers for wholesale and retail."
              action={
                <ActionButton
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      salesData: [...prev.salesData, createEmptySalesItem()],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add sales block
                </ActionButton>
              }
            >
              <div className="space-y-5">
                {formData.salesData.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                    No sales blocks yet.
                  </div>
                ) : null}

                {formData.salesData.map((item, itemIndex) => (
                  <div key={itemIndex} className="rounded-3xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Sales Block #{itemIndex + 1}</h3>
                          <p className="text-xs text-gray-500">Move or remove this card.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <ActionButton
                          variant="ghost"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              salesData: moveItem(prev.salesData, itemIndex, itemIndex - 1),
                            }))
                          }
                          disabled={itemIndex === 0}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton
                          variant="ghost"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              salesData: moveItem(prev.salesData, itemIndex, itemIndex + 1),
                            }))
                          }
                          disabled={itemIndex === formData.salesData.length - 1}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              salesData: prev.salesData.filter((_, i) => i !== itemIndex),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </ActionButton>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <FieldLabel>Title</FieldLabel>
                        <TextInput
                          value={item.title}
                          onChange={(e) =>
                            updateSalesItem(itemIndex, (current) => ({ ...current, title: e.target.value }))
                          }
                          placeholder="Commercialisation en gros"
                        />
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <FieldLabel>Phone numbers</FieldLabel>
                          <ActionButton
                            variant="subtle"
                            className="px-3 py-2 text-xs"
                            onClick={() =>
                              updateSalesItem(itemIndex, (current) => ({
                                ...current,
                                phones: [...current.phones, ''],
                              }))
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add phone
                          </ActionButton>
                        </div>

                        <div className="space-y-3">
                          {item.phones.map((phone, phoneIndex) => (
                            <div key={phoneIndex} className="grid gap-2 md:grid-cols-[1fr_auto]">
                              <TextInput
                                value={phone}
                                onChange={(e) =>
                                  updateSalesItem(itemIndex, (current) => {
                                    const next = [...current.phones];
                                    next[phoneIndex] = e.target.value;
                                    return { ...current, phones: next };
                                  })
                                }
                                placeholder="+213 ..."
                              />
                              <ActionButton
                                variant="ghost"
                                className="px-3 py-3"
                                onClick={() =>
                                  updateSalesItem(itemIndex, (current) => ({
                                    ...current,
                                    phones: current.phones.filter((_, i) => i !== phoneIndex),
                                  }))
                                }
                                disabled={item.phones.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </ActionButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>
          </div>

          {preview ? (
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <SectionShell title="Live Preview" subtitle="A simplified preview of the public page using current draft data.">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 w-28 opacity-90">
                      <img src={formData.logo} alt="Logo" className="w-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{formData.mainTitle || 'Untitled page'}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{formData.subTitle || 'Subtitle not set.'}</p>
                  </div>

                  <div className="space-y-4">
                    {formData.contactSections.map((item, idx) => (
                      <div key={idx} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{item.region || `Region ${idx + 1}`}</p>
                              <p className="text-xs text-gray-500">Office card</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                            <span>{item.address || 'Address not set'}</span>
                          </div>
                          {item.phones[0]?.number ? (
                            <div className="flex items-start gap-2">
                              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                              <span>{item.phones[0].number}</span>
                            </div>
                          ) : null}
                          {item.maps ? (
                            <div className="flex items-start gap-2 text-cyan-600">
                              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                              <span>Google Maps link set</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    {formData.salesData.map((item, idx) => (
                      <div key={idx} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-900">{item.title || `Sales block ${idx + 1}`}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          {item.phones.map((phone, phoneIdx) => (
                            <p key={phoneIdx}>{phone || 'Phone not set'}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionShell>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}