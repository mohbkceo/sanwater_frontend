import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Image, ShoppingBag } from "lucide-react";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";

export const editContents = [
  {
    id: 1,
    label: "News",
    path: SANWATERGROUPROUTES.content.children.news.fullPath,
    description: "Manage articles, updates, and announcements.",
    icon: FileText,
  },
  {
    id: 2,
    label: "Images",
    path: SANWATERGROUPROUTES.content.children.images.fullPath,
    description: "Organize and update visual content.",
    icon: Image,
  },
  {
    id: 3,
    label: "Sales",
    path: SANWATERGROUPROUTES.content.children.sales.fullPath,
    description: "Edit offers, products, and promotions.",
    icon: ShoppingBag,
  },
];

function Content() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Editing Contents
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Choose the section you want to manage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {editContents.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.path}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white transition-transform duration-300 group-hover:scale-105">
                    <Icon size={22} />
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                    <ChevronRight size={18} />
                  </div>
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Content;