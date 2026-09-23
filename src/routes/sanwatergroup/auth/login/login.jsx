import { useTranslation } from "@/lib/i18n";
import React, { useState } from 'react';
import { signIn_API } from '@/services/auth/sanwater_group.auth'; // adjust path later
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';

const LoginPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    identifier: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.identifier || !form.password) {
      return setError(t("admin.auth.all_fields_are_required"));
    }

    try {
      setLoading(true);

      const res = await signIn_API(form);
      console.log(res);

      if (res?.success) {
        localStorage.setItem('role', res.result?.user.role);
        localStorage.setItem('permissions', JSON.stringify(res.result?.user?.permissions || []));
        localStorage.setItem('authKey', res.result?.user?.authKey);
        localStorage.setItem('public_id', res.result?.user.uid);
        window.location.href = SANWATERGROUPROUTES.analystics.fullPath;
        
      } else {
        setError(res?.message || t("admin.auth.login_failed"));
      }

    } catch (err) {
      setError(err?.response?.data?.message || t("admin.auth.something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans text-slate-900">
      
      {/* LEFT SIDE */}
      <section className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2 xl:px-24">
        <div className="w-full max-w-md">
          
          <div className="mb-12 flex items-center justify-center">
            <div className="flex w-20 items-center justify-center rounded-xl">
              <img src='/logo.svg' alt={t("admin.auth.logo")} />
            </div>
          </div>

          <div className="text-center lg:text-start">
            <h1 className="text-3xl font-mainFont lg:text-4xl">
              {t("admin.auth.welcome_back")}
            </h1>
            <p className="mt-3 text-slate-500">
              {t("admin.auth.login_description")}
            </p>
          </div>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            
            {/* ERROR */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder={t("admin.auth.email_or_username")}
                className="w-full placeholder:font-bold rounded-full border border-slate-200 px-6 py-4 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t("admin.auth.password")}
                className="w-full placeholder:font-bold rounded-full border border-slate-200 px-6 py-4 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                {t("admin.auth.forgot_password")}
              </a>
            </div>

            <button
              disabled={loading}
              className={`w-full rounded-full py-4 font-bold text-white transition active:scale-[0.98] 
              ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {loading ? t("admin.auth.logging_in") : t("admin.auth.login")}
            </button>
          </form>

        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="hidden lg:relative lg:flex lg:w-1/2 flex-col items-center justify-start bg-indigo-600 overflow-hidden pt-20 px-12">
        <div className="max-w-lg text-white text-center lg:text-start">
          <h2 className="text-4xl font-bold leading-tight">
            {t("admin.auth.promo_title")}
          </h2>
          <p className="mt-6 text-indigo-100 text-lg opacity-90">
            {t("admin.auth.promo_description")}
          </p>
        </div>

        <div className="mt-12 w-[120%] lg:w-[140%] translate-x-12 translate-y-10 rounded-tl-3xl bg-slate-50 p-4 shadow-2xl ring-8 ring-white/10">
          <div className="flex h-full w-full flex-col rounded-2xl bg-white p-6">
             
             <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="h-4 w-32 rounded bg-slate-100"></div>
                <div className="h-8 w-8 rounded-full bg-indigo-50"></div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="h-24 rounded-xl bg-slate-50 border border-slate-100"></div>
                <div className="h-24 rounded-xl bg-slate-50 border border-slate-100"></div>
                <div className="h-24 rounded-xl bg-slate-50 border border-slate-100"></div>
             </div>

             <div className="h-48 w-full rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                   <svg className="w-full h-full opacity-20" viewBox="0 0 400 100">
                      <path d="M0 50 Q 50 10 100 50 T 200 50 T 300 50 T 400 50" fill="none" stroke="#4f46e5" strokeWidth="2" />
                   </svg>
                </div>
             </div>

          </div>
        </div>

        <div className="absolute -top-24 -end-24 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
      </section>
    </div>
  );
};

export default LoginPage;
