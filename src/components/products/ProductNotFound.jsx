import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'
import React from 'react'
import { useTranslation } from '@/lib/i18n'

function ProductNotFound({className, mainTitle, description, admin = false}) {
  const { t } = useTranslation()
  const title = mainTitle || (admin ? t('admin.products.no_products_found') : t('products.no_products_found_title'))
  const detail = description || (admin ? t('admin.products.empty_inventory') : t('products.no_products_found_description'))
  return (
     <div className={cn("flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-300 rounded-2xl", className)}>
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Package size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="opacity-80 font-light max-w-xs text-center mt-2">
            {detail}
          </p>
    </div>
  )
}

export default ProductNotFound
