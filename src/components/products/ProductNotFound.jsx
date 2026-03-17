import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'
import React from 'react'

function ProductNotFound({className, mainTitle = 'No products found', description = 'Your inventory is currently empty. Start by adding your first product.'}) {
  return (
     <div className={cn("flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-300 rounded-2xl", className)}>
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Package size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{mainTitle}</h3>
          <p className="opacity-80 font-light max-w-xs text-center mt-2">
            {description}
          </p>
    </div>
  )
}

export default ProductNotFound