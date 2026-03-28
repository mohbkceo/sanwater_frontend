import { SANWATERGROUPROUTES } from '@/configs/routes/routesConfig'
import React from 'react'
import { Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { CreateProductPage, EditProductPage, ProductsListPage } from '..'
import { Navigate } from 'react-router-dom'

function SanWaterGroupMain() {
  return (
    <Routes>
        <Route path={SANWATERGROUPROUTES.products.list.subPath} element={<ProductsListPage />} />
        <Route path={SANWATERGROUPROUTES.products.create.subPath} element={<CreateProductPage />} />
        <Route path={SANWATERGROUPROUTES.products.edit.subPath} element={<EditProductPage />} />

        <Route index element={<Navigate to={SANWATERGROUPROUTES.products.list.fullPath} replace/>}/>
    </Routes>
  )
}

export default SanWaterGroupMain