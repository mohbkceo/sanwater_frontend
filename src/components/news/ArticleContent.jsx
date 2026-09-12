import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Package } from "lucide-react";
import { CONTACTSALES, PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";
import { trackCustomEvent } from "@/services/analytics/analytics";

export default function ArticleContent({ article, preview = false }) {
  const safeHtml = DOMPurify.sanitize(article?.content || "", { USE_PROFILES: { html: true } });
  const products = article?.relatedProducts || [];
  const displayDate = article?.publishedAt || article?.createdAt;
  return <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
    {article?.coverImage && <img src={article.coverImage} alt={article.title || "Article cover"} className="max-h-[520px] w-full object-cover" />}
    <div className="p-6 sm:p-10 lg:p-12">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
        {article?.category && <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">{article.category}</span>}
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{displayDate ? new Date(displayDate).toLocaleDateString() : "Unscheduled"}</span>
        {article?.author && <span>By {article.author}</span>}
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{article?.title || "Untitled article"}</h1>
      {article?.excerpt && <p className="mt-5 text-lg leading-8 text-slate-500">{article.excerpt}</p>}
      <div className="prose prose-slate mt-10 max-w-none text-slate-700 [&_a]:text-blue-600 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-5 [&_h2]:mt-10 [&_img]:rounded-2xl" dangerouslySetInnerHTML={{ __html: safeHtml }} />
      {article?.tags?.length > 0 && <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">#{tag}</span>)}</div>}
    </div>
    {products.length > 0 && <section className="border-t border-slate-200 bg-slate-50 p-6 sm:p-10">
      <div className="flex items-center gap-2"><Package className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold">Related Products</h2></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => {
        const href = PRODUCTVIEWDETAIL.replace(":serialNumber", product.serialNumber);
        return <Link key={product._id} to={href} onClick={() => !preview && trackCustomEvent("article_product_clicked", { article_id: article._id, article_slug: article.slug, product_id: product._id, product_serial: product.serialNumber, page: window.location.pathname })} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {product.gallery?.[0] && <img src={product.gallery[0]} alt={product.name} className="h-36 w-full object-cover" />}
          <div className="p-4"><h3 className="font-bold group-hover:text-blue-600">{product.name || product.serialNumber}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.shortDescription}</p></div>
        </Link>;
      })}</div>
    </section>}
    <section className="m-6 rounded-3xl bg-blue-600 p-6 text-white sm:m-10 sm:flex sm:items-center sm:justify-between">
      <div><h2 className="text-xl font-bold">Need help choosing a solution?</h2><p className="mt-1 text-sm text-blue-100">Our sales team can help with products, quantities and quotations.</p></div>
      <Link to={CONTACTSALES} onClick={() => !preview && trackCustomEvent("article_contact_clicked", { article_id: article._id, article_slug: article.slug, page: window.location.pathname })} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-700 sm:mt-0">Contact Sales <ArrowRight className="h-4 w-4" /></Link>
    </section>
  </article>;
}
