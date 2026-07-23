import React, { useEffect, useState } from 'react';
import { register_API } from '@/services/auth/sanwater_group.auth'; // adjust path
import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig';

const PAGE_CONTENT = {
  brand: {
    name: "Pagedone",
    logoAlt: "Pagedone Logo",
  },
  registerSection: {
    title: "Create Account",
    subtitle: "Start managing your data in a smarter way.",
    buttonText: "Sign Up",
    footerText: "Already have an account?",
    signInText: "Login",
    permissionsNote: "New accounts are created as admins with no permissions. A user with the 'Manage user permissions' permission can assign access from User Management."
  },
  promoSection: {
    title: "Control your Data With Our Smart Tool",
    description: "Invest intelligently and discover a better way to manage your entire wealth easily.",
  }
};

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    authKey: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authKeyFromQuery = params.get("auth_key");

    if (authKeyFromQuery) {
      setForm((prev) => ({
        ...prev,
        authKey: authKeyFromQuery,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password || !form.authKey) {
      return setError("All fields are required.");
    }

    try {
      setLoading(true);

      const payload = {
        userData: {
          fullName: form.fullName,
          password: form.password,
          email: form.email,
          authKey: form.authKey,
        },
      };

      const res = await register_API(payload);
      console.log(res);

      if (res?.success) {
        localStorage.setItem('role', res.result?.user.role);
        localStorage.setItem('permissions', JSON.stringify(res.result?.user?.permissions || []));
        localStorage.setItem('authKey', res.result?.user?.authKey);
        localStorage.setItem('public_id', res.result?.user.uid);
        window.location.href = SANWATERGROUPROUTES.analystics.fullPath;
      } else {
        setError(res?.message || "Registration failed.");
      }
    } catch (err) {
      console.log(err)
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans text-slate-900">
      <section className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2 xl:px-24">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center justify-center">
            <div className="flex w-20 items-center justify-center rounded-xl">
              <img src="/logo.svg" alt="logo" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-mainFont lg:text-4xl">
              {PAGE_CONTENT.registerSection.title}
            </h1>
            <p className="mt-3 text-slate-500">
              {PAGE_CONTENT.registerSection.subtitle}
            </p>
          </div>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 text-sm">
              {PAGE_CONTENT.registerSection.permissionsNote}
            </div>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full placeholder:font-bold rounded-full border border-slate-200 px-6 py-4 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full placeholder:font-bold rounded-full border border-slate-200 px-6 py-4 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full placeholder:font-bold rounded-full border border-slate-200 px-6 py-4 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />

            <input
              type="text"
              name="authKey"
              value={form.authKey}
              onChange={handleChange}
              placeholder="Auth Key"
              className="w-full placeholder:font-bold rounded-full border border-slate-200 px-6 py-4 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />

            <button
              disabled={loading}
              className={`w-full rounded-full py-4 font-bold text-white transition active:scale-[0.98] 
              ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {loading ? "Creating account..." : PAGE_CONTENT.registerSection.buttonText}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {PAGE_CONTENT.registerSection.footerText}{" "}
            <a href={SANWATERGROUPROUTES.auth.login.fullPath} className="font-semibold text-indigo-600 hover:text-indigo-500">
              {PAGE_CONTENT.registerSection.signInText}
            </a>
          </div>
        </div>
      </section>

      <section className="hidden lg:relative lg:flex lg:w-1/2 flex-col items-center justify-start bg-indigo-600 overflow-hidden pt-20 px-12">
        <div className="max-w-lg text-white text-center lg:text-left">
          <h2 className="text-4xl font-bold leading-tight">
            {PAGE_CONTENT.promoSection.title}
          </h2>
          <p className="mt-6 text-indigo-100 text-lg opacity-90">
            {PAGE_CONTENT.promoSection.description}
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

        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
      </section>
    </div>
  );
};

export default RegisterPage;