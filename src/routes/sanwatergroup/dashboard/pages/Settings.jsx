import React from "react";
import { ShieldCheck, Users, Copy } from "lucide-react";

export const settingsContents = [
  {
    id: 1,
    label: "Managing Admins",
    path: "/manage-users",
    description: "Control admin accounts and permissions.",
    icon: Users,
    adminOnly: false,
  },
];

function Settings({ user }) {
  const role = localStorage.getItem('role');
  const authKey = localStorage.getItem('authKey');
  const _id = localStorage.getItem('_id');

  const authorizationKey = authKey;

  const copyAuthorizationKey = async () => {
    try {
      await navigator.clipboard.writeText(authorizationKey);
    } catch (error) {
      console.error("Failed to copy authorization key:", error);
    }
  };

  const filteredContents = settingsContents.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Manage system settings and account permissions.
          </p>
        </div>

        
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Authorization Key
              </h2>

              <p className="text-sm text-slate-500">
                Read-only identification key.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={authorizationKey}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
            />

            <button
              onClick={copyAuthorizationKey}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
        </div>

        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContents.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.id}
                href={item.path}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white transition-transform duration-300 group-hover:scale-105">
                  <Icon size={22} />
                </div>

                <div className="mt-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {item.label}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 h-px w-full bg-slate-100" />

                <div className="mt-4 text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-950">
                  Open section
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Settings;