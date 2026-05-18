import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import { Box } from "lucide-react";
import { Rss } from "lucide-react";
import { Settings } from "lucide-react";
import { ChartColumnBig } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Analytics", icon:<ChartColumnBig  /> , path: SANWATERGROUPROUTES.analystics.fullPath },
  { name: "Content",   icon:<Rss  /> , path: SANWATERGROUPROUTES.content.fullPath },
  { name: "Products",  icon:<Box  /> , path: SANWATERGROUPROUTES.products.list.fullPath },
  { name: "Settings",  icon:<Settings  /> , path: SANWATERGROUPROUTES.settings.fullPath },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="text-xl font-semibold mb-6">Dashboard</div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex justify-start gap-2 items-center"> {item.icon} {item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}