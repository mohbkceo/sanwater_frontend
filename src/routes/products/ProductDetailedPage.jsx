import MainLayout from '@/layouts/MainLayout';
import { getProduct } from '@/services/products/productServices';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { useParams } from 'react-router-dom';
import ProductUIRender from './sections/ProductUIRender';
import ProductNotFound from '@/components/products/ProductNotFound';
import LoadingPage from '@/components/shared_uis/LoadingPage';
import { GoBackButton } from '@/components';

function ProductDetailedPage() {
  const {serialNumber} = useParams();
  const [product, setProduct]  = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    async function fetch() {
        try {
            const data = await getProduct(serialNumber);
            console.log(data.data)
            setProduct(data.data);
        } catch (error) {
            console.log(error)
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
        <ProductNotFound  />
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