import { useTranslation } from "@/lib/i18n";
import ProductForm from '@/components/products/ProductForm';
import GoBacKButton from '@/components/shared_uis/gobackbutton';
import { getProduct } from '@/services/products/productServices';
import { Package } from 'lucide-react';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'

function useQuery(){
    return new URLSearchParams(useLocation().search)
}

function validateSearching(serialNumber){
    if(!serialNumber || !serialNumber.startsWith(`product`)){
        return false;
    }
    return true;
}



function EditProductPage() {
  const { t } = useTranslation();
  const getQuery = useQuery()
  const serialNumber = getQuery.get(`serialNumber`);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  
  async function searchProduct(serialNumber) {
    setLoading(true);
    try {
        const result = await getProduct(serialNumber, { isAdmin: true });
        setProduct(result.data);
    } catch (error) {
        console.log(error)
    } finally {
        setLoading(false);
    }
    
  }
  
  useEffect(() => {
    if(!validateSearching(serialNumber)) {
        return;
    };
    
    searchProduct(serialNumber);
  }, [serialNumber])

  if(loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(1)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />
          ))}
    </div>
  )
  if(!product) return (
    <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-300 rounded-2xl">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Package size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{t("admin.products.no_product_found")}</h3>
          <p className="text-slate-500 max-w-xs text-center mt-2">
            {t("admin.products.no_product_has_been_found")}
          </p>
    </div>
  )

  return (
    <div className='p-6 flex md:w-[60%] gap-2 flex-col mx-auto'>
    <GoBacKButton text={t("admin.common.back")} />
    <header className="my-8">
                    <h2 className="text-2xl font-bold text-slate-800">{t("admin.products.update_product")}</h2>
                    <p className="text-slate-500 text-sm">{t("admin.products.fill_in_the_details_below_to_add_update_items")}</p>
    </header>
    <ProductForm product={product} />
    </div>
  )
}

export default EditProductPage
