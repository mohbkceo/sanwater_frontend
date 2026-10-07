/* eslint-disable react-refresh/only-export-components */
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowRight, Package } from "lucide-react";
import { PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";
import { trackCustomEvent } from "@/services/analytics/analytics";
import { useTranslation } from "@/lib/i18n";
import { useId, useState } from "react";

export function parsePayload(raw) {
  try {
    const value = JSON.parse(decodeURIComponent(raw || ""));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}
export function safeUrl(value, internal = true) {
  if (typeof value !== "string" || value.length > 2000 || value.includes("\\") || Array.from(value).some((char) => char.charCodeAt(0) < 32)) return "";
  if (internal && value && !value.startsWith("//") && !/^[a-z][a-z\d+.-]*:/i.test(value) && !/\s/.test(value)) return value;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
export function youtubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const id = host === "youtu.be" ? url.pathname.slice(1) : ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host) ? (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : url.pathname === "/watch" ? url.searchParams.get("v") : "") : "";
    return /^[A-Za-z0-9_-]{11}$/.test(id || "") ? id : "";
  } catch { return ""; }
}

const widthClass = { normal: "max-w-2xl", wide: "max-w-4xl", full: "max-w-none" };
const calloutClass = { info: "border-blue-200 bg-blue-50 text-blue-950", tip: "border-slate-300 bg-slate-50 text-slate-900", warning: "border-amber-300 bg-amber-50 text-amber-950", success: "border-emerald-300 bg-emerald-50 text-emerald-950" };
const calloutIcon = { info: "ℹ", tip: "✦", warning: "!", success: "✓" };
const plain = (value) => typeof value === "string" || typeof value === "number" ? String(value) : "";

export function ContentBlock({ type, payload, videoId, width = "normal", caption = "", calloutType = "info", html = "", products = [], article, preview = false }) {
  const { t } = useTranslation();
  if (type === "youtube") {
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId || "")) return null;
    return <figure className={`my-8 w-full ${widthClass[width] || widthClass.normal} mx-auto`}>
      <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950"><iframe title={caption || t("admin.news.block_youtube")} src={`https://www.youtube-nocookie.com/embed/${videoId}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" /></div>
      {caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{caption}</figcaption>}
    </figure>;
  }
  if (type === "callout") return <aside className={`my-7 flex gap-3 rounded-2xl border p-5 ${calloutClass[calloutType] || calloutClass.info}`}><span aria-hidden="true" className="font-bold">{calloutIcon[calloutType] || "ℹ"}</span><div className="min-w-0 flex-1 [&_p]:mb-2 [&_p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: html }} /></aside>;
  if (!payload) return null;
  if (type === "gallery") {
    const images = (Array.isArray(payload.images) ? payload.images : []).filter((item) => safeUrl(item?.src, false)).slice(0, 20);
    return <div className={`my-8 grid gap-3 ${payload.layout === "three" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{images.map((item, index) => <figure key={index} className="min-w-0"><img src={safeUrl(item.src, false)} alt={plain(item.alt)} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />{plain(item.caption) && <figcaption className="mt-1 text-sm text-slate-500">{plain(item.caption)}</figcaption>}</figure>)}</div>;
  }
  if (type === "product") {
    const product = products.find((item) => String(item._id) === plain(payload.id));
    if (!product) return <div className="my-6 rounded-2xl border p-5 text-sm text-slate-500">{t("admin.news.block_product_unavailable")}</div>;
    const href = PRODUCTVIEWDETAIL.replace(":serialNumber", product.serialNumber);
    const productImage = safeUrl(product.gallery?.[0], false);
    return <Link to={href} onClick={() => !preview && trackCustomEvent("article_product_clicked", { article_id: article?._id, article_slug: article?.slug, product_id: product._id, product_serial: product.serialNumber, page: window.location.pathname })} className="my-6 flex max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white sm:flex-row">
      {productImage && <img src={productImage} alt={product.name || ""} loading="lazy" className="h-44 w-full object-cover sm:w-44" />}
      <span className="flex min-w-0 flex-1 flex-col justify-center p-5"><span className="inline-flex items-center gap-2 font-bold text-slate-900"><Package className="h-4 w-4" />{product.name || product.serialNumber}</span><span className="mt-1 line-clamp-2 text-sm text-slate-500">{product.shortDescription}</span><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">{t("admin.news.block_view_product")} <ArrowRight className="h-4 w-4" /></span></span>
    </Link>;
  }
  if (type === "cta") {
    const url = safeUrl(payload.url);
    if (!url) return null;
    const external = /^https?:/.test(url);
    const button = <span className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold ${payload.style === "secondary" ? "bg-slate-900 text-white" : payload.style === "outline" ? "border border-blue-600 text-blue-700" : "bg-blue-600 text-white"}`}>{plain(payload.label)}</span>;
    return <div className={`my-8 ${payload.align === "center" ? "text-center" : payload.align === "right" ? "text-right" : "text-left"}`}>{plain(payload.text) && <p className="mb-3 text-slate-600">{plain(payload.text)}</p>}{external ? <a href={url} target="_blank" rel="noopener noreferrer">{button}</a> : <Link to={url}>{button}</Link>}</div>;
  }
  if (type === "stats") return <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{(Array.isArray(payload.items) ? payload.items : []).slice(0, 4).map((item, index) => <div key={index} className="rounded-2xl bg-blue-50 p-4 text-center"><div className="text-2xl font-bold text-blue-800">{plain(item?.value)}<span className="text-base">{plain(item?.unit)}</span></div><div className="mt-1 text-sm text-slate-600">{plain(item?.label)}</div></div>)}</div>;
  if (type === "quote") return <figure className="my-8 border-s-4 border-blue-500 bg-blue-50 p-6"><blockquote className="text-xl font-semibold text-slate-900">“{plain(payload.quote)}”</blockquote>{(plain(payload.author) || plain(payload.role)) && <figcaption className="mt-3 text-sm text-slate-600">{plain(payload.author)}{payload.author && payload.role ? " · " : ""}{plain(payload.role)}</figcaption>}</figure>;
  if (type === "accordion") return <AccordionBlock items={payload.items || []} />;
  if (type === "download") {
    const url = safeUrl(payload.url);
    if (!url) return null;
    return <a className="my-7 flex flex-wrap items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-900" href={url} target="_blank" rel="noopener noreferrer" download><ArrowDownToLine className="h-6 w-6 shrink-0" /><span className="min-w-0 flex-1"><strong className="block">{plain(payload.title)}</strong>{plain(payload.description) && <span className="block text-sm">{plain(payload.description)}</span>}{(plain(payload.fileType) || plain(payload.size)) && <small>{[plain(payload.fileType), plain(payload.size)].filter(Boolean).join(" · ")}</small>}</span><span className="text-sm font-semibold">{t("admin.news.block_download_action")}</span></a>;
  }
  return null;
}

function AccordionBlock({ items }) {
  const [open, setOpen] = useState([]);
  const id = useId();
  return <div className="my-8 divide-y overflow-hidden rounded-2xl border">{(Array.isArray(items) ? items : []).slice(0, 15).map((item, index) => {
    const expanded = open.includes(index);
    const panelId = `${id}-panel-${index}`;
    return <div key={index} className="p-4"><button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen((current) => expanded ? current.filter((itemIndex) => itemIndex !== index) : [...current, index])} className="flex w-full items-center justify-between gap-3 text-start font-semibold focus-visible:outline-2 focus-visible:outline-blue-600">{plain(item?.title)}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button><div id={panelId} hidden={!expanded} className="mt-3 whitespace-pre-wrap text-slate-600">{plain(item?.answer)}</div></div>;
  })}</div>;
}
