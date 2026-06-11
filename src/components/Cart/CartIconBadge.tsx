'use client'

import { useCart } from '@/context/CartContext'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function CartIconBadge() {
  const { totalItems } = useCart()

  return (
    <Link href="/cart" className="relative p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto active:scale-90 transition-all">
      <ShoppingCart className="w-6 h-6 text-slate-900" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
