import React, { useEffect, useMemo, useState } from 'react';
import { contentAPI } from '@/services/baseAPIs';
import { Header } from '@/components';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Eye,
  MapPin,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  Sparkles,
  Loader2,
  Save,
  ChevronsUpDown,
} from 'lucide-react';

const EMPTY_FORM = {
  title: '',
  location: '',
  type: '',
  description: '',
  requirementsText: '',
  benefitsText: '',
  status: 'draft',
  publishDate: '',
};

const STATUS_META = {
  published: {
    label: 'Published',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  draft: {
    label: 'Draft',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  },
};

function splitLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function FieldLabel({ children }) {
  return <label className="mb-2 block text-sm font-medium text-slate-700">{children}</label>;
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${props.className || ''}`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${props.className || ''}`}
    />
  );
}

function Select({ className = '', ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${className}`}
    />
  );
}

function Modal({ open, title, children, onClose, widthClass = 'max-w-4xl' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className={`w-full ${widthClass} overflow-hidden rounded-3xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">Manage hiring post details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function HiringCard({ item, onEdit, onDelete, onPreview }) {
  const meta = STATUS_META[item.status] || STATUS_META.draft;

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
              {meta.label}
            </span>
            <span className="text-xs text-slate-400">{formatDate(item.publishDate)}</span>
          </div>
          <h3 className="mt-3 truncate text-lg font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} /> {item.location || '—'}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <Briefcase size={14} /> {item.type || '—'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onPreview(item)}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Preview"
        >
          <Eye size={18} />
        </button>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {item.description || 'No description provided.'}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(item.requirements || []).slice(0, 3).map((req, index) => (
          <span key={`${req}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {req}
          </span>
        ))}
        {(item.requirements || []).length > 3 ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            +{item.requirements.length - 3} more
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Updated:</span> {formatDate(item.updatedAt)}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Edit2 size={16} /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function HiringManagement() {
  const [hiring, setHiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('publishDate_desc');
  const [viewMode, setViewMode] = useState('grid');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchHiring = async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      const response = await contentAPI.get('/hiring');
      setHiring(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching hiring posts:', error);
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchHiring();
  }, []);

  const stats = useMemo(() => {
    const total = hiring.length;
    const published = hiring.filter((item) => item.status === 'published').length;
    const drafts = hiring.filter((item) => item.status === 'draft').length;
    const closed = hiring.filter((item) => item.status === 'closed').length;
    return { total, published, drafts, closed };
  }, [hiring]);

  const filteredHiring = useMemo(() => {
    const term = search.trim().toLowerCase();

    let data = hiring.filter((item) => {
      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
      const matchesSearch =
        !term ||
        [item.title, item.location, item.type, item.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });

    data = [...data].sort((a, b) => {
      if (sortBy === 'title_asc') return String(a.title || '').localeCompare(String(b.title || ''));
      if (sortBy === 'title_desc') return String(b.title || '').localeCompare(String(a.title || ''));
      if (sortBy === 'location_asc') return String(a.location || '').localeCompare(String(b.location || ''));
      if (sortBy === 'location_desc') return String(b.location || '').localeCompare(String(a.location || ''));
      if (sortBy === 'status_asc') return String(a.status || '').localeCompare(String(b.status || ''));
      if (sortBy === 'status_desc') return String(b.status || '').localeCompare(String(a.status || ''));
      return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
    });

    return data;
  }, [hiring, search, statusFilter, sortBy]);

  const openCreate = () => {
    setEditingItem(null);
    setFormError('');
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormError('');
    setForm({
      title: item.title || '',
      location: item.location || '',
      type: item.type || '',
      description: item.description || '',
      requirementsText: (item.requirements || []).join('\n'),
      benefitsText: (item.benefits || []).join('\n'),
      status: item.status || 'draft',
      publishDate: item.publishDate ? new Date(item.publishDate).toISOString().slice(0, 10) : '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setIsFormOpen(false);
    setEditingItem(null);
    setFormError('');
    setForm(EMPTY_FORM);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      type: form.type.trim(),
      description: form.description.trim(),
      requirements: splitLines(form.requirementsText),
      benefits: splitLines(form.benefitsText),
      status: form.status,
      ...(form.publishDate ? { publishDate: new Date(form.publishDate).toISOString() } : {}),
    };

    if (!payload.title || !payload.location || !payload.type || !payload.description) {
      setFormError('Please fill in title, location, type, and description.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem?._id) {
        await contentAPI.put(`/hiring/${editingItem._id}`, payload);
      } else {
        await contentAPI.post('/hiring', payload);
      }
      await fetchHiring(true);
      closeForm();
    } catch (error) {
      console.error('Error saving hiring post:', error);
      setFormError(error?.response?.data?.message || 'Failed to save hiring post.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (item) => setDeleteItem(item);

  const handleDelete = async () => {
    if (!deleteItem?._id) return;
    try {
      setSubmitting(true);
      await contentAPI.delete(`/hiring/${deleteItem._id}`);
      await fetchHiring(true);
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting hiring post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Header title="Hiring Management" />
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Create, organize, and publish job posts with a cleaner workflow and richer controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fetchHiring(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Loader2 size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={16} /> New Job Post
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Posts" value={stats.total} icon={<Sparkles size={18} />} />
        <StatCard title="Published" value={stats.published} icon={<CheckCircle2 size={18} />} />
        <StatCard title="Drafts" value={stats.drafts} icon={<FileText size={18} />} />
        <StatCard title="Closed" value={stats.closed} icon={<CalendarDays size={18} />} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, type, or description..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative min-w-[160px]">
              <Filter size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-11">
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </Select>
            </div>

            <div className="relative min-w-[180px]">
              <ChevronsUpDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pl-11">
                <option value="publishDate_desc">Newest first</option>
                <option value="title_asc">Title A → Z</option>
                <option value="title_desc">Title Z → A</option>
                <option value="location_asc">Location A → Z</option>
                <option value="location_desc">Location Z → A</option>
                <option value="status_asc">Status A → Z</option>
                <option value="status_desc">Status Z → A</option>
              </Select>
            </div>

            <div className="col-span-2 flex items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center p-10 text-slate-500">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Loader2 size={18} className="animate-spin" /> Loading hiring posts...
            </div>
          </div>
        ) : filteredHiring.length === 0 ? (
          <EmptyState onCreate={openCreate} hasFilters={Boolean(search || statusFilter !== 'all')} />
        ) : viewMode === 'grid' ? (
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredHiring.map((item) => (
              <HiringCard
                key={item._id}
                item={item}
                onEdit={openEdit}
                onDelete={confirmDelete}
                onPreview={setPreviewItem}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Title</Th>
                  <Th>Location</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Publish Date</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredHiring.map((item) => {
                  const meta = STATUS_META[item.status] || STATUS_META.draft;
                  return (
                    <tr key={item._id} className="transition hover:bg-slate-50/80">
                      <Td>
                        <div>
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="mt-1 line-clamp-1 max-w-[420px] text-sm text-slate-500">
                            {item.description}
                          </div>
                        </div>
                      </Td>
                      <Td>{item.location}</Td>
                      <Td>{item.type}</Td>
                      <Td>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                          {meta.label}
                        </span>
                      </Td>
                      <Td>{formatDate(item.publishDate)}</Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Preview"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit"
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(item)}
                            className="rounded-xl p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={isFormOpen} onClose={closeForm} title={editingItem ? 'Edit Job Post' : 'Create Job Post'}>
        <form onSubmit={submitForm} className="space-y-5">
          {formError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel>Title</FieldLabel>
              <TextInput
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Frontend Developer"
              />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <TextInput
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Remote / Algiers / Hybrid"
              />
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <TextInput
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="Full-time / Part-time / Contract"
              />
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <Select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Publish Date</FieldLabel>
              <TextInput
                type="date"
                value={form.publishDate}
                onChange={(e) => setForm((prev) => ({ ...prev, publishDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <TextArea
              rows={6}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Write a detailed job description..."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <FieldLabel>Requirements</FieldLabel>
              <TextArea
                rows={8}
                value={form.requirementsText}
                onChange={(e) => setForm((prev) => ({ ...prev, requirementsText: e.target.value }))}
                placeholder="One requirement per line"
              />
              <p className="mt-2 text-xs text-slate-500">Each line becomes one requirement item.</p>
            </div>
            <div>
              <FieldLabel>Benefits</FieldLabel>
              <TextArea
                rows={8}
                value={form.benefitsText}
                onChange={(e) => setForm((prev) => ({ ...prev, benefitsText: e.target.value }))}
                placeholder="One benefit per line"
              />
              <p className="mt-2 text-xs text-slate-500">Each line becomes one benefit item.</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {submitting ? 'Saving...' : 'Save Job Post'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(previewItem)} onClose={() => setPreviewItem(null)} title="Job Preview" widthClass="max-w-5xl">
        {previewItem ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_META[previewItem.status]?.className || STATUS_META.draft.className}`}>
                  {STATUS_META[previewItem.status]?.label || previewItem.status}
                </div>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">{previewItem.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><MapPin size={15} /> {previewItem.location}</span>
                  <span className="inline-flex items-center gap-2"><Briefcase size={15} /> {previewItem.type}</span>
                  <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> {formatDate(previewItem.publishDate)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h4>
              <p className="whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {previewItem.description}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Requirements</h4>
                <ul className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  {(previewItem.requirements || []).length ? (
                    previewItem.requirements.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">No requirements added.</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Benefits</h4>
                <ul className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  {(previewItem.benefits || []).length ? (
                    previewItem.benefits.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">No benefits added.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)} title="Delete Job Post" widthClass="max-w-xl">
        <div className="space-y-5">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            This action will permanently remove <span className="font-semibold">{deleteItem?.title}</span>.
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteItem(null)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate, hasFilters }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-full bg-slate-100 p-4 text-slate-700">
        <Briefcase size={28} />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">
        {hasFilters ? 'No job posts match your filters' : 'No job posts yet'}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {hasFilters
          ? 'Try changing the search, status filter, or sorting option.'
          : 'Create your first hiring post to start publishing jobs.'}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        <Plus size={16} /> Create Job Post
      </button>
    </div>
  );
}

function Th({ children, align = 'left' }) {
  return (
    <th className={`px-6 py-4 text-${align} text-xs font-semibold uppercase tracking-wider text-slate-500`}>
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }) {
  return <td className={`px-6 py-4 text-sm text-slate-700 ${align === 'right' ? 'text-right' : ''}`}>{children}</td>;
}

export default HiringManagement;
