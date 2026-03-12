import React from 'react'
import { Button } from '..'
import { ChevronLeft } from 'lucide-react'

function GoBacKButton() {
  return (
    <Button
     variant={`outline`}
     className={`w-full`}
     onClick={() => window.history.back()}
    >
        <ChevronLeft /> Back
    </Button>
  )
}

export default GoBacKButton