import React from 'react'
import { Button } from '..'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

function GoBacKButton({variant = `outline`, className, text = 'Back', ...props}) {
  return (
    <Button
     variant={variant}
     className={cn(`w-full`, className)}
     onClick={() => window.history.back()}
     {...props}
    >
        <ChevronLeft /> {text}
    </Button>
  )
}

export default GoBacKButton