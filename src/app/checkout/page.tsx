'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/app/actions/order'
import { getOrCreateCustomer, getCustomerById } from '@/app/actions/customer'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, MessageCircle } from 'lucide-react'
import { OrderFormData } from '@/types'

export default function CheckoutPage() {
  const { items, totalPrice, shippingFee, grandTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string } | null>(null)

  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
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
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-sm inline-block max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h1>
          <p className="text-gray-600 mb-6">
            Terima kasih, <strong>{formData.name}</strong>. Pesanan Anda <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderInfo.orderNumber}</span> telah kami terima.
          </p>
          
          <div className="bg-green-50 p-6 rounded-2xl mb-8 text-left text-sm text-green-800">
            <p className="font-bold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Notifikasi Terkirim
            </p>
            <p className="mb-0 text-xs leading-relaxed">
              {formData.paymentMethod === 'qris' 
                ? 'Kami telah mengirimkan detail pesanan ke WhatsApp Anda. Admin Desa sedang memverifikasi pembayaran Anda.'
                : 'Kami telah mengirimkan detail pesanan ke WhatsApp Anda. Admin Desa akan segera memproses pesanan ini.'}
            </p>
          </div>

          <button 
            onClick={() => router.push('/')}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout Pesanan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Informasi Pengiriman</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input
                required
                type="text"
                className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Contoh: Pak Slamet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nomor WhatsApp</label>
              <input
                required
                type="tel"
                className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap (Pondokrejo)</label>
              <textarea
                required
                rows={3}
                className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Contoh: Dusun Glagahmalang RT 01 RW 02"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t">
              <label className="block text-sm font-bold text-gray-700 mb-3">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${formData.paymentMethod === 'cod' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'}`}
                >
                  <span className="font-bold">Bayar di Tempat</span>
                  <span className="text-xs opacity-70">Tunai ke Kurir (COD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'qris' })}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${formData.paymentMethod === 'qris' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'}`}
                >
                  <span className="font-bold">Bayar Pakai QRIS</span>
                  <span className="text-xs opacity-70">Aman & Terpantau</span>
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : formData.paymentMethod === 'qris' ? 'Buat Pesanan & Saya Sudah Bayar' : 'Buat Pesanan Sekarang (COD)'}
            </button>
          </form>
        </div>

        {/* Order Review */}
        <div>
          <h2 className="text-xl font-bold mb-6">Tinjau Pesanan</h2>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-800">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-bold text-gray-900">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold">Subtotal Produk</span>
                <span className="font-bold text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold">Ongkos Kirim</span>
                <span className="font-bold text-gray-900">Rp {shippingFee.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total Pembayaran</span>
              <span className="text-2xl font-black text-green-700">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="bg-yellow-50 p-4 rounded-2xl text-xs text-yellow-800 flex items-start gap-2">
              <span className="font-bold text-lg leading-none">!</span>
              <p>
                {formData.paymentMethod === 'qris'
                  ? 'Silakan selesaikan pembayaran dengan scan QRIS dan klik "Buat Pesanan" untuk mengirim bukti bayar ke Admin Desa.'
                  : 'Anda akan membayar pesanan ini secara tunai (COD) saat barang diantar oleh kurir ke alamat Anda.'}
              </p>
            </div>
            {formData.paymentMethod === 'qris' && (
              <div className="border-t pt-6 mt-4 text-center">
                <h3 className="font-bold text-gray-800 mb-4">Scan QRIS Berikut:</h3>
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/qris.webp" alt="QRIS Desa Pondokrejo" className="w-48 h-48 object-contain mx-auto" />
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  a.n. <strong>Desa Pondokrejo</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

