import { useState } from 'react'
import './App.css'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import Main from './routes/main'

function App() {

  return (
    <BrowserRouter>
      <Routes>
         <Route path='/*' element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
