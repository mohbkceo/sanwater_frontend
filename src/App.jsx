import { useState } from 'react'
import './App.css'
import { Toaster } from 'sonner'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import Main from './routes/main'
import { About, CreateProductPage, ProductsListPage } from './routes'
import EditProductPage from './routes/products/sections/EditProductPage'

function App() {

  return (
    <BrowserRouter>
      <Toaster richColors/>
      <Routes>
         <Route path='/*' element={<Main />} />
         <Route path='/about' element={<About />}/>
         <Route path='/sanwater/admins/secure/products' element={<ProductsListPage />}/>
         <Route path="/sanwater/admins/secure/products/create" element={<CreateProductPage />}/>
         <Route path="/sanwater/admins/secure/products/edit" element={<EditProductPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
