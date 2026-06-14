import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig'
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

function SanWaterGroupMain() {
  return (
    <Routes>
        <Route path='/*' element={<DashboardLayout />}>
        <Route path={SANWATERGROUPROUTES.products.list.subPath} element={<ProductsListPage />} />
        <Route path={SANWATERGROUPROUTES.products.create.subPath} element={<CreateProductPage />} />
        <Route path={SANWATERGROUPROUTES.products.edit.subPath} element={<EditProductPage />} />
        <Route path={SANWATERGROUPROUTES.analystics.subPath} element={<Analytics />} />

        <Route path={SANWATERGROUPROUTES.content.subPath} element={<Content />} />
        <Route path={SANWATERGROUPROUTES.content.children.sales.subPath} element={<EditSalesPage />} />

        <Route path={SANWATERGROUPROUTES.settings.subPath} element={<Settings />} />
        <Route path={SANWATERGROUPROUTES.settings.children.manage_users.subPath} element={<UserManagement />} />
       
        <Route path={SANWATERGROUPROUTES.logs.list.subPath} element={<ActivityLogs />} />
        <Route path={SANWATERGROUPROUTES.hiring.list.subPath} element={<HiringManagement />} />
        <Route path={SANWATERGROUPROUTES.submissions.list.subPath} element={<ContactSubmissions />} />
       
        </Route>
        <Route path={SANWATERGROUPROUTES.auth.login.subPath} element={<LoginPage />} />
        <Route path={SANWATERGROUPROUTES.auth.register.subPath} element={<RegisterPage />} />
        <Route index element={<Navigate to={SANWATERGROUPROUTES.analystics.fullPath} replace/>}/>
    </Routes>
  )
}

export default SanWaterGroupMain