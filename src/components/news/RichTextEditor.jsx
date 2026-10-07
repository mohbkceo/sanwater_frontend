import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import DOMPurify from "dompurify";
import { Bold, Italic, UnderlineIcon, Strikethrough, Link2, ImagePlus, Undo2, Redo2, Maximize2, Minimize2, MoreHorizontal, Video, Table2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/services/contents/imageHandler";
import { useTranslation } from "@/lib/i18n";
import BlockSettings from "./editor/BlockSettings";
import { ArticleImage, BlockAttributes, Callout, EditorProductsContext, NewsColor, NewsHighlight, StructuredBlock } from "./editor/extensions";
import { safeUrl, youtubeId } from "./blocks/ContentBlock";
import "./blocks/newsContent.css";

const PALETTE = ["blue", "slate", "green", "amber", "red"];
const items = [
  ["text", "paragraph"], ["text", "heading_2"], ["text", "heading_3"], ["text", "heading_4"],
  ["lists", "bullet_list"], ["lists", "numbered_list"], ["lists", "checklist"], ["media", "image"], ["media", "gallery"], ["media", "youtube"],
  ["content", "blockquote"], ["content", "quote"], ["content", "callout"], ["content", "table"], ["content", "accordion"], ["content", "divider"],
  ["sanwater", "product"], ["sanwater", "cta"], ["sanwater", "stats"], ["sanwater", "download"],
];
function countArticleWords(editor) {
  const parts = [editor.getText()];
  editor.state.doc.descendants((node) => {
    if (node.type.name === "image") parts.push(node.attrs.caption || "");
    if (node.type.name !== "structuredBlock") return;
    const data = node.attrs.payload || {};
    if (node.attrs.type === "youtube") parts.push(node.attrs.caption || "");
    if (node.attrs.type === "quote") parts.push(data.quote, data.author, data.role);
    if (node.attrs.type === "cta") parts.push(data.label, data.text);
    if (node.attrs.type === "download") parts.push(data.title, data.description);
    if (node.attrs.type === "gallery") (Array.isArray(data.images) ? data.images : []).forEach((image) => parts.push(image?.caption || ""));
    if (node.attrs.type === "stats") (Array.isArray(data.items) ? data.items : []).forEach((item) => parts.push(item?.value, item?.unit, item?.label));
    if (node.attrs.type === "accordion") (Array.isArray(data.items) ? data.items : []).forEach((item) => parts.push(item?.title, item?.answer));
  });
  return parts.filter((part) => typeof part === "string").join(" ").trim().split(/\s+/u).filter(Boolean).length;
}

export default function RichTextEditor({ value, onChange, disabled = false, saveState, onProductSelected, inlineProducts = [] }) {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const slashRef = useRef(null);
  const slashIndexRef = useRef(0);
  const [slash, setSlash] = useState(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [imageFields, setImageFields] = useState(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [focus, setFocus] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false, underline: false }), Underline, Link.configure({ openOnClick: false, autolink: true }), Superscript, Subscript, TaskList, TaskItem.configure({ nested: true }), Table.configure({ resizable: false }), TableRow, TableCell, TableHeader, ArticleImage.configure({ allowBase64: false }), BlockAttributes, NewsColor, NewsHighlight, StructuredBlock, Callout],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
      setWordCount(countArticleWords(instance));
      const { $from } = instance.state.selection;
      const before = $from.parent.textBetween(0, $from.parentOffset);
      const match = /^\/(.{0,30})$/.exec(before);
      const nextSlash = match ? match[1] : null;
      if (nextSlash !== slashRef.current) { slashIndexRef.current = 0; setSlashIndex(0); }
      slashRef.current = nextSlash;
      setSlash(nextSlash);
    },
    onSelectionUpdate: ({ editor: instance }) => {
      const selection = instance.state.selection;
      const node = selection.node;
      if (node && ["structuredBlock", "image"].includes(node.type.name)) {
        setSelected({ pos: selection.from, type: node.type.name, attrs: node.attrs });
        setImageFields(node.type.name === "image" ? { alt: node.attrs.alt || "", caption: node.attrs.caption || "", width: node.attrs.width || "normal", align: node.attrs.align || "center" } : null);
      } else { setSelected(null); setImageFields(null); }
    },
    editorProps: {
      attributes: { class: "news-editor-content min-h-[420px] px-5 py-5 text-slate-800 outline-none" },
      transformPastedHTML: (html) => DOMPurify.sanitize(html, { FORBID_TAGS: ["script", "style"], FORBID_ATTR: ["style", "class"] }),
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith("image/"));
        if (files[0]) { uploadFile(files[0]); return true; }
        const pasted = event.clipboardData?.getData("text/plain")?.trim();
        const id = youtubeId(pasted);
        if (id && pasted === event.clipboardData?.getData("text/plain")?.trim()) {
          editor?.chain().focus().insertContent({ type: "structuredBlock", attrs: { type: "youtube", videoId: id, width: "normal" } }).run();
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const file = Array.from(event.dataTransfer?.files || []).find((item) => item.type.startsWith("image/"));
        if (file) { uploadFile(file); return true; }
        return false;
      },
      handleKeyDown: (_view, event) => {
        if (slashRef.current === null) return false;
        if (event.key === "Escape") { slashRef.current = null; setSlash(null); return true; }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const last = Math.max(0, filteredItems(slashRef.current).length - 1); const next = Math.min(last, Math.max(0, slashIndexRef.current + (event.key === "ArrowDown" ? 1 : -1))); slashIndexRef.current = next; setSlashIndex(next); return true; }
        if (event.key === "Enter") { event.preventDefault(); const matches = filteredItems(slashRef.current); runItem(matches[Math.min(slashIndexRef.current, matches.length - 1)]?.[1], true); return true; }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
      setWordCount(countArticleWords(editor));
    }
  }, [editor, value]);
  useEffect(() => { editor?.setEditable(!disabled); }, [editor, disabled]);
  useEffect(() => {
    if (!focus) return;
    const escape = (event) => { if (event.key === "Escape" && !editing) setFocus(false); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [focus, editing]);
  if (!editor) return <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />;

  async function uploadFile(file, replace = false) {
    try {
      setUploading(true);
      const result = await uploadImage(file, { folder: "news" });
      const src = safeUrl(result?.data?.path, false);
      if (!src) throw new Error("Missing uploaded image");
      if (replace && selected?.type === "image") editor.chain().focus().setNodeSelection(selected.pos).updateAttributes("image", { src }).run();
      else editor.chain().focus().setImage({ src, alt: file.name, width: "normal", align: "center" }).run();
    } catch { toast.error(t("admin.news.editor_image_upload_failed")); }
    finally { setUploading(false); }
  }
  function filteredItems(query) { return items.filter(([, id]) => t(`admin.news.block_${id}`).toLowerCase().includes((query || "").toLowerCase().trim())); }
  function runItem(id, fromSlash = false) {
    if (!id) return;
    if (fromSlash) {
      const { $from } = editor.state.selection;
      const from = $from.start();
      editor.chain().focus().deleteRange({ from, to: editor.state.selection.from }).run();
      slashRef.current = null; setSlash(null);
    }
    if (id === "paragraph") return editor.chain().focus().setParagraph().run();
    if (id.startsWith("heading_")) return editor.chain().focus().setHeading({ level: Number(id.slice(-1)) }).run();
    if (id === "bullet_list") return editor.chain().focus().toggleBulletList().run();
    if (id === "numbered_list") return editor.chain().focus().toggleOrderedList().run();
    if (id === "checklist") return editor.chain().focus().toggleTaskList().run();
    if (id === "blockquote") return editor.chain().focus().toggleBlockquote().run();
    if (id === "divider") return editor.chain().focus().setHorizontalRule().run();
    if (id === "image") return fileRef.current?.click();
    if (id === "table") return editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    if (id === "callout") return editor.chain().focus().insertContent({ type: "callout", attrs: { calloutType: "info" }, content: [{ type: "paragraph", content: [{ type: "text", text: t("admin.news.block_callout_placeholder") }] }] }).run();
    setEditing({ type: id, pos: null, payload: null });
  }
  function saveBlock(next) {
    if (editing.pos !== null) editor.chain().focus().setNodeSelection(editing.pos).updateAttributes("structuredBlock", next).run();
    else editor.chain().focus().insertContent({ type: "structuredBlock", attrs: { type: editing.type, ...next } }).run();
    setEditing(null);
  }
  function updateBlockAttr(name, attrs) {
    editor.chain().focus().updateAttributes(name, attrs).run();
  }
  function applyImage() {
    if (!selected || !imageFields) return;
    editor.chain().focus().setNodeSelection(selected.pos).updateAttributes("image", imageFields).run();
  }
  function applyLink() {
    if (!linkUrl) editor.chain().focus().unsetLink().run();
    else if (safeUrl(linkUrl) || /^mailto:[^\s<>@"']+@[^\s<>@"']+$/i.test(linkUrl)) editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl, target: /^https?:/.test(linkUrl) ? "_blank" : null }).run();
    else return toast.error(t("admin.news.block_invalid_url"));
    setLinkMode(false); setLinkUrl("");
  }
  const button = (label, Icon, action, active = false, off = false) => <button type="button" key={label} title={label} aria-label={label} disabled={disabled || off} onClick={action} className={`rounded-lg p-2 transition disabled:opacity-40 ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-100"}`}><Icon className="h-4 w-4" /></button>;
  const choice = (label, value, options, onChange) => <select aria-label={label} title={label} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>;
  const slashMatches = filteredItems(slash);
  const alignmentNode = editor.isActive("heading") ? "heading" : editor.isActive("tableHeader") ? "tableHeader" : editor.isActive("tableCell") ? "tableCell" : "paragraph";
  return <div className={focus ? "fixed inset-0 z-[60] overflow-y-auto bg-[#f6f9ff] p-3 sm:p-8" : ""}><div className={focus ? "mx-auto max-w-5xl" : ""}>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {button(t("admin.news.editor_undo"), Undo2, () => editor.chain().focus().undo().run(), false, !editor.can().undo())}
        {button(t("admin.news.editor_redo"), Redo2, () => editor.chain().focus().redo().run(), false, !editor.can().redo())}
        {choice(t("admin.news.block_type"), editor.isActive("heading", { level: 2 }) ? "heading_2" : editor.isActive("heading", { level: 3 }) ? "heading_3" : editor.isActive("heading", { level: 4 }) ? "heading_4" : "paragraph", [["paragraph", t("admin.news.block_paragraph")], [2, 3, 4].map((n) => [`heading_${n}`, t(`admin.news.block_heading_${n}`)])].flat(), runItem)}
        {button(t("admin.news.editor_bold"), Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {button(t("admin.news.editor_italic"), Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {button(t("admin.news.editor_underline"), UnderlineIcon, () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
        {button(t("admin.news.block_strike"), Strikethrough, () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
        {choice(t("admin.news.block_alignment"), editor.getAttributes(alignmentNode).align || "left", [["left", t("admin.news.block_left")], ["center", t("admin.news.block_center")], ["right", t("admin.news.block_right")], ["justify", t("admin.news.block_justify")]], (align) => updateBlockAttr(alignmentNode, { align }))}
        {choice(t("admin.news.block_direction"), "auto", [["auto", t("admin.news.block_auto")], ["rtl", "RTL"], ["ltr", "LTR"]], (dir) => updateBlockAttr(editor.isActive("heading") ? "heading" : "paragraph", { dir }))}
        {choice(t("admin.news.block_color"), "", [["", t("admin.news.block_color")], ...PALETTE.map((name) => [name, t(`admin.news.block_color_${name}`)])], (color) => color ? editor.chain().focus().setMark("newsColor", { color }).run() : editor.chain().focus().unsetMark("newsColor").run())}
        {choice(t("admin.news.block_highlight"), "", [["", t("admin.news.block_highlight")], ...PALETTE.map((name) => [name, t(`admin.news.block_color_${name}`)])], (color) => color ? editor.chain().focus().setMark("newsHighlight", { color }).run() : editor.chain().focus().unsetMark("newsHighlight").run())}
        {button(t("admin.news.editor_link"), Link2, () => setLinkMode((old) => !old), editor.isActive("link"))}
        {button(t("admin.news.editor_insert_image"), ImagePlus, () => fileRef.current?.click(), false, uploading)}
        {button(t("admin.news.block_youtube"), Video, () => runItem("youtube"))}
        {button(t("admin.news.block_table"), Table2, () => runItem("table"))}
        <details className="relative"><summary title={t("admin.news.block_more")} aria-label={t("admin.news.block_more")} className="cursor-pointer list-none rounded-lg p-2 text-slate-600"><MoreHorizontal className="h-4 w-4" /></summary><div className="absolute end-0 z-30 grid max-h-72 w-48 overflow-y-auto rounded-xl border bg-white p-2 shadow-lg">{items.filter(([, id]) => !["image", "youtube", "table", "paragraph", "heading_2", "heading_3", "heading_4"].includes(id)).map(([, id]) => <button type="button" key={id} onClick={(event) => { runItem(id); event.currentTarget.closest("details").open = false; }} className="rounded-lg px-3 py-2 text-start text-sm hover:bg-blue-50">{t(`admin.news.block_${id}`)}</button>)}<button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="rounded-lg px-3 py-2 text-start text-sm hover:bg-blue-50">{t("admin.news.block_clear_formatting")}</button><button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className="rounded-lg px-3 py-2 text-start text-sm hover:bg-blue-50">{t("admin.news.block_inline_code")}</button><button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="rounded-lg px-3 py-2 text-start text-sm hover:bg-blue-50">{t("admin.news.block_code_block")}</button><button type="button" onClick={() => editor.chain().focus().toggleSuperscript().run()} className="rounded-lg px-3 py-2 text-start text-sm hover:bg-blue-50">{t("admin.news.block_superscript")}</button><button type="button" onClick={() => editor.chain().focus().toggleSubscript().run()} className="rounded-lg px-3 py-2 text-start text-sm hover:bg-blue-50">{t("admin.news.block_subscript")}</button></div></details>
        {button(t("admin.news.block_focus"), focus ? Minimize2 : Maximize2, () => setFocus((old) => !old), focus)}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => { if (event.target.files?.[0]) uploadFile(event.target.files[0], selected?.type === "image"); event.target.value = ""; }} />
      </div>
      {linkMode && <div className="flex gap-2 border-b p-2"><input aria-label={t("admin.news.block_url")} value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://..." className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm" /><button type="button" onClick={applyLink} className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">{t("admin.news.editor_apply")}</button></div>}
      {editor.isActive("table") && <div className="flex flex-wrap gap-2 border-b p-2 text-xs">{[["block_add_row", () => editor.chain().focus().addRowAfter().run()], ["block_remove_row", () => editor.chain().focus().deleteRow().run()], ["block_add_column", () => editor.chain().focus().addColumnAfter().run()], ["block_remove_column", () => editor.chain().focus().deleteColumn().run()], ["block_toggle_header", () => editor.chain().focus().toggleHeaderRow().run()], ["block_merge_cells", () => editor.chain().focus().mergeCells().run()], ["block_delete_table", () => editor.chain().focus().deleteTable().run()]].map(([key, action]) => <button type="button" key={key} onClick={action} className="rounded-lg border px-2 py-1">{t(`admin.news.${key}`)}</button>)}</div>}
      {editor.isActive("callout") && <div className="flex gap-2 border-b p-2 text-xs"><span>{t("admin.news.block_callout")}</span><select value={editor.getAttributes("callout").calloutType || "info"} onChange={(event) => editor.chain().focus().updateAttributes("callout", { calloutType: event.target.value }).run()} className="rounded-lg border">{["info", "tip", "warning", "success"].map((kind) => <option key={kind} value={kind}>{t(`admin.news.block_${kind}`)}</option>)}</select></div>}
      {selected?.type === "structuredBlock" && <div className="flex gap-2 border-b p-2 text-xs"><button type="button" onClick={() => setEditing({ ...selected.attrs, pos: selected.pos })} className="rounded-lg border px-3 py-1">{t("admin.common.edit")}</button><button type="button" onClick={() => editor.chain().focus().setNodeSelection(selected.pos).deleteSelection().run()} className="rounded-lg border px-3 py-1">{t("admin.common.delete")}</button></div>}
      {selected?.type === "image" && imageFields && <div className="flex flex-wrap gap-2 border-b p-2 text-xs"><input aria-label={t("admin.news.block_alt")} value={imageFields.alt} onChange={(event) => setImageFields({ ...imageFields, alt: event.target.value })} placeholder={t("admin.news.block_alt")} className="rounded-lg border px-2" /><input aria-label={t("admin.news.block_caption")} value={imageFields.caption} onChange={(event) => setImageFields({ ...imageFields, caption: event.target.value })} placeholder={t("admin.news.block_caption")} className="rounded-lg border px-2" /><select value={imageFields.width} onChange={(event) => setImageFields({ ...imageFields, width: event.target.value })} className="rounded-lg border">{["normal", "wide", "full"].map((kind) => <option key={kind} value={kind}>{t(`admin.news.block_${kind}`)}</option>)}</select><select value={imageFields.align} onChange={(event) => setImageFields({ ...imageFields, align: event.target.value })} className="rounded-lg border">{["left", "center", "right"].map((kind) => <option key={kind} value={kind}>{t(`admin.news.block_${kind}`)}</option>)}</select><button type="button" onClick={applyImage} className="rounded-lg border px-2">{t("admin.news.editor_apply")}</button><button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border px-2">{t("admin.news.replace")}</button><button type="button" onClick={() => editor.chain().focus().setNodeSelection(selected.pos).deleteSelection().run()} className="rounded-lg border px-2">{t("admin.common.delete")}</button></div>}
      {editor && <BubbleMenu editor={editor} shouldShow={({ editor: current }) => !current.state.selection.empty && !current.isActive("image")}><div className="flex rounded-xl border bg-white p-1 shadow-xl">{button(t("admin.news.editor_bold"), Bold, () => editor.chain().focus().toggleBold().run())}{button(t("admin.news.editor_italic"), Italic, () => editor.chain().focus().toggleItalic().run())}{button(t("admin.news.editor_underline"), UnderlineIcon, () => editor.chain().focus().toggleUnderline().run())}{button(t("admin.news.editor_link"), Link2, () => setLinkMode(true))}</div></BubbleMenu>}
      <EditorProductsContext.Provider value={inlineProducts}><div className="relative"><EditorContent editor={editor} />{slash !== null && slashMatches.length > 0 && <div className="absolute left-4 top-12 z-20 max-h-64 w-56 overflow-y-auto rounded-xl border bg-white p-1 shadow-xl">{slashMatches.map(([group, id], index) => <div key={id}>{(index === 0 || slashMatches[index - 1][0] !== group) && <div className="px-3 pt-2 text-[10px] font-bold uppercase text-slate-400">{t(`admin.news.block_${group}`)}</div>}<button type="button" onClick={() => runItem(id, true)} className={`block w-full rounded-lg px-3 py-2 text-start text-sm ${index === slashIndex ? "bg-blue-50 text-blue-700" : ""}`}>{t(`admin.news.block_${id}`)}</button></div>)}</div>}</div></EditorProductsContext.Provider>
      <div className="flex justify-between border-t px-4 py-2 text-xs text-slate-500"><span>{t("admin.news.block_word_count", { count: wordCount, minutes: Math.max(1, Math.ceil(wordCount / 225)) })}</span><span>{saveState ? t(`admin.news.save_state_${saveState === "saved_at" ? "saved" : saveState}`) : ""}</span></div>
    </div>
    {editing && <BlockSettings block={editing} onSave={saveBlock} onClose={() => setEditing(null)} onProduct={onProductSelected} t={t} />}
  </div></div>;
}
