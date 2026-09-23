import { useTranslation } from "@/lib/i18n";
import React, { useState } from "react";
import { register_API } from "@/services/auth/sanwater_group.auth";
import { Header } from "@/components";

// This creates a *new* admin account — it is a permissioned action taken by
// an already-authenticated admin (see PermissionGuard wrapping this route in
// sanwatergroup/main.jsx), not public self-registration. It must not touch
// the creating admin's own session/localStorage.
const CreateAdminPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreated(null);

    if (!form.fullName || !form.email || !form.password) {
      return setError(t("admin.auth.all_fields_are_required"));
    }

    try {
      setLoading(true);

      const payload = {
        userData: {
          fullName: form.fullName,
          password: form.password,
          email: form.email,
        },
      };

      const res = await register_API(payload);

      if (res?.success) {
        setCreated(res.result?.user);
        setForm({ fullName: "", email: "", password: "" });
      } else {
        setError(res?.message || t("admin.auth.could_not_create_the_account"));
      }
    } catch (err) {
      setError(err?.response?.data?.message || t("admin.auth.something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title={t("admin.auth.create_admin_account")} />

      <div className="max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-6">
          {t("admin.auth.create_account_description")}
        </p>

        {created && (
          <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">
            {t("admin.auth.account_created_for_email", { email: created.email })}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 text-sm">
            {t("admin.auth.permissions_note")}
          </div>

          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder={t("admin.auth.full_name")}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("admin.auth.email")}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("admin.auth.temporary_password")}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />

          <button
            disabled={loading}
            className={`w-full rounded-lg py-3 font-bold text-white transition active:scale-[0.98]
            ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {loading ? t("admin.auth.creating") : t("admin.auth.create_account")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminPage;
