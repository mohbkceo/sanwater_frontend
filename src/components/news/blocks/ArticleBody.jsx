import DOMPurify from "dompurify";
import { ContentBlock, parsePayload, safeUrl } from "./ContentBlock";
import "./newsContent.css";

export default function ArticleBody({ article, preview = false }) {
  const safe = DOMPurify.sanitize(article?.content || "", { USE_PROFILES: { html: true }, FORBID_TAGS: ["iframe", "script", "style", "object", "embed"], FORBID_ATTR: ["style"], ALLOW_DATA_ATTR: false, ADD_ATTR: ["data-content-type", "data-payload", "data-video-id", "data-width", "data-caption", "data-callout-type", "data-align", "data-color", "data-highlight", "data-type", "data-checked", "dir"] });
  const document = new DOMParser().parseFromString(safe, "text/html");
  document.querySelectorAll("img").forEach((image) => { if (!safeUrl(image.getAttribute("src"), false)) image.remove(); });
  document.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!safeUrl(href) && !/^mailto:[^\s<>@"']+@[^\s<>@"']+$/i.test(href || "")) link.removeAttribute("href");
    link.setAttribute("rel", "noopener noreferrer");
    if (link.getAttribute("target") !== "_blank") link.removeAttribute("target");
  });
  const products = article?.inlineProducts || [];
  const nodes = Array.from(document.body.childNodes);
  return <div className="news-article-body mt-10 min-w-0 text-slate-700">{nodes.map((node, index) => {
    if (node.nodeType !== 1) return <span key={index}>{node.textContent}</span>;
    const type = node.getAttribute("data-content-type");
    if (type) return <ContentBlock key={index} type={type} payload={parsePayload(node.getAttribute("data-payload"))} videoId={node.getAttribute("data-video-id")} width={node.getAttribute("data-width")} caption={node.getAttribute("data-caption")} calloutType={node.getAttribute("data-callout-type")} html={DOMPurify.sanitize(node.innerHTML)} products={products} article={article} preview={preview} />;
    if (node.tagName === "TABLE") return <div key={index} className="news-table-scroll" dangerouslySetInnerHTML={{ __html: node.outerHTML }} />;
    if (node.tagName === "IMG") {
      const src = safeUrl(node.getAttribute("src"), false);
      if (!src) return null;
      return <figure key={index} className={`news-image news-image-${node.getAttribute("data-width") || "normal"} news-image-${node.getAttribute("data-align") || "center"}`}><img src={src} alt={node.getAttribute("alt") || ""} loading="lazy" />{node.getAttribute("data-caption") && <figcaption>{node.getAttribute("data-caption")}</figcaption>}</figure>;
    }
    return <div key={index} className="news-rich-fragment" dangerouslySetInnerHTML={{ __html: node.outerHTML }} />;
  })}</div>;
}
