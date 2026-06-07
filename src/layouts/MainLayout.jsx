import React from 'react'
import { useTranslation } from "../lib/i18n.jsx";
import { Footer, NavBar } from '../components'
import { cn } from '@/lib/utils'

function MainLayout({ className, bg = 'bg-[#00AEEF]/40', children, ...props}) {
  const { t } = useTranslation();
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