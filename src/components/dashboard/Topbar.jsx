import { useState } from "react";
import { Bell, Search, ChevronDown, LogOut, Menu, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout_API } from "@/services/auth/sanwater_group.auth";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import { SUPPORTED_LANGUAGES, useTranslation } from "@/lib/i18n";
import { SAN_WATER_GROUP_NAME } from "@/configs/brand";

const languageLabels = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};
const SEARCH_SHORTCUT = "⌘ K";

function LanguageSelector() {
  const { lang, setLang, t } = useTranslation();

  return (
    <label className="relative flex h-10 items-center rounded-xl border border-blue-100 bg-blue-50/70 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50">
      <Globe
        aria-hidden="true"
        className="pointer-events-none absolute start-3 h-4 w-4 text-blue-500"
      />

      <span className="sr-only">{t("admin.shell.language")}</span>

      <select
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        aria-label={t("admin.shell.language")}
        dir="ltr"
        className="h-full w-[112px] cursor-pointer appearance-none bg-transparent ps-9 pe-7 text-xs font-semibold uppercase tracking-wide outline-none"
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {languageLabels[language]}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute end-2.5 h-3.5 w-3.5 text-slate-400"
      />
    </label>
  );
}

export default function Topbar({ onMenu }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout_API();
      ["role", "permissions", "authKey", "public_id"].forEach((key) =>
        localStorage.removeItem(key),
      );
      navigate(SANWATERGROUPROUTES.auth.login.fullPath, { replace: true });
    } catch {
      // The shared API interceptor already shows the server/network error.
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 lg:px-6">
      <div
        className="
          flex h-14 items-center
          rounded-2xl
          border border-white/70
          bg-white/70
          px-3
          backdrop-blur-2xl
          backdrop-saturate-150
          shadow-xs
        "
      >
        {/* Brand */}
        <button type="button" onClick={onMenu} aria-label={t("admin.shell.open_navigation")} className="me-2 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-blue-50 lg:hidden"><Menu className="h-5 w-5" /></button>
        <div className="hidden w-64 shrink-0 items-center px-2 sm:flex lg:px-3">
          <img
            src="/logo.svg"
            alt={SAN_WATER_GROUP_NAME}
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Search */}
        <div className="flex min-w-0 flex-1">
          <button
            className="
              flex h-10 w-full max-w-xl items-center
              gap-2.5
              rounded-xl
              border border-transparent
              bg-blue-50/70
              px-3.5
              text-sm
              text-slate-400
              transition
              hover:border-blue-100
              hover:bg-blue-50
            "
          >
            <Search className="h-4 w-4 shrink-0 text-blue-500" />

            <span className="truncate">
              {t("admin.shell.search_placeholder")}
            </span>

            <span
              className="
                ms-auto hidden
                rounded-md
                border border-blue-100
                bg-white/80
                px-1.5 py-0.5
                text-[10px]
                font-medium
                text-slate-400
                sm:inline-flex
              "
            >
              {SEARCH_SHORTCUT}
            </span>
          </button>
        </div>

        {/* Right actions */}
        <div className="ms-3 flex items-center gap-2">
          <button
            className="
              relative
              grid h-10 w-10 place-items-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-blue-50
              hover:text-blue-600
            "
          >
            <Bell className="h-4.5 w-4.5" />

            <span
              className="
                absolute end-2 top-2
                h-1.5 w-1.5
                rounded-full
                bg-blue-600
              "
            />
          </button>

          <button
            className="
              flex h-10 items-center gap-2
              rounded-xl
              px-2
              transition
              hover:bg-blue-50
            "
          >
            <div
              className="
                grid h-8 w-8 place-items-center
                rounded-lg
                bg-blue-600
                text-xs font-semibold
                text-white
              "
            >
              SW
            </div>

            <div className="hidden text-start md:block">
              <p className="text-xs font-semibold text-slate-800">{t("admin.shell.admin")}</p>

              <p className="text-[11px] text-slate-400">{SAN_WATER_GROUP_NAME}</p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          <LanguageSelector />

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label={t("admin.shell.logout")}
            className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              {loggingOut ? t("admin.shell.logging_out") : t("admin.shell.logout")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
