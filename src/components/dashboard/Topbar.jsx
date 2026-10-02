import { useState } from "react";
import { ChevronDown, LogOut, Menu, Globe } from "lucide-react";
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
  const { t } = useTranslation();

  const [loggingOut, setLoggingOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout_API();

      ["role", "permissions", "authKey", "public_id"].forEach((key) =>
        localStorage.removeItem(key),
      );

      setUserMenuOpen(false);

      navigate(SANWATERGROUPROUTES.auth.login.fullPath, {
        replace: true,
      });
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
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenu}
          aria-label={t("admin.shell.open_navigation")}
          className="
            me-2
            grid h-10 w-10
            shrink-0
            place-items-center
            rounded-xl
            text-slate-600
            transition
            hover:bg-blue-50
            lg:hidden
          "
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand */}
        <div className="hidden w-64 shrink-0 items-center px-2 sm:flex lg:px-3">
          <img
            src="/logo.svg"
            alt={SAN_WATER_GROUP_NAME}
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSelector />

          {/* User dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((current) => !current)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
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
                  grid h-8 w-8
                  place-items-center
                  rounded-lg
                  bg-blue-600
                  text-xs
                  font-semibold
                  text-white
                "
              >
                SW
              </div>

              <div className="hidden text-start md:block">
                <p className="text-xs font-semibold text-slate-800">
                  {t("admin.shell.admin")}
                </p>

                <p className="text-[11px] text-slate-400">
                  {SAN_WATER_GROUP_NAME}
                </p>
              </div>

              <ChevronDown
                className={`
                  hidden h-4 w-4
                  text-slate-400
                  transition-transform
                  duration-200
                  md:block
                  ${userMenuOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div
                role="menu"
                className="
                  absolute end-0 top-[calc(100%+8px)]
                  z-50
                  w-56
                  overflow-hidden
                  rounded-2xl
                  border border-slate-200/80
                  bg-white
                  p-1.5
                  shadow-lg
                "
              >
                {/* User info */}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-slate-800">
                    {t("admin.shell.admin")}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {SAN_WATER_GROUP_NAME}
                  </p>
                </div>

                <div className="my-1 border-t border-slate-100" />

                {/* Logout */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="
                    flex w-full
                    items-center gap-2.5
                    rounded-xl
                    px-3 py-2.5
                    text-start
                    text-sm font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <LogOut className="h-4 w-4 shrink-0" />

                  <span>
                    {loggingOut
                      ? t("admin.shell.logging_out")
                      : t("admin.shell.logout")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
