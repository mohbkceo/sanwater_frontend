import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsArticleBySlug, getNewsArticles } from '@/services/newsServices';
import { useTranslation } from '@/lib/i18n';
import MainLayout from '@/layouts/MainLayout';
import SEO from '@/components/SEO';
import { Loader, ChevronLeft, Share2 } from 'lucide-react';

const NewsArticlePage = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const response = await getNewsArticleBySlug(slug);
            const articleData = response.data;
            setArticle(articleData);

            if (articleData.category) {
                const relatedResponse = await getNewsArticles({
                    category: articleData.category,
                    limit: 3
                });
                setRelatedArticles(
                    relatedResponse.data.news.filter(
                        (item) => item._id !== articleData._id
                    )
                );
            }

            setError(null);
        } catch (err) {
            setError('Failed to load article');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                text: article?.excerpt,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center py-20">
                    <Loader className="animate-spin text-slate-900" size={40} />
                </div>
            </MainLayout>
        );
    }

    if (error || !article) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">
                                {error || 'Article not found'}
                            </h1>
                            <Link
                                to="/news"
                                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                            >
                                <ChevronLeft size={20} />
                                {t('news.back_to_list') || 'Back to News'}
                            </Link>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <SEO 
                title={article.seoTitle || article.title}
                description={article.seoDescription || article.excerpt}
                image={article.coverImage}
                url={article.canonicalUrl || window.location.href}
                article={article}
            />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
                        <Link to="/" className="hover:text-slate-900">
                            {t('common.home') || 'Home'}
                        </Link>
                        <span>/</span>
                        <Link to="/news" className="hover:text-slate-900">
                            {t('news.title') || 'News'}
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 font-medium truncate">
                            {article.title}
                        </span>
                    </div>

                    <Link
                        to="/news"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-8"
                    >
                        <ChevronLeft size={20} />
                        {t('news.back_to_list') || 'Back to News'}
                    </Link>

                    <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {article.coverImage && (
                            <div className="relative h-96 overflow-hidden bg-slate-200">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8 md:p-12">
                            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                                {article.category && (
                                    <span className="inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                        {article.category}
                                    </span>
                                )}
                                <span className="text-sm text-slate-600">
                                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                                        undefined,
                                        { year: 'numeric', month: 'long', day: 'numeric' }
                                    )}
                                </span>
                                {article.author && (
                                    <span className="text-sm text-slate-600">
                                        {t('news.by') || 'By'} {article.author}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl font-bold text-slate-900 mb-4">
                                {article.title}
                            </h1>

                            {article.excerpt && (
                                <p className="text-lg text-slate-600 mb-8 italic">
                                    {article.excerpt}
                                </p>
                            )}

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition mb-8"
                            >
                                <Share2 size={18} />
                                {t('news.share') || 'Share'}
                            </button>

                            <div className="prose prose-sm md:prose max-w-none mb-12">
                                <div
                                    className="text-slate-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            </div>

                            {article.tags && article.tags.length > 0 && (
                                <div className="pt-8 border-t border-slate-200">
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-block text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>

                    {relatedArticles.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">
                                {t('news.related_articles') || 'Related Articles'}
                            </h2>
                            <div className="grid gap-6 md:grid-cols-3">
                                {relatedArticles.map((relatedArticle) => (
                                    <Link
                                        key={relatedArticle._id}
                                        to={`/news/${relatedArticle.slug}`}
                                        className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        {relatedArticle.coverImage && (
                                            <div className="relative h-40 overflow-hidden bg-slate-200">
                                                <img
                                                    src={relatedArticle.coverImage}
                                                    alt={relatedArticle.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 line-clamp-2">
                                                {relatedArticle.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                                                {relatedArticle.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default NewsArticlePage;
