import React, { useState } from "react";
import { contentAPI } from "@/services/baseAPIs";
import { useTranslation } from "@/lib/i18n.jsx";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Mail,
  MessageSquare,
  Send,
  User,
} from "lucide-react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { REDUCED_MOTION_TRANSITION, SPRING_DEFAULT } from "@/lib/springs";

function Field({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  active,
  required = false,
  type = "text",
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
      >
        <Icon
          size={14}
          className={active ? "text-blue-600" : "text-slate-400"}
        />

        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={[
          "h-14 w-full rounded-2xl",
          "border bg-white",
          "px-4 text-[15px] text-slate-900",
          "placeholder:text-slate-400",
          "outline-none",
          "transition-all duration-200",
          active
            ? "border-blue-400 ring-4 ring-blue-500/10"
            : "border-slate-200 hover:border-slate-300",
        ].join(" ")}
      />
    </div>
  );
}

function TextAreaField({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  active,
  required = false,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
      >
        <Icon
          size={14}
          className={active ? "text-blue-600" : "text-slate-400"}
        />

        {label}
      </label>

      <textarea
        id={name}
        name={name}
        required={required}
        rows={6}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={[
          "min-h-[170px] w-full resize-none rounded-2xl",
          "border bg-white",
          "px-4 py-4 text-[15px] leading-6 text-slate-900",
          "placeholder:text-slate-400",
          "outline-none",
          "transition-all duration-200",
          active
            ? "border-blue-400 ring-4 ring-blue-500/10"
            : "border-slate-200 hover:border-slate-300",
        ].join(" ")}
      />
    </div>
  );
}

export default function ContactForm() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const [activeField, setActiveField] = useState(null);

  const spring = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION
    : SPRING_DEFAULT;

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatus({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await contentAPI.post("/contact", formData);

      setStatus({
        loading: false,
        success: true,
        error: null,
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      window.setTimeout(() => {
        setStatus({
          loading: false,
          success: false,
          error: null,
        });
      }, 4000);
    } catch (error) {
      console.error("Failed to send contact message:", error);

      setStatus({
        loading: false,
        success: false,
        error:
          t("contact.error") ||
          "Unable to send your message. Please try again later.",
      });
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#F5F8FC] py-24 sm:py-28 lg:py-32"
    >
      {/* =====================================================
          Background atmosphere
      ===================================================== */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[15%] h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="absolute -right-40 bottom-[10%] h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="absolute left-[50%] top-[-160px] h-80 w-80 -translate-x-1/2 rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          {/* =================================================
              Header
          ================================================= */}
          <motion.header
            initial={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 14,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-80px",
            }}
            transition={spring}
            className="mb-10 text-center"
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-2 shadow-xs backdrop-blur-2xl backdrop-saturate-150">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Get in touch
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              {t("contact.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              {t("contact.description") ||
                "Tell us what you are looking for and our team will get back to you."}
            </p>
          </motion.header>

          {/* =================================================
              Form surface
          ================================================= */}
          <motion.div
            initial={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-70px",
            }}
            transition={{
              ...spring,
              delay: prefersReducedMotion ? 0 : 0.05,
            }}
            className="rounded-[30px] border border-slate-200 bg-white"
          >
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 lg:p-10">
              {/* =================================================
                  Fields
              ================================================= */}
              <div className="space-y-7">
                <div className="grid gap-7 md:grid-cols-2">
                  <Field
                    label={t("contact.name")}
                    icon={User}
                    name="name"
                    required
                    value={formData.name}
                    onChange={updateField}
                    onFocus={() => setActiveField("name")}
                    onBlur={() => setActiveField(null)}
                    active={activeField === "name"}
                    placeholder={t("contact.name") || "Your name"}
                  />

                  <Field
                    label={t("contact.email")}
                    icon={Mail}
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={updateField}
                    onFocus={() => setActiveField("email")}
                    onBlur={() => setActiveField(null)}
                    active={activeField === "email"}
                    placeholder={t("contact.email") || "you@example.com"}
                  />
                </div>

                <Field
                  label={t("contact.subject")}
                  icon={MessageSquare}
                  name="subject"
                  value={formData.subject}
                  onChange={updateField}
                  onFocus={() => setActiveField("subject")}
                  onBlur={() => setActiveField(null)}
                  active={activeField === "subject"}
                  placeholder={
                    t("contact.subject") || "What can we help you with?"
                  }
                />

                <TextAreaField
                  label={t("contact.message")}
                  icon={MessageSquare}
                  name="message"
                  required
                  value={formData.message}
                  onChange={updateField}
                  onFocus={() => setActiveField("message")}
                  onBlur={() => setActiveField(null)}
                  active={activeField === "message"}
                  placeholder={
                    t("contact.message") ||
                    "Tell us about your project, requirements, or question..."
                  }
                />
              </div>

              {/* =================================================
                  Footer / Submit
              ================================================= */}
              <div className="mt-8 flex flex-col gap-5 border-t border-slate-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-xs leading-5 text-slate-400">
                  {t("contact.help_text") ||
                    "Your information is only used to respond to your request."}
                </p>

                <motion.button
                  type="submit"
                  disabled={status.loading}
                  whileTap={
                    status.loading
                      ? undefined
                      : {
                          scale: 0.97,
                        }
                  }
                  transition={spring}
                  className={[
                    "group inline-flex h-14 shrink-0",
                    "items-center justify-center gap-2",
                    "rounded-full",
                    "bg-blue-600 px-7",
                    "text-sm font-bold text-white",
                    "shadow-xs",
                    "transition-colors",
                    "hover:bg-blue-700",
                    "focus:outline-none",
                    "focus-visible:ring-4",
                    "focus-visible:ring-blue-500/20",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                  ].join(" ")}
                >
                  {status.loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      {t("contact.sending") || "Sending..."}
                    </>
                  ) : (
                    <>
                      {t("contact.send")}

                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </motion.button>
              </div>

              {/* =================================================
                  Async feedback
              ================================================= */}
              <AnimatePresence mode="wait">
                {status.success && (
                  <motion.div
                    key="success"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={spring}
                    className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5 text-sm font-medium text-blue-700"
                    role="status"
                  >
                    <CheckCircle size={18} className="shrink-0" />

                    <span>
                      {t("contact.success") ||
                        "Your message has been sent successfully."}
                    </span>
                  </motion.div>
                )}

                {status.error && (
                  <motion.div
                    key="error"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={spring}
                    className="mt-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    <AlertCircle size={18} className="shrink-0" />

                    <span>{status.error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* =====================================================
              Bottom trust indicators
          ===================================================== */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Réponse rapide
            </div>

            <div className="hidden h-3 w-px bg-slate-200 sm:block" />

            <div className="text-xs font-medium text-slate-400">
              San Water · Algérie
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
