import { Topbar, Sidebar } from "@/components";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { X } from "lucide-react";


export default function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar onMenu={() => setMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
      {mobileNavOpen && <div className="fixed inset-0 z-[70] bg-slate-950/40 p-3 backdrop-blur-sm lg:hidden" onMouseDown={() => setMobileNavOpen(false)}><div className="h-full w-[min(88vw,320px)] overflow-y-auto rounded-3xl bg-[#f6f9ff] p-2 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex justify-end p-2"><button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="rounded-xl border bg-white p-2"><X className="h-4 w-4" /></button></div><Sidebar mobile onNavigate={() => setMobileNavOpen(false)} /></div></div>}
    </div>
  );
}
