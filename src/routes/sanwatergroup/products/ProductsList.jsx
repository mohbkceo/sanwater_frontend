import useProducts from "@/services/products/useProducts";
import { deleteProduct, updateProduct } from "@/services/products/productServices";
import { Plus, Package, RefreshCw } from "lucide-react"; // Optional icon library
import { Button, ProductCard } from "@/components";
import { useNavigate } from "react-router-dom";
import ProductNotFound from "@/components/products/ProductNotFound";
import { useEffect } from "react";
import { toast } from "sonner";
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/configs/permissions";

let fetch = false;
export default function ProductsPage() {
  const { products, loading, refetch } = useProducts();
  const [ isEcommerce, setIsEcommerce ] = useState(true);
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);

  useEffect(() => {
    refetch({ isAdmin:true, isEcommerce})
  }, [fetch, isEcommerce])
  
  async function handleDelete(serialNumber) {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(serialNumber);
      refetch();
    }
  }

  async function handleToggleActive(serialNumber, isActive) {
    try {
      await updateProduct(serialNumber, { isActive });
      toast.success(isActive ? "Product is now visible" : "Product is now hidden");
      refetch({ isAdmin: true, isEcommerce });
    } catch (error) {
      toast.error("Failed to update product visibility");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory 
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your product catalog and stock here.
          </p>

          <div className="font-bold my-3 tracking-wider">
           <span>Total Products: {products.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={'outline'}
            onClick={() => refetch('')}
            className="p-2.5 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
            title="Reload products"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </Button>
          
          <Button
            onClick={() => navigate(`create`)}
            disabled={!canManage}
            title={!canManage ? "You do not have permission" : "Add Product"}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </Button>
        </div>

      </div>
       <div className="my-3">
          <label
            htmlFor="isEcommerce"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              name="isEcommerce"
              id="isEcommerce"
              value={isEcommerce}
              onChange={(e) => setIsEcommerce(e.target.value)}
              className="h-4 w-4 accent-slate-700"
            />
            <span>Ecommerce</span>
          </label>
        </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.serialNumber} className="transition-transform duration-200 hover:-translate-y-1">
              <ProductCard
                product={product}
                onDelete={() => handleDelete(product.serialNumber)}
                onToggleActive={handleToggleActive}
                canManage={canManage}
              />
            </div>
          ))}
        </div>
      ) : (
       <ProductNotFound />
      )}
    </div>
  );
}