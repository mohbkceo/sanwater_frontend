import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, CheckCircle2 } from "lucide-react";
import { submitQuotation } from "@/services/quotations/quotationServices";
import { motion, useReducedMotion } from "framer-motion";
import { MATERIALIZE_VARIANTS, SCRIM_VARIANTS, SPRING_SNAPPY, SPRING_DEFAULT, REDUCED_MOTION_TRANSITION } from "@/lib/springs";

// MVP entry point into the quotation system from a single product's page.
// The richer multi-product "quote cart" flow across the catalog belongs to
// a later phase — this covers the single-product case end to end so the
// backend isn't shipped without any way to reach it.
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
  const prefersReducedMotion = useReducedMotion();
  const spring = prefersReducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_SNAPPY;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  const fieldClass = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <motion.div
      variants={SCRIM_VARIANTS}
      initial="initial" animate="animate" exit="exit"
      transition={spring}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        variants={MATERIALIZE_VARIANTS}
        initial="initial" animate="animate" exit="exit"
        transition={spring}
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
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </motion.button>
        </div>
        <p className="mt-1 text-sm text-gray-500 truncate">{product?.name}</p>

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-sm text-emerald-700"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_DEFAULT}>
              <CheckCircle2 size={36} className="text-emerald-500" />
            </motion.div>
            Merci ! Notre équipe commerciale vous contactera prochainement.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nom complet *" required className={fieldClass} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone *" required className={fieldClass} />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email (optionnel)" className={fieldClass} />
            <input name="company" value={form.company} onChange={handleChange} placeholder="Société (optionnel)" className={fieldClass} />
            <input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} placeholder="Quantité" className={fieldClass} />
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (optionnel)" rows={3} className={fieldClass} />
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={spring}
              type="submit" disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Envoyer la demande"}
            </motion.button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default RequestQuoteModal;
