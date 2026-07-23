import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig'
import { PERMISSIONS } from '@/configs/permissions'
import React from 'react'
import { Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { CreateProductPage, EditProductPage, ProductsListPage } from '..'
import { Navigate } from 'react-router-dom'
import LoginPage from './auth/login/login'
import RegisterPage from './auth/register/register'
import Analytics from './dashboard/pages/Analytics'
import Content from './dashboard/pages/Content'
import Settings from './dashboard/pages/Settings'
import UserManagement from './dashboard/pages/UserManagement'
import ActivityLogs from './dashboard/pages/ActivityLogs'
import HiringManagement from './dashboard/pages/HiringManagement'
import ContactSubmissions from './dashboard/pages/ContactSubmissions'
import DashboardLayout from '@/layouts/DashboardLayout'
import EditSalesPage from './dashboard/pages/EditSales'
import NewsManagementPage from './dashboard/pages/News/NewsManagementPage'
import CreateEditNewsPage from './dashboard/pages/News/CreateEditNewsPage'
import UserProfile from './dashboard/pages/UserProfile'
import OrderManagementPage from './dashboard/pages/OrderManagementPage'
import PermissionGuard from '@/components/shared_uis/PermissionGuard'

function SanWaterGroupMain() {
  return (
    <Routes>
        <Route path='/*' element={<DashboardLayout />}>
        <Route path={SANWATERGROUPROUTES.products.list.subPath} element={<PermissionGuard permission={PERMISSIONS.PRODUCTS.VIEW}><ProductsListPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.products.create.subPath} element={<PermissionGuard permission={PERMISSIONS.PRODUCTS.MANAGE}><CreateProductPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.products.edit.subPath} element={<PermissionGuard permission={PERMISSIONS.PRODUCTS.MANAGE}><EditProductPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.analystics.subPath} element={<PermissionGuard permission={PERMISSIONS.ANALYTICS.VIEW}><Analytics /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.content.subPath} element={<PermissionGuard permission={PERMISSIONS.CONTENT.VIEW}><Content /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.news.subPath} element={<PermissionGuard permission={PERMISSIONS.CONTENT.VIEW}><NewsManagementPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.news.subPath + '/create'} element={<PermissionGuard permission={PERMISSIONS.CONTENT.MANAGE}><CreateEditNewsPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.news.subPath + '/edit/:id'} element={<PermissionGuard permission={PERMISSIONS.CONTENT.MANAGE}><CreateEditNewsPage /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.content.children.sales.subPath} element={<PermissionGuard permission={PERMISSIONS.CONTENT.MANAGE}><EditSalesPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.settings.subPath} element={<Settings />} />
        <Route path={SANWATERGROUPROUTES.settings.children.manage_users.subPath} element={<PermissionGuard permission={PERMISSIONS.USERS.VIEW}><UserManagement /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.orders.subPath} element={<PermissionGuard permission={PERMISSIONS.ORDERS.VIEW}><OrderManagementPage /></PermissionGuard>} />

        <Route path={SANWATERGROUPROUTES.profile.subPath} element={<UserProfile />} />

        <Route path={SANWATERGROUPROUTES.logs.list.subPath} element={<PermissionGuard permission={PERMISSIONS.LOGS.VIEW}><ActivityLogs /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.hiring.list.subPath} element={<PermissionGuard permission={PERMISSIONS.HIRING.VIEW}><HiringManagement /></PermissionGuard>} />
        <Route path={SANWATERGROUPROUTES.submissions.list.subPath} element={<PermissionGuard permission={PERMISSIONS.SUBMISSIONS.VIEW}><ContactSubmissions /></PermissionGuard>} />

        </Route>
        <Route path={SANWATERGROUPROUTES.auth.login.subPath} element={<LoginPage />} />
        <Route path={SANWATERGROUPROUTES.auth.register.subPath} element={<RegisterPage />} />
        <Route index element={<Navigate to={SANWATERGROUPROUTES.analystics.fullPath} replace/>}/>
    </Routes>
  )
}

export default SanWaterGroupMain
