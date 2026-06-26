import {
  Trash2,
  Tag,
  Database,
  ShoppingCart,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "..";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onDelete, onToggleActive }) {
  const navigate = useNavigate();
  const imageUrl = product.gallery?.[0] || "/api/placeholder/400/320";

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleActive?.(product.serialNumber, !product.isActive);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-sm hover:shadow-slate-200/50 hover:border-slate-300">
      <div
        onClick={() => navigate(`edit?serialNumber=${product.serialNumber}`)}
        className="relative cursor-pointer select-none w-full overflow-hidden bg-slate-100"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-110"
        />

        {product.family && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm border border-slate-100">
            {product.family}
          </div>
        )}

        <div
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
            product.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {product.isActive ? "Visible" : "Hidden"}
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h2 className="font-bold text-slate-800 text-lg leading-tight truncate pr-2">
            {product.name || "Unnamed Product"}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 mb-4">
          <Tag size={14} />
          <span className="text-xs font-medium uppercase tracking-tight">
            SN: {product.productId || "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 mb-4">
          <Database size={14} />
          <span className="text-xs font-medium uppercase tracking-tight">
            On Database: {product.serialNumber || "N/A"}
          </span>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex gap-2">
            <Button
              onClick={handleToggle}
              title={product.isActive ? "Hide Product" : "Unhide Product"}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                product.isActive
                  ? "text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white"
                  : "text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white"
              }`}
            >
              {product.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.serialNumber);
              }}
              title="Delete Product"
              className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors duration-200"
            >
              <Trash2 size={18} />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(
                  `https://sanwater-dz.com/products/landing_product/${product?.serialNumber}`
                );
              }}
              title="Copy Product Link"
              className="p-2 text-green-500 bg-green-50 hover:bg-green-500 hover:text-white rounded-lg transition-colors duration-200"
            >
              <ShoppingCart size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}