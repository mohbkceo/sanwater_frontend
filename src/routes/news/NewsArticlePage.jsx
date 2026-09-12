import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/SEO";
import ArticleContent from "@/components/news/ArticleContent";
import { getNewsArticleBySlug } from "@/services/newsServices";
import { trackCustomEvent } from "@/services/analytics/analytics";

export default function NewsArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const progressSent = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
      return getNewsArticleBySlug(slug);
    }).then((response) => {
      if (!active) return;
      setArticle(response?.data || null);
      setError("");
      if (response?.data) trackCustomEvent("article_view", { article_id: response.data._id, article_slug: response.data.slug, page: window.location.pathname });
    }).catch((err) => active && setError(err?.response?.data?.message || "Article not found")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    progressSent.current = false;
    const onScroll = () => {
      if (!article || progressSent.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.75) {
        progressSent.current = true;
        trackCustomEvent("article_reading_progress", { article_id: article._id, article_slug: article.slug, progress: 75, page: window.location.pathname });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [article]);

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: article.title, text: article.excerpt, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied."); }
    } catch { /* user cancelled */ }
  }

  return <MainLayout bg="bg-[#F5F8FC]">
    {article && <SEO title={article.seoTitle || article.title} description={article.seoDescription || article.excerpt} image={article.coverImage} url={article.canonicalUrl || window.location.href} article={article} />}
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between"><Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ChevronLeft className="h-4 w-4" />Back to News</Link>{article && <button onClick={share} className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold"><Share2 className="h-4 w-4" />Share</button>}</div>
      {loading ? <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : error || !article ? <div className="rounded-3xl border bg-white p-16 text-center"><h1 className="text-2xl font-bold">{error || "Article not found"}</h1><p className="mt-2 text-slate-500">This article may be unpublished, scheduled, or archived.</p></div> : <ArticleContent article={article} />}
    </main>
  </MainLayout>;
}
