import React from 'react'
import './App.css'
import { Routes, Route} from 'react-router-dom'
import Main from './routes/main'
import HiringPage from './routes/HiringPage'
import { About, ContactSales, ProductsViewList, SanWaterGroupMain } from './routes'
import { ABOUT, CONTACTSALES, LANDINGPRODUCT, mainSanWaterRoute, PRODUCTS, PRODUCTVIEWDETAIL } from './configs/routes/routesConfig'
import ProductDetailedPage from './routes/products/ProductDetailedPage'
import {useAnalytics} from './hooks/useAnalytics'
import LandingProduct from './routes/extra_routes/LandingProduct'

function App() {
  
  useAnalytics();
  
  return (
      <Routes>
         <Route path="/" element={<Main />} />
         <Route path="/hiring" element={<HiringPage />} />
         <Route path={ABOUT} element={<About />}/>
         <Route path={PRODUCTS} element={<ProductsViewList />}/>
         <Route path={PRODUCTVIEWDETAIL} element={<ProductDetailedPage />}/>
         <Route path={LANDINGPRODUCT} element={<LandingProduct />}/>
         <Route path={CONTACTSALES} element={<ContactSales />}/>
         <Route path={mainSanWaterRoute + '/*'} element={<SanWaterGroupMain />} />
      </Routes>
    
  )
}

export default App
