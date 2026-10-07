import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig'
import { PERMISSIONS } from '@/configs/permissions'
import React from 'react'
import { Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import {
  CreateProductPage,
  EditProductPage,
  ProductsListPage,
  FamiliesControlPage,
} from '..'
import { Navigate } from 'react-router-dom'
import LoginPage from './auth/login/login'
import CreateAdminPage from './auth/register/register'
import Analytics from './dashboard/pages/Analytics'
import IntelligenceDomain from './dashboard/pages/IntelligenceDomain'
import AttentionCenter from './dashboard/pages/AttentionCenter'
import SubjectIntelligence from './dashboard/pages/SubjectIntelligence'
import SubjectExplorer from './dashboard/pages/SubjectExplorer'
import ApplicationsPage from './dashboard/pages/ApplicationsPage'
import Content from './dashboard/pages/Content'
import Settings from './dashboard/pages/Settings'
import UserManagement from './dashboard/pages/UserManagement'
import ActivityLogs from './dashboard/pages/ActivityLogs'
import HiringManagement from './dashboard/pages/HiringManagement'
import ContactSubmissions from './dashboard/pages/ContactSubmissions'
import DashboardLayout from '@/layouts/DashboardLayout'
import EditSalesPage from './dashboard/pages/EditSales'
import NewsManagementPage from './dashboard/pages/News/NewsManagementPage'
import UserProfile from './dashboard/pages/UserProfile'
import QuotationsManagementPage from './dashboard/pages/QuotationsManagementPage'
import LeadsManagementPage from './dashboard/pages/LeadsManagementPage'
import PermissionGuard from '@/components/shared_uis/PermissionGuard'

const CreateEditNewsPage = React.lazy(() => import('./dashboard/pages/News/CreateEditNewsPage'))
const newsEditorFallback = <div className="m-6 h-96 animate-pulse rounded-2xl bg-slate-100" aria-busy="true" />

function SanWaterGroupMain() {
  return (
    <Routes>
        <Route path='/*' element={<DashboardLayout />}>
        <Route index element={<Analytics />} />
        <Route path={SANWATERGROUPROUTES.products.list.subPath} element={<PermissionGuard permission={PERMISSIONS.PRODUCTS.VIEW}><ProductsListPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.products.create.subPath} element={<PermissionGuard permission={PERMISSIONS.PRODUCTS.MANAGE}><CreateProductPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.products.edit.subPath} element={<PermissionGuard permission={PERMISSIONS.PRODUCTS.MANAGE}><EditProductPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.products.families.control.subPath} element={<PermissionGuard permission={PERMISSIONS.PRODUCTS.VIEW}><FamiliesControlPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.analystics.subPath} element={<Navigate to={SANWATERGROUPROUTES.home.fullPath} replace />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="analytics/:domain" element={<IntelligenceDomain />} />
        <Route path="attention" element={<AttentionCenter />} />
        <Route path="explore" element={<PermissionGuard permission={PERMISSIONS.ANALYTICS.EXPLORE}><SubjectExplorer /></PermissionGuard>} />
        <Route path="subjects/:type/:id" element={<SubjectIntelligence />} />
        <Route path="applications" element={<PermissionGuard permission={PERMISSIONS.HIRING.VIEW}><ApplicationsPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.content.subPath} element={<PermissionGuard permission={PERMISSIONS.CONTENT.VIEW}><Content /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.news.subPath} element={<PermissionGuard permission={PERMISSIONS.CONTENT.VIEW}><NewsManagementPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.news.subPath + '/create'} element={<PermissionGuard permission={PERMISSIONS.CONTENT.MANAGE}><React.Suspense fallback={newsEditorFallback}><CreateEditNewsPage /></React.Suspense></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.news.subPath + '/edit/:id'} element={<PermissionGuard permission={PERMISSIONS.CONTENT.MANAGE}><React.Suspense fallback={newsEditorFallback}><CreateEditNewsPage /></React.Suspense></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.sales.subPath} element={<PermissionGuard permission={PERMISSIONS.CONTENT.MANAGE}><EditSalesPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.settings.subPath} element={<Settings />} />
        <Route path={SANWATERGROUPROUTES.settings.children.manage_users.subPath} element={<PermissionGuard permission={PERMISSIONS.USERS.VIEW}><UserManagement /></PermissionGuard>} />
        {/* Creating a new admin account is now an authenticated, permissioned
            action (see server/src/routes/user.routes.js) — no longer public
            self-registration — so it lives inside the guarded dashboard shell. */}
        <Route path={SANWATERGROUPROUTES.auth.register.subPath} element={<PermissionGuard permission={PERMISSIONS.USERS.CREATE}><CreateAdminPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.quotations.subPath} element={<PermissionGuard permission={PERMISSIONS.QUOTATIONS.VIEW}><QuotationsManagementPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.leads.subPath} element={<PermissionGuard permission={PERMISSIONS.LEADS.VIEW}><LeadsManagementPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.profile.subPath} element={<UserProfile />} />

        <Route path={SANWATERGROUPROUTES.logs.list.subPath} element={<PermissionGuard permission={PERMISSIONS.LOGS.VIEW}><ActivityLogs /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.hiring.list.subPath} element={<PermissionGuard permission={PERMISSIONS.HIRING.VIEW}><HiringManagement /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.submissions.list.subPath} element={<PermissionGuard permission={PERMISSIONS.SUBMISSIONS.VIEW}><ContactSubmissions /></PermissionGuard>} />

        </Route>
        <Route path={SANWATERGROUPROUTES.auth.login.subPath} element={<LoginPage />} />
    </Routes>
  )
}

export default SanWaterGroupMain
