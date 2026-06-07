import React, { useState, useEffect } from 'react';
import { productAPI } from '@/services/baseAPIs';
import { Link } from 'react-router-dom';

function DynamicProductSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.get('/');
        setProducts(response.data.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="py-20 text-center text-slate-500">Loading products...</div>;
  if (products.length === 0) return null;

  return (
    <section id="products" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Our Featured Products</h2>
            <p className="text-slate-600 text-lg">Discover our latest innovations in water solutions, designed for sustainability and performance.</p>
          </div>
          <Link to="/products" className="text-turquoise-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View All Products <span>→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.slice(0, 6).map((product) => (
            <div key={product._id} className="group bg-white/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-white/50 flex flex-col">
              <div className="h-72 relative overflow-hidden">
                {product.gallery && product.gallery.length > 0 ? (
                  <img 
                    src={product.gallery[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">No Image</div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                  {product.family}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-turquoise-600 transition-colors">{product.name}</h3>
                  <span className="text-turquoise-600 font-black text-lg">${product.prices?.productPrice}</span>
                </div>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">Serial: {product.serialNumber}</p>
                <Link 
                  to={`/products/view/${product.serialNumber}`}
                  className="mt-auto w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-center border border-slate-100 hover:bg-turquoise-600 hover:text-white hover:border-turquoise-600 transition-all shadow-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DynamicProductSection;
