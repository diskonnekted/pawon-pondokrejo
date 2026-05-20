'use client'

import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { ShoppingCart, BadgeCheck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const originalPrice = product.isPromo && product.promoDiscount 
    ? Math.round(product.price / (1 - product.promoDiscount / 100))
    : null;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 group border border-slate-100 flex flex-col h-full relative">
      {/* Promo Badge */}
      {product.isPromo && product.promoDiscount && (
        <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
          {product.promoDiscount}% OFF
        </div>
      )}

      {/* Best Seller Badge */}
      {product.isBestSeller && (
        <div className="absolute top-4 right-4 z-20 bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
          <span className="text-xs">🔥</span> TERLARIS
        </div>
      )}

      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
        {product.image && (
          <Image
            src={urlFor(product.image).width(600).height(750).url()}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
      
      <div className="p-3 sm:p-6 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-1 sm:gap-2 items-center mb-1.5 sm:mb-3">
          <div className="flex items-center gap-1 text-[7px] sm:text-[10px] text-green-700 font-black uppercase tracking-wider bg-green-50 px-1.5 py-0.5 rounded-md line-clamp-1">
            {product.vendor.isVerified && <BadgeCheck className="w-2.5 h-3.5 text-blue-500" />}
            {product.vendor.name}
          </div>
          {product.categories && product.categories.length > 0 && (
            <span className="text-[7px] sm:text-[10px] px-1.5 py-0.5 rounded-md text-slate-400 font-bold border border-slate-100">
              {product.categories[0].name}
            </span>
          )}
        </div>
        
        <Link href={`/product/${product.slug}`} className="flex-grow block mt-0.5">
          <h3 className="text-[11px] sm:text-lg font-bold text-slate-800 mb-1 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[7px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harga</span>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-xs sm:text-xl font-black text-slate-900">
                Rp{product.price.toLocaleString('id-ID')}
              </span>
              {originalPrice && (
                <span className="text-[8px] sm:text-xs text-slate-400 line-through font-bold">
                  Rp{originalPrice.toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => addItem(product)}
            className="bg-green-600 hover:bg-green-700 text-white p-2 sm:p-4 rounded-lg sm:rounded-2xl transition-all active:scale-90 shadow-lg shadow-green-600/30 group/btn"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
