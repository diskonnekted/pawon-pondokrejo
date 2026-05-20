'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Product } from '@/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <button 
      onClick={() => addItem(product)}
      className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-8 rounded-3xl transition-all active:scale-95 shadow-xl shadow-green-600/30 w-full group"
    >
      <ShoppingCart className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
      <span>Tambah ke Keranjang</span>
    </button>
  )
}
