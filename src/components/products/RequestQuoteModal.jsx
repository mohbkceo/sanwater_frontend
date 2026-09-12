import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Mail,
  Minus,
  Phone,
  Plus,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { submitQuotation } from "@/services/quotations/quotationServices";
import {
  MATERIALIZE_VARIANTS,
  SCRIM_VARIANTS,
  SPRING_SNAPPY,
  SPRING_DEFAULT,
  REDUCED_MOTION_TRANSITION,
} from "@/lib/springs";

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

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_SNAPPY;

  const productName = product?.name || product?.productId || "Produit";

  const productSerial = product?.serialNumber;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, submitting]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "quantity" ? Math.max(1, Number(value || 1)) : value,
    }));
  };

  const updateQuantity = (delta) => {
    setForm((previous) => ({
      ...previous,
      quantity: Math.max(1, Number(previous.quantity) + delta),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error("Le nom et le téléphone sont requis.");
      return;
    }

    try {
      setSubmitting(true);

      await submitQuotation({
        items: [
          {
            product: product?._id,
            productName,
            productSerialNumber: productSerial,
            quantity: form.quantity,
          },
        ],
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
      toast.error(
        err?.response?.data?.message ||
          "Impossible d'envoyer la demande. Veuillez réessayer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `
    w-full
    rounded-[18px]
    border
    border-slate-200
    bg-slate-50/80
    px-4
    py-3.5
    text-sm
    text-slate-900
    outline-none
    placeholder:text-slate-400
    transition-all
    duration-200
    focus:border-blue-400
    focus:bg-white
    focus:ring-4
    focus:ring-blue-500/10
  `;

  const labelClass = `
    mb-2
    block
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.13em]
    text-slate-500
  `;

  return (
    <motion.div
      variants={SCRIM_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={spring}
      className="
        fixed
        inset-0
        z-50
        py-20
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-slate-950/35
        p-3
        backdrop-blur-md
        sm:p-5
      "
      onClick={() => !submitting && onClose()}
    >
      <motion.div
        variants={MATERIALIZE_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={spring}
        className="
          relative
          my-auto
          flex
          max-h-[calc(100vh-24px)]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-[30px]
          border
          border-white/80
          bg-white/90
          backdrop-blur-2xl
          shadow-xs
          sm:max-h-[calc(100vh-40px)]
          sm:rounded-[34px]
        "
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-quote-title"
      >
        {/* =====================================================
            Ambient glass lighting
        ====================================================== */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-100/50 blur-3xl" />

        {/* =====================================================
            Header
        ====================================================== */}

        <div className="relative shrink-0 border-b border-slate-100/80 px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-100
                  bg-blue-50
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-blue-600
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
                Demande commerciale
              </div>

              <h2
                id="request-quote-title"
                className="
                  text-2xl
                  font-bold
                  tracking-[-0.035em]
                  text-slate-950
                  sm:text-3xl
                "
              >
                Demander un devis
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Recevez une proposition adaptée à votre besoin.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={spring}
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Fermer"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white/80
                text-slate-500
                transition
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <X className="h-4.5 w-4.5" />
            </motion.button>
          </div>
        </div>

        {/* =====================================================
            Scrollable content
        ====================================================== */}

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          {done ? (
            /* ===================================================
               SUCCESS
            ==================================================== */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="px-5 py-10 sm:px-7 sm:py-12"
            >
              <div className="mx-auto max-w-md text-center">
                <motion.div
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={
                    prefersReducedMotion
                      ? REDUCED_MOTION_TRANSITION
                      : SPRING_DEFAULT
                  }
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-[26px]
                    bg-blue-600
                    text-white
                    shadow-xs
                  "
                >
                  <CheckCircle2 className="h-9 w-9" />
                </motion.div>

                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Demande envoyée
                </p>

                <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                  Merci !
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Votre demande concernant{" "}
                  <span className="font-semibold text-slate-800">
                    {productName}
                  </span>{" "}
                  a bien été transmise à notre équipe commerciale.
                </p>

                <div
                  className="
                    mt-8
                    rounded-[22px]
                    border
                    border-blue-100
                    bg-blue-50/70
                    p-4
                    text-left
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-[14px]
                        bg-white
                        text-blue-600
                      "
                    >
                      <FileText className="h-4.5 w-4.5" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                        Prochaine étape
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Notre équipe vous contactera prochainement pour
                        confirmer les détails et préparer votre devis.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="
                    mt-8
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[18px]
                    bg-blue-600
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                    shadow-xs
                  "
                >
                  Fermer
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <form
              id="quotation-form"
              onSubmit={handleSubmit}
              className="relative px-5 py-5 sm:px-7 sm:py-6"
            >
              {/* =================================================
                  Product summary
              ================================================== */}

              <section
                className="
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-blue-100
                  bg-blue-50/60
                "
              >
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-[16px]
                      bg-white
                      text-blue-600
                    "
                  >
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                      Produit sélectionné
                    </p>

                    <p className="mt-1 truncate text-base font-semibold text-slate-900">
                      {productName}
                    </p>

                    {productSerial && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        Référence : {productSerial}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  Contact information
              ================================================== */}

              <section className="mt-7">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                    01
                  </p>

                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                    Vos coordonnées
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Nous utiliserons ces informations pour vous répondre.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label htmlFor="quote-fullName" className={labelClass}>
                      Nom complet *
                    </label>

                    <div className="relative">
                      <User
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        id="quote-fullName"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                        autoComplete="name"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="quote-phone" className={labelClass}>
                      Téléphone *
                    </label>

                    <div className="relative">
                      <Phone
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        id="quote-phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Votre numéro"
                        required
                        autoComplete="tel"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="quote-email" className={labelClass}>
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        id="quote-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="nom@entreprise.com"
                        autoComplete="email"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="quote-company" className={labelClass}>
                      Société
                    </label>

                    <div className="relative">
                      <Building2
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        id="quote-company"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Nom de la société"
                        autoComplete="organization"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  Order details
              ================================================== */}

              <section className="mt-7">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                    02
                  </p>

                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                    Détails de la demande
                  </h3>
                </div>

                {/* Quantity */}
                <div
                  className="
                    rounded-[22px]
                    border
                    border-slate-200
                    bg-slate-50/80
                    p-4
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Quantité souhaitée
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Indiquez le nombre d'unités nécessaires.
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        rounded-full
                        border
                        border-slate-200
                        bg-white
                        p-1
                      "
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(-1)}
                        disabled={form.quantity <= 1}
                        aria-label="Diminuer la quantité"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          text-slate-500
                          transition
                          hover:bg-blue-50
                          hover:text-blue-600
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
                        {form.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(1)}
                        aria-label="Augmenter la quantité"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-blue-600
                          text-white
                          transition
                          hover:bg-blue-700
                        "
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label htmlFor="quote-notes" className={labelClass}>
                    Message / précisions
                  </label>

                  <textarea
                    id="quote-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Ajoutez des dimensions, délais, besoins particuliers..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </section>

              {/* =================================================
                  Footer actions
              ================================================== */}

              <div
                className="
                  mt-7
                  rounded-[22px]
                  border
                  border-blue-100
                  bg-blue-50/50
                  p-4
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      mt-0.5
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-100
                      text-blue-600
                    "
                  >
                    <Check className="h-4 w-4" />
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Votre demande sera transmise à notre équipe commerciale afin
                    de préparer une proposition adaptée.
                  </p>
                </div>
              </div>

              <div
                className="
                  sticky
                  bottom-0
                  mt-5
                  -mx-5
                  border-t
                  border-slate-100/80
                  bg-white/90
                  px-5
                  pb-1
                  pt-4
                  backdrop-blur-xl
                  sm:-mx-7
                  sm:px-7
                "
              >
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                  type="submit"
                  disabled={submitting}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[18px]
                    bg-blue-600
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-xs
                    transition-all
                    duration-200
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {submitting ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />
                      Envoi de votre demande...
                    </>
                  ) : (
                    <>
                      Envoyer la demande
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Les champs marqués * sont obligatoires.
                </p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RequestQuoteModal;
