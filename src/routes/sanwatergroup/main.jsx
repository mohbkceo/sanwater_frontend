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
import DashboardLayout from '@/layouts/DashboardLayout'

function SanWaterGroupMain() {
  return (
    <Routes>
        <Route path='/*' element={<DashboardLayout />}>
        <Route path={SANWATERGROUPROUTES.products.list.subPath} element={<ProductsListPage />} />
        <Route path={SANWATERGROUPROUTES.products.create.subPath} element={<CreateProductPage />} />
        <Route path={SANWATERGROUPROUTES.products.edit.subPath} element={<EditProductPage />} />
        <Route path={SANWATERGROUPROUTES.analystics.subPath} element={<Analytics />} />
        <Route path={SANWATERGROUPROUTES.content.subPath} element={<Content />} />
        <Route path={SANWATERGROUPROUTES.settings.subPath} element={<Settings />} />
       
        </Route>
        <Route path={SANWATERGROUPROUTES.auth.login.subPath} element={<LoginPage />} />
        <Route path={SANWATERGROUPROUTES.auth.register.subPath} element={<RegisterPage />} />
        <Route index element={<Navigate to={SANWATERGROUPROUTES.analystics.fullPath} replace/>}/>
    </Routes>
  )
}

export default SanWaterGroupMain