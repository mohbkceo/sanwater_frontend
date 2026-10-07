import { useEffect, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/services/contents/imageHandler";
import { getProducts } from "@/services/products/productServices";
import { safeUrl, youtubeId } from "../blocks/ContentBlock";

const empty = {
  youtube: { url: "", width: "normal", caption: "" },
  gallery: { images: [], layout: "two" },
  product: { id: "" },
  cta: { label: "", url: "", text: "", style: "primary", align: "left" },
  stats: { items: [{ value: "", unit: "", label: "" }, { value: "", unit: "", label: "" }] },
  quote: { quote: "", author: "", role: "" },
  accordion: { items: [{ title: "", answer: "" }] },
  download: { title: "", url: "", description: "", fileType: "PDF", size: "" },
};
const fieldClass = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm";

export default function BlockSettings({ block, onSave, onClose, onProduct, t }) {
  const [value, setValue] = useState(() => ({ ...empty[block.type], ...(block.payload || {}), ...(block.type === "youtube" ? { url: block.videoId ? `https://youtu.be/${block.videoId}` : "", width: block.width || "normal", caption: block.caption || "" } : {}) }));
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  useEffect(() => {
    if (block.type !== "product") return;
    const timer = setTimeout(() => getProducts({ search, max: 20 }).then((res) => setProducts(res?.data?.products || [])).catch(() => setProducts([])), 250);
    return () => clearTimeout(timer);
  }, [block.type, search]);
  const update = (key, next) => setValue((current) => ({ ...current, [key]: next }));
  const input = (key, label, type = "text") => <label className="block text-xs font-semibold text-slate-600">{label}<input type={type} value={value[key] || ""} onChange={(event) => update(key, event.target.value)} className={fieldClass} /></label>;
  const select = (key, label, options) => <label className="block text-xs font-semibold text-slate-600">{label}<select value={value[key]} onChange={(event) => update(key, event.target.value)} className={fieldClass}>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>;
  const list = (key, fields, min, max) => {
    const items = value[key] || [];
    const change = (index, field, next) => update(key, items.map((item, position) => position === index ? { ...item, [field]: next } : item));
    return <div className="space-y-3">{items.map((item, index) => <div key={index} className="rounded-xl border bg-slate-50 p-3">
      <div className="grid gap-2 sm:grid-cols-2">{fields.map(([field, label]) => <label key={field} className="text-xs font-medium">{label}<input value={item[field] || ""} onChange={(event) => change(index, field, event.target.value)} className={fieldClass} /></label>)}</div>
      <div className="mt-2 flex gap-2 text-xs text-blue-700"><button type="button" disabled={index === 0} onClick={() => update(key, move(items, index, -1))}>{t("admin.news.block_up")}</button><button type="button" disabled={index === items.length - 1} onClick={() => update(key, move(items, index, 1))}>{t("admin.news.block_down")}</button><button type="button" disabled={items.length <= min} onClick={() => update(key, items.filter((_, position) => position !== index))}>{t("admin.news.block_remove")}</button></div>
    </div>)}{items.length < max && <button type="button" onClick={() => update(key, [...items, Object.fromEntries(fields.map(([field]) => [field, ""]))])} className="rounded-xl border px-3 py-2 text-sm">{t("admin.news.block_add")}</button>}</div>;
  };
  async function uploadGallery(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const images = [...(value.images || [])];
    for (const file of files) {
      try {
        const result = await uploadImage(file, { folder: "news" });
        if (safeUrl(result?.data?.path, false)) images.push({ src: result.data.path, alt: file.name, caption: "" });
      } catch { toast.error(t("admin.news.editor_image_upload_failed")); }
    }
    update("images", images);
    setUploading(false);
    event.target.value = "";
  }
  function save() {
    if (block.type === "youtube") {
      const id = youtubeId(value.url);
      if (!id) return toast.error(t("admin.news.block_invalid_youtube"));
      return onSave({ videoId: id, width: value.width, caption: value.caption });
    }
    if (block.type === "product") {
      if (!/^[a-f\d]{24}$/i.test(value.id || "")) return toast.error(t("admin.news.block_select_product"));
      onProduct?.(selectedProduct || products.find((product) => product._id === value.id));
      return onSave({ payload: { id: value.id } });
    }
    if (block.type === "gallery" && !(value.images || []).some((item) => safeUrl(item.src, false))) return toast.error(t("admin.news.block_add_image"));
    if (block.type === "stats" && (value.items || []).filter((item) => item.value && item.label).length < 2) return toast.error(t("admin.news.block_two_stats"));
    if (block.type === "accordion" && !(value.items || []).some((item) => item.title && item.answer)) return toast.error(t("admin.news.block_add_item"));
    if (["cta", "download"].includes(block.type) && !safeUrl(value.url)) return toast.error(t("admin.news.block_invalid_url"));
    if (block.type === "download" && !/\.(pdf|docx|xlsx|zip)(?:[?#]|$)/i.test(value.url)) return toast.error(t("admin.news.block_invalid_file"));
    if (block.type === "cta" && !value.label.trim()) return toast.error(t("admin.news.block_enter_label"));
    if (block.type === "download" && !value.title.trim()) return toast.error(t("admin.news.block_enter_title"));
    if (block.type === "quote" && !value.quote.trim()) return toast.error(t("admin.news.block_enter_quote"));
    return onSave({ payload: value });
  }
  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/50 p-4" onMouseDown={onClose}><div className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
    <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{t(`admin.news.block_${block.type}`)}</h3><button type="button" onClick={onClose} aria-label={t("admin.news.block_close")}>×</button></div>
    <div className="max-h-[65vh] space-y-4 overflow-y-auto">
      {block.type === "youtube" && <>{input("url", t("admin.news.block_video_url"), "url")}{select("width", t("admin.news.block_width"), [["normal", t("admin.news.block_normal")], ["wide", t("admin.news.block_wide")], ["full", t("admin.news.block_full")]])}{input("caption", t("admin.news.block_caption"))}</>}
      {block.type === "gallery" && <>{select("layout", t("admin.news.block_layout"), [["two", t("admin.news.block_two_columns")], ["three", t("admin.news.block_three_columns")]])}<label className="block text-sm">{t("admin.news.block_upload_images")}<input type="file" multiple accept="image/*" onChange={uploadGallery} disabled={uploading} className={fieldClass} /></label>{list("images", [["src", t("admin.news.block_image_url")], ["alt", t("admin.news.block_alt")], ["caption", t("admin.news.block_caption")]], 0, 20)}</>}
      {block.type === "product" && <><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("admin.news.search_products")} className={fieldClass} /><div className="max-h-60 overflow-y-auto">{products.map((product) => <button type="button" key={product._id} onClick={() => { update("id", product._id); setSelectedProduct(product); }} className={`block w-full rounded-xl p-2 text-start text-sm ${value.id === product._id ? "bg-blue-100" : "hover:bg-slate-50"}`}>{product.name || product.serialNumber}</button>)}</div></>}
      {block.type === "cta" && <>{input("label", t("admin.news.block_button_label"))}{input("url", t("admin.news.block_url"))}{input("text", t("admin.news.block_supporting_text"))}{select("style", t("admin.news.block_style"), [["primary", t("admin.news.block_primary")], ["secondary", t("admin.news.block_secondary")], ["outline", t("admin.news.block_outline")]])}{select("align", t("admin.news.block_alignment"), [["left", t("admin.news.block_left")], ["center", t("admin.news.block_center")], ["right", t("admin.news.block_right")]])}</>}
      {block.type === "stats" && list("items", [["value", t("admin.news.block_value")], ["unit", t("admin.news.block_unit")], ["label", t("admin.news.block_label")]], 2, 4)}
      {block.type === "quote" && <>{input("quote", t("admin.news.block_quote_text"))}{input("author", t("admin.news.block_author"))}{input("role", t("admin.news.block_author_role"))}</>}
      {block.type === "accordion" && list("items", [["title", t("admin.news.block_question")], ["answer", t("admin.news.block_answer")]], 1, 15)}
      {block.type === "download" && <>{input("title", t("admin.news.block_title"))}{input("url", t("admin.news.block_url"))}{input("description", t("admin.news.block_description"))}{input("size", t("admin.news.block_file_size"))}{select("fileType", t("admin.news.block_file_type"), ["PDF", "DOCX", "XLSX", "ZIP"].map((type) => [type, type]))}</>}
    </div>
    <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">{t("admin.common.cancel")}</button><button type="button" onClick={save} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">{t("admin.common.save")}</button></div>
  </div></div>;
}

function move(items, index, direction) {
  const copy = [...items];
  [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]];
  return copy;
}
