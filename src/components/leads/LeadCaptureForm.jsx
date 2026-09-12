import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Mail, MapPin, Package, Phone, Send, User } from "lucide-react";
import { toast } from "sonner";
import { getProduct, getProducts } from "@/services/products/productServices";
import { submitLead } from "@/services/leads/leadServices";
import { getAttributionContext, trackCustomEvent } from "@/services/analytics/analytics";

const EMPTY_FORM = { fullName: "", phone: "", email: "", company: "", wilaya: "", productIdentifier: "", quantity: 1, message: "" };

export default function LeadCaptureForm() {
  const [params] = useSearchParams();
  const requestedProduct = params.get("product") || "";
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingProducts(true);
        const [listResult, selectedResult] = await Promise.all([
          getProducts({ max: 100, sortBy: "name", sortOrder: "asc" }),
          requestedProduct ? getProduct(requestedProduct).catch(() => null) : Promise.resolve(null),
        ]);
        if (!active) return;
        const list = listResult?.data?.products || [];
        const selected = selectedResult?.data || list.find((item) => item.serialNumber === requestedProduct) || null;
        setProducts(selected && !list.some((item) => item._id === selected._id) ? [selected, ...list] : list);
        if (selected) {
          setSelectedProduct(selected);
          setForm((current) => ({ ...current, productIdentifier: selected.serialNumber }));
        }
      } catch {
        toast.error("Impossible de charger les produits.");
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();
    return () => { active = false; };
  }, [requestedProduct]);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackCustomEvent("lead_form_started", { page: window.location.pathname, product_serial: form.productIdentifier || requestedProduct || undefined, source: getAttributionContext().source || undefined });
  }

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "quantity" ? Math.max(1, Number(value || 1)) : value }));
    if (name === "productIdentifier") setSelectedProduct(products.find((item) => item.serialNumber === value) || null);
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.productIdentifier) return toast.error("Sélectionnez un produit.");
    try {
      setSubmitting(true);
      await submitLead({
        ...form,
        email: form.email || null,
        company: form.company || null,
        message: form.message || null,
        attribution: getAttributionContext(),
      });
      setSubmitted(true);
      toast.success("Votre demande commerciale a été envoyée.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Impossible d'envoyer la demande.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-bold text-slate-950">Demande envoyée</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Merci. Notre équipe commerciale vous contactera prochainement au sujet de {selectedProduct?.name || "votre projet"}.</p>
        <button type="button" onClick={() => { setSubmitted(false); setForm((current) => ({ ...EMPTY_FORM, productIdentifier: current.productIdentifier })); }} className="mt-5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Envoyer une autre demande</button>
      </div>
    );
  }

  const field = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10";
  return (
    <form onSubmit={submit} onFocus={markStarted} className="rounded-[30px] border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white"><Send className="h-5 w-5" /></div>
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Contact Sales</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Parlons de votre besoin</h2></div>
      </div>
      {selectedProduct && requestedProduct && <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">Vous êtes intéressé par : {selectedProduct.name || selectedProduct.productId}</div>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nom complet *" icon={User}><input className={field} name="fullName" value={form.fullName} onChange={change} required autoComplete="name" /></Field>
        <Field label="Téléphone *" icon={Phone}><input className={field} name="phone" value={form.phone} onChange={change} required autoComplete="tel" /></Field>
        <Field label="Email" icon={Mail}><input className={field} name="email" type="email" value={form.email} onChange={change} autoComplete="email" /></Field>
        <Field label="Entreprise"><input className={field} name="company" value={form.company} onChange={change} autoComplete="organization" /></Field>
        <Field label="Wilaya *" icon={MapPin}><input className={field} name="wilaya" value={form.wilaya} onChange={change} required placeholder="Ex. Alger" /></Field>
        <Field label="Produit *" icon={Package}>
          <select className={field} name="productIdentifier" value={form.productIdentifier} onChange={change} required disabled={loadingProducts}>
            <option value="">{loadingProducts ? "Chargement..." : "Sélectionner un produit"}</option>
            {products.map((product) => <option key={product._id} value={product.serialNumber}>{product.name || product.productId} — {product.serialNumber}</option>)}
          </select>
        </Field>
        <Field label="Quantité *"><input className={field} name="quantity" type="number" min="1" max="100000" value={form.quantity} onChange={change} required /></Field>
        <div className="sm:col-span-2"><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Message</label><textarea className={`${field} min-h-28 resize-y`} name="message" value={form.message} onChange={change} maxLength={3000} /></div>
      </div>
      <button disabled={submitting || loadingProducts} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{submitting ? "Envoi..." : "Envoyer la demande"}
      </button>
    </form>
  );
}

function Field({ label, icon: Icon, children }) {
  return <div><label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{Icon && <Icon className="h-3.5 w-3.5" />}{label}</label>{children}</div>;
}
