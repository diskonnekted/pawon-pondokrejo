'use client'

import { useState } from 'react'
import { createServiceOrder } from '@/app/actions/service-order'
import { getOrCreateCustomer } from '@/app/actions/customer'
import { Calendar, MapPin, Loader2, CheckCircle2, User, Phone } from 'lucide-react'
import Link from 'next/link'

interface ServiceBookingFormProps {
  serviceId: string
  serviceName: string
  vendorPhone: string
}

export default function ServiceBookingForm({ serviceId, serviceName, vendorPhone }: ServiceBookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    serviceDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Anggap sistem punya login pembeli sementara, atau kita pakai ID acak jika belum punya sistem login pembeli penuh di frontend
    // Karena kita memakai sistem tanpa login penuh (berdasarkan nomor HP di dasbor lacak), kita pakai ID dummy atau biarkan kosong jika schema tidak strict (tapi schema minta required)
    // Sebenarnya di sistem lacak, kita buat customer reference. Jika tidak ada, buat dummy reference atau biarkan error terjadi jika backend strict.
    // Kita anggap kita buatkan ID dummy customer dulu, karena di sini tidak ada context login.
    const customerRes = await getOrCreateCustomer({
      name: formData.customerName,
      phone: formData.customerPhone,
      address: formData.deliveryAddress,
    })

    if (!customerRes.success || !customerRes.customerId) {
      setErrorMsg(customerRes.error || 'Gagal menyimpan profil pembeli.')
      setLoading(false)
      return
    }
    
    const res = await createServiceOrder({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deliveryAddress: formData.deliveryAddress,
      serviceDate: new Date(formData.serviceDate).toISOString(),
      serviceId,
      customerId: customerRes.customerId
    })

    if (res.success) {
      setSuccess(true)
      setOrderNumber(res.orderNumber || '')
    } else {
      setErrorMsg(res.error)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-white rounded-[3rem] p-10 text-center shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Pesanan Jasa Diterima!</h3>
        <p className="text-slate-500 mb-6 font-medium">Penjual akan segera mengkonfirmasi kesanggupannya. ID Pesanan Anda:</p>
        <div className="bg-slate-50 p-4 rounded-2xl font-mono text-xl font-black tracking-widest text-slate-800 mb-8">
          {orderNumber}
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/track" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl active:scale-95 transition-all block text-center">
            Lacak Pesanan Saya
          </Link>
          <a
            href={`https://wa.me/${vendorPhone}?text=Halo, saya baru saja memesan jasa ${serviceName} dengan ID ${orderNumber}. Mohon dikonfirmasi kesanggupannya.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-50 text-green-700 font-black py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" /> Hubungi Penjual via WA
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[3rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
      <h3 className="text-2xl font-black mb-8 text-slate-900">Pesan Jasa Ini</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Jadwal Kedatangan</label>
          <div className="relative">
            <Calendar className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
            <input
              required
              type="datetime-local"
              className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
              value={formData.serviceDate}
              onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nama Pemesan</label>
          <div className="relative">
            <User className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
            <input
              required
              type="text"
              placeholder="Nama lengkap Anda"
              className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nomor HP (WhatsApp)</label>
          <div className="relative">
            <Phone className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
            <input
              required
              type="tel"
              placeholder="0812..."
              className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
              value={formData.customerPhone}
              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Alamat Pelaksanaan Jasa</label>
          <div className="relative">
            <MapPin className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
            <textarea
              required
              rows={3}
              placeholder="Nama Jalan, RT/RW, pedukuhan..."
              className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900 resize-none text-sm leading-relaxed"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
            {errorMsg}
          </div>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-8 rounded-[2rem] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Konfirmasi Pesanan Jasa'}
        </button>
      </form>
    </div>
  )
}
