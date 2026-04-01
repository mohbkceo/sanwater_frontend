import React, { useState, useMemo } from "react";

import MainLayout from "@/layouts/MainLayout";
import useProducts from "@/services/products/useProducts";
import ProductCard from "./sections/ProductItem";
import { Search } from "lucide-react";
import { Button, Header } from "@/components";
import { useEffect } from "react";
import ProductNotFound from "@/components/products/ProductNotFound";

const Title = "SanWater Produits";

export default function ProductViewList() {
  const { products, refetch, loading} = useProducts();
  const [search, setSearch] = useState("");

  useEffect(() => {
    refetch(`?search=${search}`)
  }, [search])


  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">

           <Header title={Title} discription={"Découvrez notre collection complète de produits SanWater."}/>
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-white/10 ring-0 bg-white/20 rounded-lg px-4 py-3 pl-10 focus:outline-none   focus:border-white/25"
            />

            <Search className="w-5 h-5 absolute left-3 top-3.5 "/>
          </div>
        
        <div className={(`grid ${loading ? 'opacity-30' : ""} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6`)}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        
        
        {!loading && products.length === 0 && (
          <ProductNotFound className={`bg-white/20`} description="Les produits que vous recherchez sont introuvables." mainTitle="Aucun produit trouvé" />
        )}


        <div className="w-full mt-12">
          <Button variant={`secondary`} className={`border text-balck hover:bg-white/30 border-white/20 bg-white/20 w-full`}> Charger plus </Button>
        </div>

      </div>
    </MainLayout>
  );
}