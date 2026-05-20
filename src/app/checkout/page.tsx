'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'
import { OrderFormData } from '@/types'

export default function CheckoutPage() {
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
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-sm inline-block max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h1>
          <p className="text-gray-600 mb-6">
            Terima kasih, <strong>{formData.name}</strong>. Pesanan Anda <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderInfo.orderNumber}</span> telah kami terima.
          </p>
          <div className="bg-green-50 p-4 rounded-2xl mb-8 text-left text-sm text-green-800">
            <p className="font-bold mb-1">Selanjutnya apa?</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Penjual akan mengonfirmasi pesanan Anda.</li>
              <li>Kurir Desa akan menghubungi via WhatsApp untuk pengantaran.</li>
              <li>Siapkan uang tunai sesuai total belanja untuk pembayaran COD.</li>
            </ul>
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

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Buat Pesanan Sekarang (COD)'}
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
            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total Pembayaran</span>
              <span className="text-2xl font-black text-green-700">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="bg-yellow-50 p-4 rounded-2xl text-xs text-yellow-800 flex items-start gap-2">
              <span className="font-bold text-lg leading-none">!</span>
              <p>Anda akan membayar pesanan ini secara tunai (COD) saat barang diantar oleh kurir ke alamat Anda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
