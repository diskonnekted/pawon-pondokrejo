'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/app/actions/order'
import { getOrCreateCustomer, getCustomerById } from '@/app/actions/customer'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, ChevronLeft, User, Info, ShoppingBag, MessageCircle } from 'lucide-react'
import { OrderFormData } from '@/types'
import Link from 'next/link'

export default function MobileCheckoutPage() {
  const { items, totalPrice, shippingFee, grandTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string } | null>(null)

  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    phone: '',
    address: '',
  })

  // Load existing profile
  useEffect(() => {
    const savedId = localStorage.getItem('pawon-customerId')
    if (savedId) {
      getCustomerById(savedId).then((res) => {
        if (res.success && res.data) {
          setFormData({
            name: res.data.name,
            phone: res.data.phone,
            address: res.data.address
          })
        }
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Get or Create Customer Document
    const customerRes = await getOrCreateCustomer(formData)
    if (!customerRes.success || !customerRes.customerId) {
      alert(customerRes.error)
      setLoading(false)
      return
    }

    // 2. Save ID to LocalStorage
    localStorage.setItem('pawon-customerId', customerRes.customerId)

    // 3. Create Order linked to Customer
    const result = await createOrder(formData, items, grandTotal, shippingFee, customerRes.customerId)

    if (result.success && result.orderNumber) {
      setOrderInfo({ 
        orderNumber: result.orderNumber
      })
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
        
        <div className="bg-green-50 p-6 rounded-[2.5rem] mb-10 text-left w-full max-w-sm border border-green-100">
          <h4 className="text-sm font-black uppercase tracking-widest text-green-700 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            NOTIFIKASI TERKIRIM
          </h4>
          <p className="text-xs font-bold text-green-800 leading-relaxed">
            Kami telah mengirimkan detail pesanan ke WhatsApp Anda. Admin Kalurahan akan segera memproses pesanan ini.
          </p>
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
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Subtotal Produk</span>
                  <span>Rp{totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Ongkos Kirim</span>
                  <span>Rp{shippingFee.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="font-black text-slate-900">Total Bayar</span>
                <span className="text-xl font-black text-green-700">Rp{grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-6 z-50 pb-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <button
          form="checkout-form"
          disabled={loading}
          type="submit"
          className="w-full bg-green-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-green-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-6 h-6" />
              <span>Konfirmasi Pesanan (COD)</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
