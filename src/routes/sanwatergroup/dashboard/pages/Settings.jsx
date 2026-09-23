import React from "react";
import { Users } from "lucide-react";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";
import { useTranslation } from "@/lib/i18n";



function Settings() {
  const { can } = usePermissions();
  const { t } = useTranslation();

  const settingsContents = [
    {
      id: 1,
      label: t("admin.settings.managing_admins"),
      path: SANWATERGROUPROUTES.settings.children.manage_users.subPath,
      description: t("admin.settings.managing_admins_description"),
      icon: Users,
      permission: PERMISSIONS.USERS.VIEW,
    },
    {
      id: 2,
      label: t("admin.settings.add_users"),
      // Creating an admin account now runs through the caller's own
      // authenticated session (see routes/sanwatergroup/main.jsx) rather
      // than the old "?auth_key=" invite-link workaround.
      path: SANWATERGROUPROUTES.auth.register.fullPath,
      description: t("admin.settings.add_users_description"),
      icon: Users,
      permission: PERMISSIONS.USERS.CREATE,
    },
  ];

  const filteredContents = settingsContents.filter((item) => {
    if (item.permission && !can(item.permission)) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {t("admin.settings.title")}
          </h1>

          <p className="mt-2 text-sm text-slate-600 md:text-base">
            {t("admin.settings.description")}
          </p>
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
                  {t("admin.settings.open_section")}
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
