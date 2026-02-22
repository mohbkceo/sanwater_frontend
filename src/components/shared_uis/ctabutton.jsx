import React from 'react'
import { Button } from '..'
import { cn } from '@/lib/utils'

function CtaButton({href, label, icon, className, ...props}) {
  return (
     <Button 
              {...props}
              asChild 
              size="lg" 
              className={cn("group bg-black rounded-full px-8 py-6 text-base w-full sm:w-auto", className)}
            >
              <a href={href}>
                {label} 
                {icon}
              </a>
    </Button>
  )
}

export default CtaButton