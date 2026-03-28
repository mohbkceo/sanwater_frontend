import React from 'react'
import { Footer, NavBar } from '../components'
import { cn } from '@/lib/utils'

function MainLayout({ className, bg = 'bg-[#00AEEF]', children, ...props}) {
  return (
    <div {...props} className={cn(`h-screen relative overflow-x-hidden ${bg}`)}>
        <NavBar />
        <main  className='overflow-hidden pt-32 w-[92%] mx-auto' id='main-content'>
            {children}
        </main>
        <Footer />
    </div>
  )
}

export default MainLayout