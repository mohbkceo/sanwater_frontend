import { useState } from 'react'
import './App.css'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import Main from './routes/main'
import { About, CreateProductPage, ProductsListPage } from './routes'

function App() {

  return (
    <BrowserRouter>
      <Routes>
         <Route path='/*' element={<Main />} />
         <Route path='/about' element={<About />}/>
         <Route path='/products' element={<ProductsListPage />}/>
         <Route path="/products/create" element={<CreateProductPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
