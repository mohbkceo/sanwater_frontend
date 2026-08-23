import React, { useState, useEffect } from 'react';
import { productAPI } from '@/services/baseAPIs';
import { Link } from 'react-router-dom';
import { useTranslation } from "@/lib/i18n.jsx";
import { motion, useReducedMotion } from 'framer-motion';
import { SPRING_DEFAULT, REDUCED_MOTION_TRANSITION } from '@/lib/springs';
import { formatPrice } from '@/lib/utils';
import { PRODUCTS, PRODUCTVIEWDETAIL } from '@/configs/routes/routesConfig';

function DynamicProductSection() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const spring = prefersReducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_DEFAULT;

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

  if (loading) return <div className="py-20 text-center text-slate-500">{t("products.loading_products")}</div>;
  if (products.length === 0) return null;

  return (
    <section id="products" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col relative z-50 md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-display text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t("products.title")}</h2>
            <p className="text-slate-600 text-lg">{t("products.description")}</p>
          </div>
          <Link to={PRODUCTS} className="text-turquoise-600 font-bold flex items-center cursor-pointer gap-2 hover:gap-3 transition-all">
            {t("products.view_details")} <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.slice(0, 6).map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...spring, delay: prefersReducedMotion ? 0 : (i % 3) * 0.06 }}
              whileHover={{ y: -4 }}
              className="group bg-white/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 border border-white/50 flex flex-col"
            >
              <div className="h-72 relative overflow-hidden">
                {product.gallery && product.gallery.length > 0 ? (
                  <img
                    src={product.gallery[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">{t("products.no_image")}</div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                  {product.family}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-turquoise-600 transition-colors">{product.name}</h3>
                </div>
                {product.prices?.productPrice > 0 && (
                  <p className="text-lg font-bold text-[#0050A4] mb-4">{formatPrice(product.prices.productPrice)} DA</p>
                )}
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{t("products.serial")} {product.serialNumber}</p>
                <motion.div whileTap={{ scale: 0.97 }} transition={spring} className="mt-auto">
                  <Link
                    to={PRODUCTVIEWDETAIL.replace(":serialNumber", product.slug || product.serialNumber)}
                    className="block w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-center border border-slate-100 hover:bg-turquoise-600 hover:text-white hover:border-turquoise-600 transition-colors shadow-sm"
                  >
                    {t("products.view_details")}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DynamicProductSection;
