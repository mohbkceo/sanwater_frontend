import React from "react";
import { useTranslation } from "../lib/i18n.jsx";
import { Footer, NavBar } from "../components";
import { cn } from "@/lib/utils";

function MainLayout({ className, bg = "bg-[#F5F8FC]", children, ...props }) {
  const { t } = useTranslation();

  return (
    <div
      dir="auto"
      {...props}
      className={cn("relative min-h-screen overflow-x-clip", bg, className)}
    >
      {/* =========================================================
          Global ambient background
          Very subtle: adds depth without becoming decorative noise.
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-[-180px] top-[8%] h-[420px] w-[420px] rounded-full bg-blue-200/20 blur-3xl" />

        <div className="absolute right-[-180px] top-[28%] h-[500px] w-[500px] rounded-full bg-sky-200/20 blur-3xl" />

        <div className="absolute bottom-[-220px] left-[35%] h-[480px] w-[480px] rounded-full bg-blue-100/25 blur-3xl" />
      </div>

      {/* =========================================================
          Floating navigation layer
          NavBar itself should contain the Liquid Glass surface.
      ========================================================= */}
      <NavBar />

      {/* =========================================================
          Main content
          No giant top padding.
          Pages control their own internal rhythm.
      ========================================================= */}
      <main
        id="main-content"
        className="relative mx-auto w-full max-w-[1600px] px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pt-28"
      >
        {children}
      </main>

      {/* =========================================================
          Footer
      ========================================================= */}
      <Footer />
    </div>
  );
}

export default MainLayout;
