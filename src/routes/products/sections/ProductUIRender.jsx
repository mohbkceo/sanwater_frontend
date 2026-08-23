import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/thumbs";
import { CtaButton } from "@/components";
import { CONTACTSALES } from "@/configs/routes/routesConfig";
import { ChevronLeft } from "lucide-react";
import { ChevronRight, FileText } from "lucide-react";
import RequestQuoteModal from "@/components/products/RequestQuoteModal";


function ProductUIRender({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const buttons = {
    ctaButtonText: 'Contactez ventes pour ce produit'
  }

  const images = product?.gallery?.length
    ? product.gallery
    : ["https://via.placeholder.com/500"];


  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        
        <div>
          <Swiper
            modules={[Thumbs]}
            thumbs={{ swiper: thumbsSwiper }}
            className="mb-4 shadow-sm rounded-2xl"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt="product"
                  className="w-full border-2 border-blue-300/20  rounded-2xl object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            className="w-18"
            slidesPerView={Math.min(images.length, 5)}
          >
            {images.map((img, i) => (
              <SwiperSlide className="w-5" key={i}>
                <img
                  src={img}
                  alt="thumb"
                  className="cursor-pointer w-full rounded-xl border-2 border-blue-200/40 hover:border-blue-500 transition"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        
        <div className="flex bg-gray-300/80 rounded-3xl p-4 items-center">
          <div className="w-full  space-y-6">
            
            <div className="flex justify-between gap-5 items-start">
              <div>
                <h1 className="text-5xl font-bold font-mainFont  text-[#1F2933]">
                  {product?.name}
                </h1>
                <p className="text-[#1D4ED8] font-mono text-sm mt-1">
                  {product?.family}
                </p>
              </div>
            </div>

            
          
            
            <div className="flex flex-wrap mt-12 gap-2">
              {product?.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm text-gray-900 font-mainFont bg-blue-500/10 ] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            
            
            
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <CtaButton className={`w-full`} label={buttons.ctaButtonText} icon={<ChevronRight size={18} />} href={CONTACTSALES}/>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1D4ED8] bg-white px-5 py-3 text-sm font-semibold text-[#1D4ED8] hover:bg-[#1D4ED8]/5 transition"
              >
                <FileText size={18} />
                Demander un devis
              </button>
            </div>

            {quoteModalOpen && (
              <RequestQuoteModal product={product} onClose={() => setQuoteModalOpen(false)} />
            )}


            <div className="text-sm font-mono text-[#1D4ED8] space-y-1">
              <p><strong>Product ID:</strong> {product?.productId}</p>
              <p><strong>Serial:</strong> {product?.serialNumber}</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default ProductUIRender;