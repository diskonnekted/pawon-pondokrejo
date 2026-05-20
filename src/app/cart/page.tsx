'use client'

import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-sm inline-block">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Keranjang Belanja Kosong</h1>
          <p className="text-gray-500 mb-8">Wah, keranjangmu masih kosong nih. Yuk cari produk UMKM terbaik!</p>
          <Link href="/" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-colors">
            Mulai Belanja
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end gap-3 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Keranjang Saya</h1>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-black mb-2">
            {items.length} Barang
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div key={item._id} className="bg-white p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50 group-hover:scale-105 transition-transform">
                  {item.image && (
                    <Image
                      src={urlFor(item.image).width(300).height(300).url()}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <div className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">{item.vendorName}</div>
                  <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{item.name}</h3>
                  <div className="text-2xl font-black text-slate-900">Rp{item.price.toLocaleString('id-ID')}</div>
                </div>

                <div className="flex flex-row sm:flex-col items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-between sm:justify-center">
                  <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
                    <button 
                      onClick={() => updateQuantity(item._id, -1)}
                      className="p-3 hover:bg-white hover:text-green-600 rounded-xl transition-all shadow-sm group/btn"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 font-black text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, 1)}
                      className="p-3 hover:bg-white hover:text-green-600 rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all p-4 rounded-2xl group/del shadow-sm border border-red-100"
                  >
                    <Trash2 className="w-5 h-5 group-hover/del:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-300 sticky top-32 overflow-hidden">
              <h2 className="text-2xl font-black mb-8 tracking-tight">Ringkasan</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-xs">
                  <span>Total Barang</span>
                  <span className="text-white">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                  <span className="text-slate-400 font-bold">ESTIMASI TOTAL</span>
                  <span className="text-3xl font-black text-green-400 tracking-tighter">
                    Rp{totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-8 border border-white/10">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-1 leading-relaxed">
                  Metode Pembayaran
                </p>
                <div className="flex items-center gap-2 text-green-400">
                  <div className="bg-green-500/20 p-1.5 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path></svg>
                  </div>
                  <span className="font-black text-sm">CASH ON DELIVERY (COD)</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full bg-green-600 text-white text-center font-black py-5 rounded-2xl hover:bg-green-500 transition-all shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95">
                Checkout Pesanan
              </Link>
              
              <p className="text-center text-slate-500 text-[10px] mt-6 font-bold uppercase tracking-[0.2em]">
                Kurir Desa Pondokrejo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
