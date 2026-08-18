import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCategory, updateCategory, getCategory, getCategories } from '@/services/products/categoryServices';
import { Loader, ChevronLeft } from 'lucide-react';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';

const emptyForm = {
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    applications: [],
    isActive: true,
    seo: { title: '', description: '', canonicalUrl: '', ogImage: '', noIndex: false },
};

const CreateEditCategoryPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!slug);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [parentOptions, setParentOptions] = useState([]);
    const [applicationInput, setApplicationInput] = useState('');

    useEffect(() => {
        fetchParentOptions();
        if (slug) fetchCategory();
    }, [slug]);

    const fetchParentOptions = async () => {
        try {
            const response = await getCategories({ isAdmin: true });
            // Only top-level categories can be a parent (keeps the hierarchy to
            // two levels: category / subcategory).
            setParentOptions(response.data.categories || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await getCategory(slug);
            const category = response.data.category;
            setFormData({
                ...emptyForm,
                ...category,
                parentCategory: category.parentCategory?._id || category.parentCategory || '',
                seo: { ...emptyForm.seo, ...(category.seo || {}) },
            });
            setError(null);
        } catch (err) {
            setError('Failed to load category');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSeoChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            seo: { ...prev.seo, [name]: type === 'checkbox' ? checked : value },
        }));
    };

    const addApplication = () => {
        if (applicationInput.trim() && !formData.applications.includes(applicationInput.trim())) {
            setFormData((prev) => ({ ...prev, applications: [...prev.applications, applicationInput.trim()] }));
            setApplicationInput('');
        }
    };

    const removeApplication = (value) => {
        setFormData((prev) => ({ ...prev, applications: prev.applications.filter((a) => a !== value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                parentCategory: formData.parentCategory || null,
            };
            delete payload._id;
            delete payload.slug;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.__v;

            if (slug) {
                await updateCategory(slug, payload);
            } else {
                await createCategory(payload);
            }
            navigate(SANWATERGROUPROUTES.products.categories.list.fullPath);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save category');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader className="animate-spin text-slate-900" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate(SANWATERGROUPROUTES.products.categories.list.fullPath)}
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded transition"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{slug ? 'Edit Category' : 'Create Category'}</h1>
                        <p className="mt-2 text-slate-600">Categories power /produits navigation, filtering and breadcrumbs.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            placeholder="e.g. Robinetterie"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Parent category</label>
                        <select
                            name="parentCategory"
                            value={formData.parentCategory}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                            <option value="">None (top-level category)</option>
                            {parentOptions
                                .filter((c) => c.slug !== slug)
                                .map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Set this to make it a subcategory.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            placeholder="Human-readable introduction shown on the category page"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Image URL</label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Applications</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={applicationInput}
                                onChange={(e) => setApplicationInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                placeholder="e.g. Hôtellerie, Résidentiel"
                            />
                            <button type="button" onClick={addApplication} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.applications.map((app) => (
                                <span key={app} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-900 rounded-full text-sm">
                                    {app}
                                    <button type="button" onClick={() => removeApplication(app)} className="text-slate-600 hover:text-slate-900">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 rounded" />
                        <label className="text-sm font-semibold text-slate-900">Active (visible on the public site)</label>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">SEO Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">SEO Title</label>
                                <input type="text" name="title" value={formData.seo.title || ''} onChange={handleSeoChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">SEO Description</label>
                                <textarea name="description" value={formData.seo.description || ''} onChange={handleSeoChange} rows="2" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="noIndex" checked={formData.seo.noIndex} onChange={handleSeoChange} className="w-4 h-4 rounded" />
                                <label className="text-sm font-semibold text-slate-900">Hide from search engines (noindex)</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                        <button type="submit" disabled={submitting} className="flex-1 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50">
                            {submitting ? 'Saving...' : slug ? 'Update Category' : 'Create Category'}
                        </button>
                        <button type="button" onClick={() => navigate(SANWATERGROUPROUTES.products.categories.list.fullPath)} className="flex-1 px-6 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEditCategoryPage;
