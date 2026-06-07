import MainLayout from '@/layouts/MainLayout'
import React from 'react'
import Hero from './main/sections/Hero'
import AboutSection from './main/sections/AboutSection'
import WhyChooseUs from './main/sections/WhyChooseUs'
import Testimonials from './main/sections/Testimonials'
import DynamicProductSection from './main/sections/DynamicProductSection'
import ContactForm from '@/components/main/ContactForm'
import WhatsAppButton from '@/components/shared_uis/WhatsAppButton'


function Main() {
  return (
    <MainLayout className={'flex font-(family-name:--font-main-font) flex-col gap-3'}>
        <Hero />
        <DynamicProductSection />
        <AboutSection />
        <WhyChooseUs />
        <Testimonials />
        <ContactForm />
        <WhatsAppButton />
    </MainLayout>
  )
}

export default Main