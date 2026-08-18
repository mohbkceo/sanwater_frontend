import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '@/services/products/categoryServices';
import { Trash2, Edit, Plus, Loader, FolderTree } from 'lucide-react';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/configs/permissions';

// Flattens the nested (category -> subcategories) tree the API returns into
// rows for the table, indenting subcategories under their parent.
const flattenCategories = (categories) => {
    const rows = [];
    categories.forEach((category) => {
        rows.push({ ...category, depth: 0 });
        (category.subcategories || []).forEach((sub) => {
            rows.push({ ...sub, depth: 1 });
        });
    });
    return rows;
};

const CategoriesManagementPage = () => {
    const { can } = usePermissions();
    const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategories({ isAdmin: true });
            setCategories(response.data.categories || []);
            setError(null);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(slug);
                fetchCategories();
            } catch (err) {
                alert(err?.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const rows = flattenCategories(categories);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
                        <p className="mt-2 text-slate-600">Manage the product category hierarchy used across the catalogue</p>
                    </div>
                    {canManage ? (
                        <Link
                            to={SANWATERGROUPROUTES.products.categories.create.fullPath}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                        >
                            <Plus size={20} />
                            Create Category
                        </Link>
                    ) : null}
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="animate-spin text-slate-900" size={40} />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8">
                        {error}
                    </div>
                )}

                {!loading && rows.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Slug</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((category) => (
                                    <tr key={category._id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                            <span style={{ paddingLeft: `${category.depth * 24}px` }} className="inline-flex items-center gap-2">
                                                {category.depth > 0 && <FolderTree size={14} className="text-slate-400" />}
                                                {category.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{category.slug}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm flex gap-2">
                                            {canManage ? (
                                                <Link
                                                    to={`${SANWATERGROUPROUTES.products.categories.edit.fullPath}/${category.slug}`}
                                                    className="p-2 text-slate-600 hover:bg-slate-200 rounded transition"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                            ) : null}
                                            {canManage ? (
                                                <button
                                                    onClick={() => handleDelete(category.slug)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && rows.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-lg text-slate-600">No categories yet</p>
                        <p className="text-sm text-slate-400 mt-1">Create the real SANWATER product categories here before assigning them to products.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesManagementPage;
