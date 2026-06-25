import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNewsArticles } from '@/services/newsServices';
import { useTranslation } from '@/lib/i18n';
import MainLayout from '@/layouts/MainLayout';
import SEO from '@/components/SEO';
import { ChevronRight, Search, Loader } from 'lucide-react';

const NewsListingPage = () => {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [featured, setFeatured] = useState(false);

    const limit = 10;

    useEffect(() => {
        fetchNews();
    }, [currentPage, searchTerm, category, featured]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit,
                ...(searchTerm && { search: searchTerm }),
                ...(category && { category }),
                ...(featured && { featured: 'true' })
            };
            const response = await getNewsArticles(params);
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

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchNews();
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        setCurrentPage(1);
    };

    const handleFeaturedToggle = () => {
        setFeatured(!featured);
        setCurrentPage(1);
    };

    return (
        <MainLayout>
            <SEO 
                title={t('news.seo_title') || 'Latest News'}
                description={t('news.seo_description') || 'Stay updated with the latest news from SanWater'}
                url={window.location.href}
            />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
                            {t('news.title') || 'Latest News'}
                        </h1>
                        <p className="mt-4 text-lg text-slate-600">
                            {t('news.description') || 'Stay updated with our latest news and announcements'}
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('news.search_placeholder') || 'Search news...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                            >
                                {t('news.search') || 'Search'}
                            </button>
                        </form>

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={handleFeaturedToggle}
                                className={`px-4 py-2 rounded-lg transition ${
                                    featured
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                                }`}
                            >
                                {t('news.featured') || 'Featured'}
                            </button>
                        </div>
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

                    {/* News Grid */}
                    {!loading && news.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                            {news.map((article) => (
                                <Link
                                    key={article._id}
                                    to={`/news/${article.slug}`}
                                    className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {article.coverImage && (
                                        <div className="relative h-48 overflow-hidden bg-slate-200">
                                            <img
                                                src={article.coverImage}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {article.isFeatured && (
                                                <div className="absolute top-3 right-3 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                    {t('news.featured') || 'Featured'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-5">
                                        {article.category && (
                                            <span className="inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full mb-3">
                                                {article.category}
                                            </span>
                                        )}
                                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 line-clamp-2">
                                            {article.title}
                                        </h3>
                                        {article.excerpt && (
                                            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                                                {article.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                            <span>
                                                {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                                            </span>
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && news.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-lg text-slate-600">
                                {t('news.no_articles') || 'No news articles found'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('news.previous') || 'Previous'}
                            </button>
                            <span className="text-slate-600">
                                {t('news.page') || 'Page'} {currentPage} {t('news.of') || 'of'} {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('news.next') || 'Next'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default NewsListingPage;
