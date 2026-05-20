'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, ChevronLeft, MapPin, Phone, User, Info } from 'lucide-react'
import { OrderFormData } from '@/types'
import Link from 'next/link'

export default function MobileCheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string } | null>(null)

  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    phone: '',
    address: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await createOrder(formData, items, totalPrice)

    if (result.success && result.orderNumber) {
      setOrderInfo({ orderNumber: result.orderNumber })
      setSuccess(true)
      clearCart()
    } else {
      alert(result.error || 'Terjadi kesalahan.')
    }
    setLoading(false)
  }

  if (items.length === 0 && !success) {
    router.push('/cart')
    return null
  }

  if (success && orderInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
        <div className="bg-green-100 p-8 rounded-[3rem] mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Berhasil!</h1>
        <p className="text-slate-500 mb-8 px-4">
          Pesanan <span className="font-black text-slate-900">{orderInfo.orderNumber}</span> telah diterima.
        </p>
        
        <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-10 text-left w-full max-w-sm">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-green-600" />
            Langkah Selanjutnya
          </h4>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm font-medium text-slate-600">
              <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
              Penjual mengonfirmasi produk.
            </li>
            <li className="flex gap-3 text-sm font-medium text-slate-600">
              <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
              Kurir Desa hubungi via WhatsApp.
            </li>
            <li className="flex gap-3 text-sm font-medium text-slate-600">
              <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
              Bayar COD saat barang tiba.
            </li>
          </ul>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="w-full max-w-sm bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/cart" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Checkout</h1>
      </header>

      <main className="p-6 pb-40">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              Data Pengiriman
            </h2>
            <div className="space-y-5">
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="Nama Lengkap"
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <input
                  required
                  type="tel"
                  placeholder="Nomor WhatsApp (Aktif)"
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="relative">
                <textarea
                  required
                  rows={3}
                  placeholder="Alamat Lengkap di Pondokrejo"
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-green-600" />
              Ringkasan Pesanan
            </h2>
            <div className="bg-slate-50 rounded-[2.5rem] p-6 space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-600">{item.name} <span className="text-slate-400 ml-1">x{item.quantity}</span></span>
                  <span className="text-slate-900">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="font-black text-slate-900">Total</span>
                <span className="text-xl font-black text-green-700">Rp{totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 z-40 pb-8">
        <button
          form="checkout-form"
          disabled={loading}
          type="submit"
          className="w-full bg-green-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <span>Pesan Sekarang (COD)</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

import { ShoppingBag } from 'lucide-react'
