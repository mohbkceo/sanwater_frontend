import MainLayout from '@/layouts/MainLayout'
import React from 'react'
import Hero from './main/sections/Hero'
import AboutSection from './main/sections/AboutSection'
import WhyChooseUs from './main/sections/WhyChooseUs'
import Testimonials from './main/sections/Testimonials'


function Main() {
  return (
    <MainLayout className={'flex font-(family-name:--font-main-font) flex-col gap-3'}>
        <Hero />
        <AboutSection />
        <WhyChooseUs />
        <Testimonials />
    </MainLayout>
  )
}

export default Main