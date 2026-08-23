import React, { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { submitQuotation } from "@/services/quotations/quotationServices";

// MVP entry point into the quotation system from a single product's page.
// The richer multi-product "quote cart" flow across the catalog belongs to
// the later Catalog/UX phase — this covers the single-product case end to
// end so the backend isn't shipped without any way to reach it.
function RequestQuoteModal({ product, onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    quantity: 1,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "quantity" ? Math.max(1, Number(value || 1)) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error("Le nom et le téléphone sont requis.");
      return;
    }

    try {
      setSubmitting(true);
      await submitQuotation({
        items: [{
          product: product?._id,
          productName: product?.name || product?.productId || "Produit",
          productSerialNumber: product?.serialNumber,
          quantity: form.quantity,
        }],
        requester: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          company: form.company.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
        source: "product_detail_page",
      });
      setDone(true);
      toast.success("Votre demande de devis a été envoyée.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Impossible d'envoyer la demande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-quote-title"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="request-quote-title" className="text-lg font-bold text-gray-900">
            Demander un devis
          </h2>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500 truncate">{product?.name}</p>

        {done ? (
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
            Merci ! Notre équipe commerciale vous contactera prochainement.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              name="fullName" value={form.fullName} onChange={handleChange}
              placeholder="Nom complet *" required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              name="phone" value={form.phone} onChange={handleChange}
              placeholder="Téléphone *" required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="Email (optionnel)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              name="company" value={form.company} onChange={handleChange}
              placeholder="Société (optionnel)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <input
              name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange}
              placeholder="Quantité"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <textarea
              name="notes" value={form.notes} onChange={handleChange}
              placeholder="Notes (optionnel)" rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit" disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Envoyer la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default RequestQuoteModal;
