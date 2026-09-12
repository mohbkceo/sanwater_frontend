import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Eye, History, ImagePlus, Loader2, Monitor, Save, Smartphone, Tablet, Trash2, UploadCloud, X } from "lucide-react";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import RichTextEditor from "@/components/news/RichTextEditor";
import ArticleContent from "@/components/news/ArticleContent";
import { autosaveNewsArticle, createNewsArticle, getAdminNewsArticleById, getNewsRevision, getNewsRevisions, restoreNewsRevision, updateNewsArticle } from "@/services/newsServices";
import { destroyImage, uploadImage } from "@/services/contents/imageHandler";
import { getProducts } from "@/services/products/productServices";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";

const EMPTY = { title: "", excerpt: "", content: "", coverImage: "", category: "", tags: [], status: "draft", publishedAt: "", seoTitle: "", seoDescription: "", canonicalUrl: "", isFeatured: false, relatedProducts: [] };
const localDateTime = (value) => {
  if (!value) return "";
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Algiers", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};
const algiersDateTimeToIso = (value) => value ? new Date(`${value}:00+01:00`).toISOString() : null;

export default function CreateEditNewsPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [searchParams] = useSearchParams();
  const [recordId, setRecordId] = useState(id || null); const [form, setForm] = useState(() => ({ ...EMPTY, publishedAt: searchParams.get("schedule") ? `${searchParams.get("schedule")}T09:00` : "" }));
  const [loading, setLoading] = useState(Boolean(id)); const [saving, setSaving] = useState(false); const [dirty, setDirty] = useState(false); const [publicationDirty, setPublicationDirty] = useState(false); const [saveState, setSaveState] = useState("Saved");
  const [preview, setPreview] = useState(false); const [previewSize, setPreviewSize] = useState("desktop"); const [products, setProducts] = useState([]); const [productSearch, setProductSearch] = useState("");
  const [tagInput, setTagInput] = useState(""); const [uploading, setUploading] = useState(false); const [uploadProgress, setUploadProgress] = useState(0);
  const [revisions, setRevisions] = useState([]); const [revision, setRevision] = useState(null); const savingRef = useRef(false);
  const listPath = SANWATERGROUPROUTES.content.children.news.fullPath;

  useEffect(() => {
    if (!id) return;
    let active = true; setLoading(true);
    getAdminNewsArticleById(id).then((response) => { if (!active) return; const article = response?.data; setRecordId(article._id); setForm({ ...EMPTY, ...article, publishedAt: localDateTime(article.publishedAt), relatedProducts: (article.relatedProducts || []).map((item) => item._id || item) }); setDirty(false); setPublicationDirty(false); }).catch(() => toast.error("Failed to load article.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);
  useEffect(() => { getProducts({ max: 100, sortBy: "name", sortOrder: "asc" }).then((result) => setProducts(result?.data?.products || [])).catch(() => {}); }, []);
  useEffect(() => { if (recordId) getNewsRevisions(recordId).then((result) => setRevisions(result?.data || [])).catch(() => {}); }, [recordId, saving]);
  useEffect(() => { const leave = (event) => { if (dirty || publicationDirty) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", leave); return () => window.removeEventListener("beforeunload", leave); }, [dirty, publicationDirty]);

  const autosavePayload = useMemo(() => Object.fromEntries(Object.entries(form).filter(([key]) => !["status", "publishedAt", "author", "authorUser", "slug", "_id", "createdAt", "updatedAt"].includes(key))), [form]);
  useEffect(() => {
    if (!dirty || loading || form.title.trim().length < 2 || !form.content.trim()) return;
    const timer = setTimeout(async () => {
      if (savingRef.current) return;
      try {
        savingRef.current = true; setSaveState("Saving...");
        if (recordId) await autosaveNewsArticle(recordId, autosavePayload);
        else {
          const created = await createNewsArticle({ ...autosavePayload, status: "draft", publishedAt: null });
          const newId = created?.data?._id; if (newId) { setRecordId(newId); navigate(`${listPath}/edit/${newId}`, { replace: true }); }
        }
        setDirty(publicationDirty); setSaveState(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      } catch { setSaveState("Autosave failed"); }
      finally { savingRef.current = false; }
    }, 1400);
    return () => clearTimeout(timer);
  }, [autosavePayload, dirty, form.content, form.title, loading, navigate, publicationDirty, recordId, listPath]);

  function setField(name, value) { setForm((current) => ({ ...current, [name]: value })); setDirty(true); setSaveState("Unsaved"); if (["status", "publishedAt"].includes(name)) setPublicationDirty(true); }
  function payload() { return { ...autosavePayload, status: form.status, publishedAt: form.status === "scheduled" ? algiersDateTimeToIso(form.publishedAt) : form.status === "published" ? null : algiersDateTimeToIso(form.publishedAt) }; }
  async function save() {
    if (!form.title.trim() || !form.content.trim()) return toast.error("Title and content are required.");
    if (form.status === "scheduled" && (!form.publishedAt || new Date(algiersDateTimeToIso(form.publishedAt)) <= new Date())) return toast.error("Choose a future date and time.");
    try { setSaving(true); const result = recordId ? await updateNewsArticle(recordId, payload()) : await createNewsArticle(payload()); const article = result?.data; if (article?._id) { setRecordId(article._id); navigate(`${listPath}/edit/${article._id}`, { replace: true }); } setDirty(false); setPublicationDirty(false); setSaveState(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`); toast.success(form.status === "published" ? "Article published." : "Article saved."); }
    catch (error) { toast.error(error?.response?.data?.message || "Save failed."); }
    finally { setSaving(false); }
  }
  function addTag() { const tag = tagInput.trim(); if (tag && !form.tags.includes(tag)) setField("tags", [...form.tags, tag]); setTagInput(""); }
  async function coverUpload(event) { const file = event.target.files?.[0]; if (!file) return; try { setUploading(true); setUploadProgress(0); const result = await uploadImage(file, { folder: "news", onProgress: setUploadProgress }); setField("coverImage", result?.data?.path || ""); toast.success("Cover uploaded."); } catch { toast.error("Cover upload failed."); } finally { setUploading(false); event.target.value = ""; } }
  async function removeCover() { const current = form.coverImage; setField("coverImage", ""); if (current) await destroyImage(current).catch(() => {}); }
  async function viewRevision(item) { try { setRevision((await getNewsRevision(recordId, item._id))?.data || null); } catch { toast.error("Could not load version."); } }
  async function restore(item) { try { setSaving(true); await restoreNewsRevision(recordId, item._id); const refreshed = (await getAdminNewsArticleById(recordId))?.data; setForm({ ...EMPTY, ...refreshed, publishedAt: localDateTime(refreshed.publishedAt), relatedProducts: (refreshed.relatedProducts || []).map((p) => p._id || p) }); setRevision(null); toast.success(`Version ${item.version} restored as a new revision.`); } catch { toast.error("Restore failed."); } finally { setSaving(false); } }

  const visibleProducts = products.filter((product) => `${product.name} ${product.productId} ${product.serialNumber}`.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 20);
  const selectedProducts = products.filter((product) => form.relatedProducts.includes(product._id));
  const previewArticle = { ...form, _id: recordId || "preview", slug: form.title.toLowerCase().replace(/\s+/g, "-"), author: "SanWater Team", relatedProducts: selectedProducts };
  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return <div className="min-h-screen bg-[#f6f9ff] px-4 py-6 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <header className="sticky top-0 z-20 mb-5 flex flex-col gap-4 rounded-[26px] border border-blue-100 bg-white/85 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><button onClick={() => navigate(listPath)} className="rounded-full border p-2"><ChevronLeft className="h-4 w-4" /></button><div><h1 className="text-2xl font-bold">{recordId ? "Edit article" : "Create article"}</h1><p className={`text-xs ${saveState.includes("failed") ? "text-rose-600" : "text-slate-500"}`}>{saveState}</p></div></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => setPreview(true)} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold"><Eye className="h-4 w-4" />Preview</button><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{form.status === "published" ? "Publish" : "Save"}</button></div>
      </header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-5">
          <Card title="Article"><Input label="Title *"><input value={form.title} onChange={(e) => setField("title", e.target.value)} maxLength={200} /></Input><Input label="Excerpt"><textarea value={form.excerpt || ""} onChange={(e) => setField("excerpt", e.target.value)} maxLength={600} rows="3" /></Input><div><label className="mb-2 block text-xs font-bold uppercase text-slate-500">Content *</label><RichTextEditor value={form.content} onChange={(value) => setField("content", value)} /></div></Card>
          <Card title="Related Products"><input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products" className="w-full rounded-2xl border p-3" /><div className="mt-3 grid gap-2 sm:grid-cols-2">{visibleProducts.map((product) => <label key={product._id} className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-3 text-sm"><input type="checkbox" checked={form.relatedProducts.includes(product._id)} onChange={(e) => setField("relatedProducts", e.target.checked ? [...form.relatedProducts, product._id] : form.relatedProducts.filter((id) => id !== product._id))} /><span className="font-medium">{product.name || product.productId}</span></label>)}</div></Card>
          <Card title="SEO & Social">
            <Input label={`SEO Title ${(form.seoTitle || form.title).length} / ~60`}><input value={form.seoTitle || ""} onChange={(e) => setField("seoTitle", e.target.value)} placeholder={form.title || "Defaults to article title"} /></Input>
            <Input label={`Meta Description ${(form.seoDescription || form.excerpt || "").length} / ~160`}><textarea value={form.seoDescription || ""} onChange={(e) => setField("seoDescription", e.target.value)} placeholder={form.excerpt || "Defaults to excerpt"} rows="3" /></Input>
            <Input label="Canonical URL"><input type="url" value={form.canonicalUrl || ""} onChange={(e) => setField("canonicalUrl", e.target.value)} placeholder={`${window.location.origin}/news/generated-slug`} /></Input>
            <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-emerald-700">sanwater-dz.com › news</p><h3 className="mt-1 text-lg text-blue-700">{form.seoTitle || form.title || "Article title"}</h3><p className="mt-1 text-sm text-slate-600">{form.seoDescription || form.excerpt || "Article description preview"}</p></div>
            <div className="overflow-hidden rounded-2xl border bg-slate-50">{form.coverImage && <img src={form.coverImage} className="h-40 w-full object-cover" alt="Social preview" />}<div className="p-4"><p className="text-xs uppercase text-slate-400">sanwater-dz.com</p><h3 className="mt-1 font-bold">{form.seoTitle || form.title || "Article title"}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-500">{form.seoDescription || form.excerpt}</p></div></div>
          </Card>
        </main>
        <aside className="space-y-5">
          <Card title="Publishing"><label className="grid gap-2 text-sm"><span className="text-xs font-bold uppercase text-slate-500">Status</span><select value={form.status} onChange={(e) => setField("status", e.target.value)} className="rounded-2xl border p-3"><option value="draft">Draft</option><option value="review">Review</option><option value="scheduled">Scheduled</option><option value="published">Publish now</option><option value="archived">Archived</option></select></label>{form.status === "scheduled" && <Input label="Date & time"><input type="datetime-local" value={form.publishedAt} onChange={(e) => setField("publishedAt", e.target.value)} /><p className="mt-1 text-xs text-slate-400">Timezone: Africa/Algiers</p></Input>}<label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)} />Featured article</label></Card>
          <Card title="Cover image"><div className="overflow-hidden rounded-2xl border bg-slate-50">{form.coverImage ? <img src={form.coverImage} alt="Cover" className="h-48 w-full object-cover" /> : <div className="grid h-48 place-items-center text-slate-400"><ImagePlus className="h-8 w-8" /></div>}</div><div className="mt-3 flex gap-2"><label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"><UploadCloud className="h-4 w-4" />{uploading ? `${uploadProgress}%` : form.coverImage ? "Replace" : "Upload"}<input type="file" accept="image/*" className="hidden" onChange={coverUpload} /></label>{form.coverImage && <button onClick={removeCover} className="rounded-2xl border border-rose-200 p-3 text-rose-600"><Trash2 className="h-4 w-4" /></button>}</div></Card>
          <Card title="Organization"><Input label="Category"><input value={form.category || ""} onChange={(e) => setField("category", e.target.value)} /></Input><Input label="Tags"><div className="flex gap-2"><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} /><button onClick={addTag} type="button" className="rounded-xl bg-slate-900 px-3 text-white">Add</button></div></Input><div className="flex flex-wrap gap-2">{form.tags.map((tag) => <button type="button" key={tag} onClick={() => setField("tags", form.tags.filter((item) => item !== tag))} className="rounded-full bg-slate-100 px-3 py-1 text-xs">#{tag} ×</button>)}</div></Card>
          {recordId && <Card title="Version History" icon={History}>{revisions.length ? <div className="space-y-2">{revisions.map((item) => <button key={item._id} onClick={() => viewRevision(item)} className="w-full rounded-2xl border p-3 text-left"><p className="text-sm font-bold">Version {item.version} · {item.reason.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-500">{item.editor?.fullName || item.editor?.email} · {new Date(item.createdAt).toLocaleString()}</p></button>)}</div> : <p className="text-sm text-slate-500">No versions yet.</p>}</Card>}
        </aside>
      </div>
    </div>
    {preview && <Modal onClose={() => setPreview(false)}><div className="mb-4 flex items-center justify-between"><div className="flex gap-2">{[["desktop", <Monitor key="desktop-icon" className="h-4 w-4" />], ["tablet", <Tablet key="tablet-icon" className="h-4 w-4" />], ["mobile", <Smartphone key="mobile-icon" className="h-4 w-4" />]].map(([size, icon]) => <button key={size} onClick={() => setPreviewSize(size)} className={`rounded-xl p-2 ${previewSize === size ? "bg-blue-600 text-white" : "border"}`}>{icon}</button>)}</div><button onClick={() => setPreview(false)} className="rounded-full border p-2"><X className="h-4 w-4" /></button></div><div className={`mx-auto transition-all ${previewSize === "mobile" ? "max-w-sm" : previewSize === "tablet" ? "max-w-3xl" : "max-w-5xl"}`}><ArticleContent article={previewArticle} preview /></div></Modal>}
    {revision && <Modal onClose={() => setRevision(null)}><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Version {revision.version}</h2><p className="text-sm text-slate-500">{new Date(revision.createdAt).toLocaleString()}</p></div><button onClick={() => setRevision(null)} className="rounded-full border p-2"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><VersionColumn title="Current" value={form} /><VersionColumn title={`Version ${revision.version}`} value={revision.snapshot} /></div><button disabled={saving} onClick={() => restore(revision)} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"><History className="h-4 w-4" />Restore this version</button></Modal>}
  </div>;
}

function Card({ title, icon: Icon, children }) { return <section className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 font-bold">{Icon && <Icon className="h-4 w-4 text-blue-600" />}{title}</h2><div className="space-y-4">{children}</div></section>; }
function Input({ label, children }) { return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span><div className="[&>input]:w-full [&>input]:rounded-2xl [&>input]:border [&>input]:p-3 [&>textarea]:w-full [&>textarea]:rounded-2xl [&>textarea]:border [&>textarea]:p-3">{children}</div></label>; }
function Modal({ onClose, children }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}><div onMouseDown={(e) => e.stopPropagation()} className="mx-auto min-h-fit max-w-6xl rounded-[28px] bg-[#f6f9ff] p-5 shadow-2xl sm:p-7">{children}</div></div>; }
function VersionColumn({ title, value }) { const safeContent = DOMPurify.sanitize(value?.content || "", { USE_PROFILES: { html: true } }); return <div className="rounded-2xl border bg-white p-4"><h3 className="font-bold">{title}</h3><p className="mt-3 text-sm"><strong>Title:</strong> {value?.title}</p><p className="mt-2 text-sm"><strong>Status:</strong> {value?.status}</p><p className="mt-2 text-sm"><strong>Excerpt:</strong> {value?.excerpt}</p><div className="mt-3 max-h-72 overflow-auto border-t pt-3 text-sm" dangerouslySetInnerHTML={{ __html: safeContent }} /></div>; }
