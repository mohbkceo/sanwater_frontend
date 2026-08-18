import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCollection, updateCollection, getCollection } from '@/services/products/collectionServices';
import { Loader, ChevronLeft } from 'lucide-react';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';

const emptyForm = {
    name: '',
    description: '',
    image: '',
    isActive: true,
    seo: { title: '', description: '', canonicalUrl: '', ogImage: '', noIndex: false },
};

const CreateEditCollectionPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!slug);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        if (slug) fetchCollection();
    }, [slug]);

    const fetchCollection = async () => {
        try {
            setLoading(true);
            const response = await getCollection(slug);
            const collection = response.data.collection;
            setFormData({
                ...emptyForm,
                ...collection,
                seo: { ...emptyForm.seo, ...(collection.seo || {}) },
            });
            setError(null);
        } catch (err) {
            setError('Failed to load collection');
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
        setFormData((prev) => ({ ...prev, seo: { ...prev.seo, [name]: type === 'checkbox' ? checked : value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = { ...formData };
            delete payload._id;
            delete payload.slug;
            delete payload.featuredProducts;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.__v;

            if (slug) {
                await updateCollection(slug, payload);
            } else {
                await createCollection(payload);
            }
            navigate(SANWATERGROUPROUTES.products.collections.list.fullPath);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save collection');
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
                        onClick={() => navigate(SANWATERGROUPROUTES.products.collections.list.fullPath)}
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded transition"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{slug ? 'Edit Collection' : 'Create Collection'}</h1>
                        <p className="mt-2 text-slate-600">Only create a collection that reflects a real SANWATER product range.</p>
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
                            placeholder="e.g. Collection 2026"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                            {submitting ? 'Saving...' : slug ? 'Update Collection' : 'Create Collection'}
                        </button>
                        <button type="button" onClick={() => navigate(SANWATERGROUPROUTES.products.collections.list.fullPath)} className="flex-1 px-6 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEditCollectionPage;
