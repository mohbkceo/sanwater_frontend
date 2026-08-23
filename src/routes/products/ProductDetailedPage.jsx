import MainLayout from '@/layouts/MainLayout';
import { getProduct } from '@/services/products/productServices';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom';
import ProductUIRender from './sections/ProductUIRender';
import ProductNotFound from '@/components/products/ProductNotFound';
import LoadingPage from '@/components/shared_uis/LoadingPage';
import { GoBackButton } from '@/components';
import { useTranslation } from '@/lib/i18n';
import { PRODUCTS } from '@/configs/routes/routesConfig';

function ProductDetailedPage() {
  const {serialNumber} = useParams();
  const [product, setProduct]  = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    async function fetch() {
        try {
            const data = await getProduct(serialNumber);
            setProduct(data.data);
        } catch {
            // Product missing/deleted — handled by the not-found state below,
            // nothing to surface here beyond stopping the loading state.
        } finally {
            setLoading(false);
        }
    }
    fetch();
  }, [serialNumber])

  if(loading) return (
    <MainLayout>
        <LoadingPage />
    </MainLayout>
  )

  if(!product) return (
    <MainLayout >
        <ProductNotFound
          mainTitle={t('products.no_products_found_title')}
          description={t('products.no_products_found_description')}
        />
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <Link to={PRODUCTS} className="text-[#0050A4] font-semibold hover:underline">
            &larr; {t('products.title')}
          </Link>
        </div>
     </MainLayout>
  )



  return (
    <MainLayout bg={`bg-gray-200/90`}>
      <GoBackButton text='Retour' />
      <ProductUIRender product={product}/>
    </MainLayout>
  )
}

export default ProductDetailedPage
