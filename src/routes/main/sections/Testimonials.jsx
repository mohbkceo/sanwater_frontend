import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

const testimonials = [
  {
    name: "Mohammed BAKELLI",
    role: "CEO of logix",
    avatar: "https://res.cloudinary.com/dtl3mmdvo/image/upload/v1771149479/profileImage/mcv6anlmk37n7ev65c1n.jpg",
    rating: 5,
    feedback: "Service excellent, qualité et savoir-faire exceptionnels. Bravo !",
  },
  {
    name: "Omar Oubeka",
    role: "Marketing manager",
    avatar: "https://pagedone.io/asset/uploads/1696229994.png",
    rating: 5,
    feedback: "I used to dread doing my taxes every year, but this has made the process so much simpler.",
  },
];

export default function Testimonials() {
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-between gap-y-8 lg:gap-y-0 lg:gap-x-8 max-w-sm sm:max-w-2xl lg:max-w-full mx-auto">
          
          <div className="w-full lg:w-2/5">
            <span className="text-sm text-gray-200/80 font-medium mb-4 block">Témoignage</span>
            <h2 className="text-4xl mb-2 bg-linear-to-b from-zinc-950 to-zinc-800 bg-clip-text text-transparent font-bold  leading-tight">
             Les clients ont donné leur{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-violet-600">
                avis.
              </span>
            </h2>

            <div className="flex items-center justify-center lg:justify-start gap-5">
              <button
                ref={(node) => setPrevEl(node)}
                className="flex justify-center items-center border border-indigo-600 w-12 h-12 rounded-lg transition-all duration-500 text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                ref={(node) => setNextEl(node)}
                className="flex justify-center items-center border border-indigo-600 w-12 h-12 rounded-lg transition-all duration-500 text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={24} />
              </button>
              
            </div>
          </div>

          <div className="w-full lg:w-3/5">
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                prevEl,
                nextEl,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevEl;
                swiper.params.navigation.nextEl = nextEl;
              }}
              className="mySwiper"
            >
              {testimonials.map((testimonial, idx) => (
                <SwiperSlide key={idx}>
                 <div className="group relative bg-white/50 border border-gray-100 rounded-3xl p-8 transition-all duration-500 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]">
                    <div className="absolute top-6 right-8 text-indigo-100 group-hover:text-indigo-200 transition-colors duration-500">
                        <svg width="40" height="30" viewBox="0 0 40 30" fill="currentColor">
                        <path d="M12.3 0H0V12.3H7.4C7.4 16.4 4.1 19.7 0 19.7V29.6C8.1 29.6 14.8 22.9 14.8 14.8V2.5C14.8 1.1 13.7 0 12.3 0ZM37.5 0H25.2V12.3H32.6C32.6 16.4 29.3 19.7 25.2 19.7V29.6C33.3 29.6 40 22.9 40 14.8V2.5C40 1.1 38.9 0 37.5 0Z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative">
                        <img
                            className="rounded-full h-16 w-16 object-cover border-2 border-white shadow-md transition-transform duration-500 group-hover:scale-110"
                            src={testimonial.avatar}
                            alt={testimonial.name}
                        />
                       
                        </div>
                        <div className="flex flex-col">
                        <h5 className="text-gray-900 font-bold text-lg leading-tight tracking-tight">
                            {testimonial.name}
                        </h5>
                        <span className="text-sm font-medium text-indigo-600/80">
                            {testimonial.role}
                        </span>
                        </div>
                    </div>

                    <div className="flex items-center mb-4 gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                    </div>

                    <p className="text-gray-600 leading-relaxed italic text-base group-hover:text-gray-900 transition-colors duration-500">
                        "{testimonial.feedback}"
                    </p>
                    </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

const StarIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.10326 1.31699C8.47008 0.57374 9.52992 0.57374 9.89674 1.31699L11.7063 4.98347C11.8519 5.27862 12.1335 5.48319 12.4592 5.53051L16.5054 6.11846C17.3256 6.23765 17.6531 7.24562 17.0596 7.82416L14.1318 10.6781C13.8961 10.9079 13.7885 11.2389 13.8442 11.5632L14.5353 15.5931C14.6754 16.41 13.818 17.033 13.0844 16.6473L9.46534 14.7446C9.17402 14.5915 8.82598 14.5915 8.53466 14.7446L4.91562 16.6473C4.18199 17.033 3.32456 16.41 3.46467 15.5931L4.15585 11.5632C4.21148 11.2389 4.10393 10.9079 3.86825 10.6781L0.940384 7.82416C0.346867 7.24562 0.674378 6.23765 1.4946 6.11846L5.54081 5.53051C5.86652 5.48319 6.14808 5.27862 6.29374 4.98347L8.10326 1.31699Z"
      fill="currentColor"
    />
  </svg>
);