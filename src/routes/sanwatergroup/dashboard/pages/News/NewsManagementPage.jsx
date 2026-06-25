import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminNewsArticles, deleteNewsArticle, updateNewsArticle } from '@/services/newsServices';
import { useTranslation } from '@/lib/i18n';
import { Trash2, Edit, Eye, Plus, Loader, Search } from 'lucide-react';
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';

const NewsManagementPage = () => {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const limit = 10;

    useEffect(() => {
        fetchNews();
    }, [currentPage, statusFilter]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit,
                ...(statusFilter && { status: statusFilter })
            };
            const response = await getAdminNewsArticles(params);
            setNews(response.data.news || []);
            setTotalPages(response.data.totalPages || 1);
            setError(null);
        } catch (err) {
            setError('Failed to load news articles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await deleteNewsArticle(id);
                fetchNews();
            } catch (err) {
                alert('Failed to delete article');
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateNewsArticle(id, { status: newStatus });
            fetchNews();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">News Management</h1>
                        <p className="mt-2 text-slate-600">Manage all your news articles</p>
                    </div>
                    <Link
                        to={SANWATERGROUPROUTES.content.children.news.fullPath + '/create'}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                    >
                        <Plus size={20} />
                        Create News
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="animate-spin text-slate-900" size={40} />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8">
                        {error}
                    </div>
                )}

                {/* News Table */}
                {!loading && news.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Published</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map((article) => (
                                    <tr key={article._id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{article.title}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <select
                                                value={article.status}
                                                onChange={(e) => handleStatusChange(article._id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    article.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : article.status === 'scheduled'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="scheduled">Scheduled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{article.category || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {article.publishedAt
                                                ? new Date(article.publishedAt).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm flex gap-2">
                                            <Link
                                                to={`${SANWATERGROUPROUTES.content.children.news.fullPath}/edit/${article._id}`}
                                                className="p-2 text-slate-600 hover:bg-slate-200 rounded transition"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <a
                                                href={`/news/${article.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-600 hover:bg-slate-200 rounded transition"
                                            >
                                                <Eye size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(article._id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty State */}
                {!loading && news.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-lg text-slate-600">No news articles found</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsManagementPage;
