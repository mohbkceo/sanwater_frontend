import useProducts from "@/services/products/useProducts";
import ProductCard from "../../components/products/ProductCard";
import { deleteProduct } from "@/services/products/productServices";
import { Plus, Package, RefreshCw } from "lucide-react"; // Optional icon library
import { Button } from "@/components";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
  const { products, loading, refetch } = useProducts();
  const navigate = useNavigate();

  async function handleDelete(serialNumber) {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(serialNumber);
      refetch();
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
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={'outline'}
            onClick={() => refetch()}
            className="p-2.5 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
            title="Reload products"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </Button>
          
          <Button onClick={() => navigate(`create`)} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors shadow-sm">
            <Plus size={18} />
            <span>Add Product</span>
          </Button>
        </div>
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
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-300 rounded-2xl">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Package size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
          <p className="text-slate-500 max-w-xs text-center mt-2">
            Your inventory is currently empty. Start by adding your first product.
          </p>
        </div>
      )}
    </div>
  );
}