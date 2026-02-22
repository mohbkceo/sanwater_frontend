import React from 'react'
import { Footer, NavBar } from '../components'
import { cn } from '@/lib/utils'

function MainLayout({ className, children}) {
  return (
    <div className='h-screen relative overflow-x-hidden bg-[#00AEEF]'>
        <NavBar />
        <main  className={cn('overflow-hidden pt-32 w-[92%] mx-auto', className)} id='main-content'>
            {children}
        </main>
        <Footer />
    </div>
  )
}

export default MainLayout