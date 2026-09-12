import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, Heading4, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, UnderlineIcon, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/services/contents/imageHandler";

export default function RichTextEditor({ value, onChange, disabled = false }) {
  const fileRef = useRef(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false, autolink: true }), Image.configure({ allowBase64: false })],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: { attributes: { class: "min-h-[360px] px-5 py-4 text-sm leading-7 text-slate-800 outline-none prose prose-slate max-w-none" } },
  });

  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", false); }, [editor, value]);
  useEffect(() => { editor?.setEditable(!disabled); }, [editor, disabled]);
  if (!editor) return <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />;

  const tool = (label, Icon, action, active = false, isDisabled = false) => <button key={label} type="button" title={label} aria-label={label} disabled={isDisabled || disabled} onClick={action} className={`rounded-xl p-2 transition ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"} disabled:opacity-40`}><Icon className="h-4 w-4" /></button>;
  async function addImage(event) {
    const file = event.target.files?.[0]; if (!file) return;
    try { setUploading(true); const result = await uploadImage(file, { folder: "news", onProgress: () => {} }); const url = result?.data?.path; if (url) editor.chain().focus().setImage({ src: url, alt: file.name }).run(); }
    catch { toast.error("Image upload failed."); } finally { setUploading(false); event.target.value = ""; }
  }
  function applyLink() {
    if (!linkUrl) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl, target: "_blank" }).run();
    setLinkMode(false); setLinkUrl("");
  }

  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
      {tool("Bold", Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {tool("Italic", Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {tool("Underline", UnderlineIcon, () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
      {tool("Heading 2", Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {tool("Heading 3", Heading3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
      {tool("Heading 4", Heading4, () => editor.chain().focus().toggleHeading({ level: 4 }).run(), editor.isActive("heading", { level: 4 }))}
      {tool("Bullet list", List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {tool("Numbered list", ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      {tool("Blockquote", Quote, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
      {tool("Divider", Minus, () => editor.chain().focus().setHorizontalRule().run())}
      {tool("Link", Link2, () => setLinkMode((current) => !current), editor.isActive("link"))}
      {tool(uploading ? "Uploading" : "Insert image", ImagePlus, () => fileRef.current?.click(), false, uploading)}
      {tool("Undo", Undo2, () => editor.chain().focus().undo().run(), false, !editor.can().undo())}
      {tool("Redo", Redo2, () => editor.chain().focus().redo().run(), false, !editor.can().redo())}
      <input ref={fileRef} type="file" accept="image/*" onChange={addImage} className="hidden" />
    </div>
    {linkMode && <div className="flex gap-2 border-b border-slate-200 p-2"><input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 rounded-xl border px-3 py-2 text-sm" /><button type="button" onClick={applyLink} className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">Apply</button></div>}
    <EditorContent editor={editor} />
  </div>;
}
