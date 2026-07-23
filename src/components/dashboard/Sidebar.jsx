import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";
import { PERMISSIONS } from "@/configs/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { Box } from "lucide-react";
import { ListOrdered } from "lucide-react";
import { Rss } from "lucide-react";
import { Settings } from "lucide-react";
import { ChartColumnBig, Users, ClipboardList, Briefcase, MessageSquare, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Analytics", icon:<ChartColumnBig  /> , path: SANWATERGROUPROUTES.analystics.fullPath, permission: PERMISSIONS.ANALYTICS.VIEW },
  { name: "Products",  icon:<Box  /> , path: SANWATERGROUPROUTES.products.list.fullPath, permission: PERMISSIONS.PRODUCTS.VIEW },
  { name: "Orders",  icon:<ListOrdered  /> , path: SANWATERGROUPROUTES.orders.fullPath, permission: PERMISSIONS.ORDERS.VIEW },
  { name: "Hiring",    icon:<Briefcase /> , path: SANWATERGROUPROUTES.hiring.list.fullPath, permission: PERMISSIONS.HIRING.VIEW },
  { name: "Submissions", icon:<MessageSquare /> , path: SANWATERGROUPROUTES.submissions.list.fullPath, permission: PERMISSIONS.SUBMISSIONS.VIEW },
  { name: "Activity Logs", icon:<ClipboardList /> , path: SANWATERGROUPROUTES.logs.list.fullPath, permission: PERMISSIONS.LOGS.VIEW },
  { name: "Content",   icon:<Rss  /> , path: SANWATERGROUPROUTES.content.fullPath, permission: PERMISSIONS.CONTENT.VIEW },
  { name: "Profile",   icon:<User  /> , path: SANWATERGROUPROUTES.profile.fullPath, permission: null },
  { name: "Settings",  icon:<Settings  /> , path: SANWATERGROUPROUTES.settings.fullPath, permission: null },
];

export default function Sidebar() {
  const { can } = usePermissions();
  const visibleItems = navItems.filter((item) => !item.permission || can(item.permission));
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="text-xl font-semibold mb-6">Dashboard</div>

      <nav className="flex flex-col gap-2">
        {visibleItems.map((item) => (
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