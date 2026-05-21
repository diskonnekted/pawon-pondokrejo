'use client'

import { useState, useEffect } from 'react'
import { updateCourierStatus, getCourierOrders } from '@/app/actions/courier-portal'
import { updateOrderStatus } from '@/app/actions/order'
import { LogOut, Power, MessageSquare, CheckCircle2, Loader2, MapPin, Phone, Package, Clock, ExternalLink } from 'lucide-react'

interface Props {
  initialData: any
  onLogout: () => void
}

export default function CourierDashboard({ initialData, onLogout }: Props) {
  const [isActive, setIsActive] = useState(initialData.isActive)
  const [statusMessage, setStatusMessage] = useState(initialData.statusMessage || '')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const res = await getCourierOrders(initialData._id)
    if (res.success) setOrders(res.data)
    setLoading(false)
  }

  const handleStatusUpdate = async () => {
    setUpdating(true)
    const res = await updateCourierStatus(initialData._id, { isActive, statusMessage })
    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setUpdating(false)
  }

  const quickUpdateOrder = async (orderNumber: string, status: string, label: string) => {
    if (!confirm(`Konfirmasi: ${label}?`)) return
    const res = await updateOrderStatus(orderNumber, status, `Update oleh Kurir via Portal`)
    if (res.success) fetchOrders()
    else alert('Gagal memperbarui pesanan.')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{initialData.name}</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Kurir Logistik</p>
          </div>
          <button onClick={onLogout} className="p-3 bg-white text-slate-400 hover:text-red-600 rounded-2xl shadow-sm transition-colors border border-slate-100">
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* Kurir Status Section */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                <Power className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <h3 className="font-black text-slate-800">Status Saya</h3>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-green-600' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {!isActive && (
            <input
              type="text"
              placeholder="Contoh: Sedang istirahat makan"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-slate-900 mb-4 text-sm"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
            />
          )}

          <button
            disabled={updating}
            onClick={handleStatusUpdate}
            className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${success ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'}`}
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : success ? 'Tersimpan!' : 'Simpan Status'}
          </button>
        </div>

        {/* Task List Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-black text-slate-800">Tugas Aktif</h3>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">{orders.length}</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-16 text-center px-6">
              <p className="text-slate-400 font-bold text-sm">Belum ada tugas pengantaran.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{order.orderNumber}</p>
                      <h4 className="font-black text-slate-800 text-lg leading-tight">{order.customerName}</h4>
                    </div>
                    <div className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100">
                      {order.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3 text-sm text-slate-500 font-medium leading-relaxed">
                      <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                      <p>{order.deliveryAddress}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                      <Phone className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <a href={`https://wa.me/${order.customerPhone}`} className="text-blue-600 hover:underline">{order.customerPhone}</a>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                      <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span>Tagihan: <span className="text-slate-900">Rp{order.totalAmount.toLocaleString('id-ID')}</span> (COD)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                    {order.status === 'accepted' && (
                      <button 
                        onClick={() => quickUpdateOrder(order.orderNumber, 'shipped', 'Ambil barang dari Seller')}
                        className="col-span-2 py-4 bg-orange-50 text-orange-700 font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all"
                      >
                        📦 Barang Diambil
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button 
                        onClick={() => quickUpdateOrder(order.orderNumber, 'delivering', 'Mulai pengiriman ke warga')}
                        className="col-span-2 py-4 bg-purple-50 text-purple-700 font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all"
                      >
                        🚚 Mulai Kirim
                      </button>
                    )}
                    {order.status === 'delivering' && (
                      <>
                        <button 
                          onClick={() => quickUpdateOrder(order.orderNumber, 'completed', 'Pesanan diterima warga & uang COD diterima')}
                          className="py-4 bg-green-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          ✅ Selesai
                        </button>
                        <button 
                          onClick={() => quickUpdateOrder(order.orderNumber, 'problem', 'Lapor masalah di lapangan')}
                          className="py-4 bg-rose-50 text-rose-600 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                        >
                          ⚠️ Masalah
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
