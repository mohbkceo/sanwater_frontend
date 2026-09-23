import {
  ChartColumnBig,
  Box,
  FolderTree,
  FileText,
  Briefcase,
  MessageSquare,
  ClipboardList,
  Rss,
  User,
  Settings,
  ChevronRight,
  ContactRound,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import { PERMISSIONS } from "@/configs/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslation } from "@/lib/i18n";
import { SAN_WATER_GROUP_NAME } from "@/configs/brand";

const navSections = [
  {
    label: "admin.nav.overview",
    items: [
      {
        name: "admin.nav.analytics",
        icon: ChartColumnBig,
        path: SANWATERGROUPROUTES.analystics.fullPath,
        permission: PERMISSIONS.ANALYTICS.VIEW,
      },
    ],
  },

  {
    label: "admin.nav.catalog",
    items: [
      {
        name: "admin.nav.products",
        icon: Box,
        path: SANWATERGROUPROUTES.products.list.fullPath,
        permission: PERMISSIONS.PRODUCTS.VIEW,
      },
      {
        name: "admin.nav.families",
        icon: FolderTree,
        path: SANWATERGROUPROUTES.products.families.control.fullPath,
        permission: PERMISSIONS.PRODUCTS.VIEW,
      },
    ],
  },

  {
    label: "admin.nav.operations",
    items: [
      {
        name: "admin.nav.quotations",
        icon: FileText,
        path: SANWATERGROUPROUTES.quotations.fullPath,
        permission: PERMISSIONS.QUOTATIONS.VIEW,
      },
      {
        name: "admin.nav.leads",
        icon: ContactRound,
        path: SANWATERGROUPROUTES.leads.fullPath,
        permission: PERMISSIONS.LEADS.VIEW,
      },
      {
        name: "admin.nav.hiring",
        icon: Briefcase,
        path: SANWATERGROUPROUTES.hiring.list.fullPath,
        permission: PERMISSIONS.HIRING.VIEW,
      },
      {
        name: "admin.nav.submissions",
        icon: MessageSquare,
        path: SANWATERGROUPROUTES.submissions.list.fullPath,
        permission: PERMISSIONS.SUBMISSIONS.VIEW,
      },
    ],
  },

  {
    label: "admin.nav.system",
    items: [
      {
        name: "admin.nav.activity_logs",
        icon: ClipboardList,
        path: SANWATERGROUPROUTES.logs.list.fullPath,
        permission: PERMISSIONS.LOGS.VIEW,
      },
      {
        name: "admin.nav.content",
        icon: Rss,
        path: SANWATERGROUPROUTES.content.fullPath,
        permission: PERMISSIONS.CONTENT.VIEW,
      },
      {
        name: "admin.nav.profile",
        icon: User,
        path: SANWATERGROUPROUTES.profile.fullPath,
        permission: null,
      },
      {
        name: "admin.nav.settings",
        icon: Settings,
        path: SANWATERGROUPROUTES.settings.fullPath,
        permission: null,
      },
    ],
  },
];

export default function Sidebar({ mobile = false, onNavigate }) {
  const { can } = usePermissions();
  const { t } = useTranslation();

  return (
    <aside className={mobile ? "block w-full" : "hidden w-64 shrink-0 lg:block"}>
      <div className={mobile ? "px-2 pb-4" : "sticky top-20 px-4 pb-4"}>
        <div
          className="
            rounded-3xl
            border border-white/70
            bg-white/65
            p-2
            backdrop-blur-2xl
            backdrop-saturate-150
            shadow-xs
          "
        >
          {/* Workspace */}
          <div
            className="
              mb-2
              flex items-center gap-3
              rounded-2xl
              px-3 py-2.5
            "
          >
            <div
              className="
                grid h-9 w-9
                place-items-center
                rounded-xl
                bg-blue-600
                text-xs
                font-semibold
                text-white
              "
            >
              SW
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {SAN_WATER_GROUP_NAME}
              </p>

              <p className="text-[11px] text-slate-400">{t("admin.shell.administration")}</p>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-300 rtl:rotate-180" />
          </div>

          {/* Navigation */}
          <nav className="space-y-4">
            {navSections.map((section) => {
              const visibleItems = section.items.filter(
                (item) => !item.permission || can(item.permission),
              );

              if (!visibleItems.length) {
                return null;
              }

              return (
                <div key={section.label}>
                  <p
                    className="
                      mb-1
                      px-3
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-slate-400
                    "
                  >
                    {t(section.label)}
                  </p>

                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <NavLink
                          key={item.name}
                          to={item.path}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            `
                            group
                            relative
                            flex
                            h-10
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            text-sm
                            font-medium
                            transition-all
                            duration-200

                            ${
                              isActive
                                ? `
                                  bg-blue-50
                                  text-blue-700
                                `
                                : `
                                  text-slate-500
                                  hover:bg-blue-50/60
                                  hover:text-slate-900
                                `
                            }
                            `
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span
                                  className="
                                    absolute
                                    start-0
                                    h-5
                                    w-0.5
                                    rounded-full
                                    bg-blue-600
                                  "
                                />
                              )}

                              <span
                                className={`
                                  grid
                                  h-8
                                  w-8
                                  shrink-0
                                  place-items-center
                                  rounded-lg
                                  transition
                                  ${
                                    isActive
                                      ? "bg-blue-100 text-blue-600"
                                      : "text-slate-400 group-hover:text-blue-600"
                                  }
                                `}
                              >
                                <Icon className="h-4 w-4" />
                              </span>

                              <span className="truncate">{t(item.name)}</span>

                              {isActive && (
                                <ChevronRight
                                  className="
                                    ms-auto
                                    h-3.5
                                    w-3.5
                                    text-blue-400
                                    rtl:rotate-180
                                  "
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Bottom status */}
          <div
            className="
              mt-4
              rounded-2xl
              border border-blue-100
              bg-blue-50/70
              p-3
            "
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>

              <span className="text-xs font-medium text-blue-700">
                {t("admin.shell.system_operational")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
