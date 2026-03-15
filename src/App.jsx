import React from 'react'
import './App.css'
import { Toaster } from 'sonner'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import Main from './routes/main'
import { About, ProductsViewList, SanWaterGroupMain } from './routes'
import { ABOUT, mainSanWaterRoute, PRODUCTS } from './configs/routes/routesConfig'

function App() {

  return (
    <BrowserRouter>
      <Toaster richColors/>
      <Routes>
         <Route path='/*' element={<Main />} />
         <Route path={ABOUT} element={<About />}/>
         <Route path={PRODUCTS} element={<ProductsViewList />}/>
         <Route path={mainSanWaterRoute + '/*'} element={<SanWaterGroupMain />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
