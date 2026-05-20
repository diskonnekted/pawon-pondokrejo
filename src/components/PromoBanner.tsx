'use client'

import { Banner } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PromoBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative group overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <Link 
            key={banner._id} 
            href={banner.link || '#'} 
            className="min-w-full relative aspect-[4/5] sm:aspect-[21/9] block"
          >
            {/* Desktop Image */}
            <div className="hidden sm:block absolute inset-0">
              <Image
                src={urlFor(banner.imageDesktop).width(1920).height(820).url()}
                alt={banner.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Mobile Image */}
            <div className="block sm:hidden absolute inset-0">
              <Image
                src={urlFor(banner.imageMobile).width(800).height(1000).url()}
                alt={banner.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-slate-900/40" />
            
            <div className="absolute bottom-8 left-8 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-16 text-white max-w-sm sm:max-w-xl">
              <h2 className="text-3xl sm:text-6xl font-black mb-4 leading-tight drop-shadow-lg">
                {banner.title}
              </h2>
              <div className="inline-block bg-green-600 text-white font-black px-8 py-3 rounded-xl shadow-xl hover:bg-green-700 transition-all active:scale-95">
                Lihat Detail &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 right-8 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === current ? 'w-8 bg-green-500' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
