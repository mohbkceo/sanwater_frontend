/* eslint-disable react-refresh/only-export-components */
import { Extension, Mark, Node, mergeAttributes } from "@tiptap/core";
import { createContext, useContext } from "react";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { ContentBlock, parsePayload } from "../blocks/ContentBlock";
import { useTranslation } from "@/lib/i18n";

const kinds = ["gallery", "cta", "product", "stats", "quote", "accordion", "download"];
export const EditorProductsContext = createContext([]);
const defaultPayload = {
  gallery: { images: [], layout: "two" }, cta: { label: "", url: "", text: "", style: "primary", align: "left" },
  product: { id: "" }, stats: { items: [{ value: "", unit: "", label: "" }, { value: "", unit: "", label: "" }] },
  quote: { quote: "", author: "", role: "" }, accordion: { items: [{ title: "", answer: "" }] },
  download: { title: "", url: "", description: "", fileType: "PDF", size: "" },
};

function BlockNodeView({ node, editor, getPos }) {
  const { t } = useTranslation();
  const products = useContext(EditorProductsContext);
  const { type, payload, videoId, width, caption } = node.attrs;
  return <NodeViewWrapper className="my-5 rounded-xl border border-blue-100 bg-white p-2" data-drag-handle>
    <button type="button" contentEditable={false} onClick={() => editor.commands.setNodeSelection(getPos())} className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-blue-700">{t(`admin.news.block_${type}`)}</button>
    <div className="pointer-events-none">{type === "product" ? products.some((product) => product._id === payload?.id) ? <ContentBlock type={type} payload={payload} products={products} preview /> : <div className="p-4 text-sm text-slate-600">{t("admin.news.block_product")} · {payload?.id || t("admin.news.block_select_product")}</div> :
      type === "gallery" && !payload?.images?.length ? <div className="p-4 text-sm text-slate-600">{t("admin.news.block_gallery_empty")}</div> :
      <ContentBlock type={type} payload={payload} videoId={videoId} width={width} caption={caption} />}</div>
  </NodeViewWrapper>;
}

function ImageNodeView({ node, editor, getPos }) {
  const { src, alt, caption, width, align } = node.attrs;
  return <NodeViewWrapper as="figure" className={`news-image news-image-${width || "normal"} news-image-${align || "center"}`} onClick={() => editor.commands.setNodeSelection(getPos())}>
    <img src={src} alt={alt || ""} loading="lazy" />
    {caption && <figcaption>{caption}</figcaption>}
  </NodeViewWrapper>;
}

export const StructuredBlock = Node.create({
  name: "structuredBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      type: { default: "quote", parseHTML: (el) => el.getAttribute("data-content-type"), renderHTML: (attrs) => ({ "data-content-type": attrs.type }) },
      payload: { default: null, parseHTML: (el) => parsePayload(el.getAttribute("data-payload")), renderHTML: (attrs) => attrs.payload ? { "data-payload": encodeURIComponent(JSON.stringify(attrs.payload)) } : {} },
      videoId: { default: "", parseHTML: (el) => el.getAttribute("data-video-id") || "", renderHTML: (attrs) => attrs.videoId ? { "data-video-id": attrs.videoId } : {} },
      width: { default: "normal", parseHTML: (el) => el.getAttribute("data-width") || "normal", renderHTML: (attrs) => ({ "data-width": attrs.width }) },
      caption: { default: "", parseHTML: (el) => el.getAttribute("data-caption") || "", renderHTML: (attrs) => attrs.caption ? { "data-caption": attrs.caption } : {} },
    };
  },
  parseHTML() { return [...kinds, "youtube"].map((kind) => ({ tag: `div[data-content-type="${kind}"]` })); },
  renderHTML({ HTMLAttributes }) { return ["div", HTMLAttributes]; },
  addNodeView() { return ReactNodeViewRenderer(BlockNodeView); },
});

export function newBlock(type, payload) {
  return { type: "structuredBlock", attrs: { type, payload: payload || defaultPayload[type] || null } };
}
export const blockKinds = kinds;

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "(paragraph|bulletList|orderedList)+",
  defining: true,
  addAttributes() { return { calloutType: { default: "info", parseHTML: (el) => el.getAttribute("data-callout-type") || "info", renderHTML: (attrs) => ({ "data-callout-type": attrs.calloutType }) } }; },
  parseHTML() { return [{ tag: 'div[data-content-type="callout"]' }]; },
  renderHTML({ HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { "data-content-type": "callout" }), 0]; },
});

export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: "", parseHTML: (el) => el.getAttribute("data-caption") || "", renderHTML: (attrs) => attrs.caption ? { "data-caption": attrs.caption } : {} },
      width: { default: "normal", parseHTML: (el) => el.getAttribute("data-width") || "normal", renderHTML: (attrs) => ({ "data-width": attrs.width }) },
      align: { default: "center", parseHTML: (el) => el.getAttribute("data-align") || "center", renderHTML: (attrs) => ({ "data-align": attrs.align }) },
    };
  },
  addNodeView() { return ReactNodeViewRenderer(ImageNodeView); },
});

export const BlockAttributes = Extension.create({
  name: "newsBlockAttributes",
  addGlobalAttributes() {
    return [{
      types: ["paragraph", "heading", "tableCell", "tableHeader"],
      attributes: {
        align: { default: "left", parseHTML: (el) => el.getAttribute("data-align") || "left", renderHTML: (attrs) => ({ "data-align": attrs.align }) },
        dir: { default: "auto", parseHTML: (el) => el.getAttribute("dir") || "auto", renderHTML: (attrs) => ({ dir: attrs.dir }) },
      },
    }];
  },
});

export const NewsColor = Mark.create({
  name: "newsColor",
  addAttributes() { return { color: { default: "blue", parseHTML: (el) => el.getAttribute("data-color"), renderHTML: (attrs) => ({ "data-color": attrs.color }) } }; },
  parseHTML() { return [{ tag: "span[data-color]" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", HTMLAttributes, 0]; },
});
export const NewsHighlight = Mark.create({
  name: "newsHighlight",
  addAttributes() { return { color: { default: "amber", parseHTML: (el) => el.getAttribute("data-highlight"), renderHTML: (attrs) => ({ "data-highlight": attrs.color }) } }; },
  parseHTML() { return [{ tag: "mark[data-highlight]" }]; },
  renderHTML({ HTMLAttributes }) { return ["mark", HTMLAttributes, 0]; },
});
