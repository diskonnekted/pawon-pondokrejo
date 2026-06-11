'use client'

import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft } from 'lucide-react'

export default function MobileCartPage() {
  const { items, totalPrice, shippingFee, grandTotal, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="bg-slate-100 p-8 rounded-[3rem] mb-6">
          <ShoppingBag className="w-16 h-16 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Keranjang Kosong</h2>
        <p className="text-slate-500 mb-8">Wah, belum ada produk yang kamu pilih nih.</p>
        <Link href="/products" className="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-600/20 active:scale-95 transition-all">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Keranjang Belanja</h1>
      </header>

      <main className="p-4 space-y-4 pb-40">
        {items.map((item) => (
          <div key={item._id} className="flex gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
              {item.image && (
                <Image
                  src={urlFor(item.image).width(200).height(200).url()}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-grow flex flex-col justify-between py-1">
              <div>
                <h3 className="font-black text-slate-900 line-clamp-1">{item.name}</h3>
                <p className="text-green-700 font-bold text-sm">Rp{item.price.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item._id, -1)}
                    className="p-1 text-slate-500 hover:text-green-600 active:scale-90 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, 1)}
                    className="p-1 text-slate-500 hover:text-green-600 active:scale-90 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item._id)}
                  className="p-2 text-slate-400 hover:text-red-500 active:scale-90 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-slate-100 p-6 z-40">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Subtotal Barang</span>
            <span>Rp{totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Ongkos Kirim</span>
            <span>Rp{shippingFee.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-500 font-bold">Total Pembayaran</span>
          <span className="text-2xl font-black text-slate-900">Rp{grandTotal.toLocaleString('id-ID')}</span>
        </div>
        <Link href="/checkout" className="block w-full bg-green-600 text-white text-center font-black py-5 rounded-2xl shadow-xl shadow-green-600/20 active:scale-95 transition-all">
          Lanjut ke Pembayaran
        </Link>
      </div>
    </div>
  )
}
