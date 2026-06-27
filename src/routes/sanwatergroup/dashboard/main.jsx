import { Routes, Route, Navigate } from "react-router-dom";

import Analytics from "./pages/Analytics";
import Content from "./pages/Content";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="analytics" />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="content" element={<Content />} />
        <Route path="products" element={<Products />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}