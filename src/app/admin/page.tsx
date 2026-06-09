'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchAllOrders } from '@/app/actions/admin'
import { Loader2, RefreshCw, LogOut, Package, User, MapPin, CreditCard, ChevronRight, CheckCircle, Clock, Truck, AlertTriangle, Printer } from 'lucide-react'

// Define Order type locally based on our query
type Order = {
  _id: string
  orderNumber: string
  _createdAt: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  totalAmount: number
  shippingFee: number
  paymentMethod: 'cod' | 'qris'
  paymentStatus: 'unpaid' | 'paid'
  status: 'pending' | 'accepted' | 'processing' | 'shipped' | 'delivering' | 'completed' | 'cancelled' | 'problem'
  items: { quantity: number; price: number; product: { name: string; vendorName: string } }[]
  courier?: { name: string; phone: string }
}

const PIN = '12341'

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [errorPin, setErrorPin] = useState('')
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Check auth state on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('pawon_admin_auth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
      
      // Auto-refresh setiap 30 detik karena notifikasi utamanya via WhatsApp
      const interval = setInterval(() => {
        loadOrders(true)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadOrders = async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    else setRefreshing(true)

    const res = await fetchAllOrders()
    if (res.success && res.data) {
      setOrders(res.data)
    }
    
    setLoading(false)
    setRefreshing(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === PIN) {
      sessionStorage.setItem('pawon_admin_auth', 'true')
      setIsAuthenticated(true)
      setErrorPin('')
    } else {
      setErrorPin('PIN salah!')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('pawon_admin_auth')
    setIsAuthenticated(false)
    setPinInput('')
    setOrders([])
  }

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-[3rem] shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Dasbor Admin</h1>
          <p className="text-slate-500 font-bold mb-4">Masukkan PIN untuk masuk</p>
          <Link href="/manual/admin" className="inline-block text-xs font-black text-slate-600 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors mb-8">
            📖 Baca Buku Panduan Admin
          </Link>
          
          <input
            type="password"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="****"
            className="w-full text-center text-3xl tracking-[0.5em] font-black p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all mb-4"
          />
          
          {errorPin && <p className="text-red-500 text-sm font-bold mb-4">{errorPin}</p>}
          
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-slate-200">
            Masuk
          </button>
        </form>
      </div>
    )
  }

  if (loading && !orders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    )
  }

  const getStatusColor = (status: Order['status'], paymentMethod: string, paymentStatus: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-200'
    if (status === 'cancelled' || status === 'problem') return 'bg-red-100 text-red-700 border-red-200'
    
    // Unpaid QRIS is critical pending
    if (paymentMethod === 'qris' && paymentStatus === 'unpaid') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    
    if (status === 'pending') return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    if (status === 'delivering') return 'bg-blue-100 text-blue-700 border-blue-200'
    
    // accepted, processing, shipped are in "Penjual/Siap" stage
    return 'bg-orange-100 text-orange-700 border-orange-200'
  }

  const getStatusText = (status: Order['status'], paymentMethod: string, paymentStatus: string) => {
    if (status === 'completed') return 'Pesanan Selesai'
    if (status === 'cancelled') return 'Dibatalkan'
    if (status === 'problem') return 'Bermasalah'
    if (paymentMethod === 'qris' && paymentStatus === 'unpaid') return 'Menunggu Mutasi QRIS'
    if (status === 'pending') return 'Menunggu Admin (COD)'
    if (status === 'delivering') return 'Sedang Diantar Kurir'
    return 'Diproses Penjual'
  }

  const getStatusIcon = (status: Order['status']) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5" />
    if (status === 'cancelled' || status === 'problem') return <AlertTriangle className="w-5 h-5" />
    if (status === 'delivering') return <Truck className="w-5 h-5" />
    if (status === 'pending') return <Clock className="w-5 h-5" />
    return <Package className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 leading-none">Dasbor Admin</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pondokrejo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all"
              title="Cetak Laporan / PDF"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button 
              onClick={() => loadOrders(false)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8 print:hidden">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-3xl font-black text-slate-900">{orders.length}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Menunggu</p>
            <p className="text-3xl font-black text-yellow-600">
              {orders.filter(o => o.status === 'pending' || (o.paymentMethod === 'qris' && o.paymentStatus === 'unpaid')).length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Diantar</p>
            <p className="text-3xl font-black text-blue-600">
              {orders.filter(o => o.status === 'delivering').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">Selesai</p>
            <p className="text-3xl font-black text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          Daftar Pesanan Terkini
          {refreshing && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full animate-pulse">Menyinkronkan...</span>}
        </h2>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              
              {/* Order Info (Left) */}
              <div className="flex-grow space-y-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-black tracking-widest">
                    {order.orderNumber}
                  </span>
                  <span className="text-slate-400 text-xs font-bold">
                    {new Date(order._createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><User className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{order.customerName}</p>
                      <p className="text-xs font-bold text-slate-500">{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><MapPin className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-2">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Daftar Barang ({order.items?.length || 0})</p>
                  <div className="space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-700">{item.product?.name || 'Produk'} <span className="text-slate-400 mx-1">x{item.quantity}</span></span>
                        <span className="font-bold text-slate-900">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500">Total Bayar (+Ongkir)</span>
                    <span className="text-lg font-black text-slate-900">Rp{order.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Status Flow (Right) */}
              <div className="md:w-64 flex-shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status Saat Ini</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border ${getStatusColor(order.status, order.paymentMethod, order.paymentStatus)}`}>
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-black">{getStatusText(order.status, order.paymentMethod, order.paymentStatus)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-600">
                      {order.paymentMethod === 'qris' ? 'QRIS Transfer' : 'Bayar Tunai (COD)'}
                    </span>
                  </div>
                  {order.courier && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-800 p-2 rounded-xl">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs">{order.courier.name}</span>
                    </div>
                  )}
                </div>

                <a 
                  href={`/studio/intent/edit/id=${order._id};type=order`} 
                  target="_blank"
                  className="mt-auto w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm"
                >
                  Buka di Sanity <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}

          {orders.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
              <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-800">Belum Ada Pesanan</h3>
              <p className="text-slate-500 font-bold mt-2">Pesanan yang masuk akan muncul di sini.</p>
            </div>
          )}
        </div>
      </main>

      {/* Print Table (Hidden in UI, Shown in Print) */}
      <div className="hidden print:block p-8 bg-white font-sans text-slate-900">
        <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-black uppercase tracking-widest">Rekapitulasi Pesanan</h1>
          <p className="text-slate-500 font-bold mt-2">PAWON Pondokrejo - Dicetak pada {new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-slate-800 text-sm">
              <th className="py-4 px-3 font-black uppercase tracking-wider bg-slate-50">No.</th>
              <th className="py-4 px-3 font-black uppercase tracking-wider bg-slate-50">Waktu</th>
              <th className="py-4 px-3 font-black uppercase tracking-wider bg-slate-50">Pelanggan</th>
              <th className="py-4 px-3 font-black uppercase tracking-wider bg-slate-50">Item</th>
              <th className="py-4 px-3 font-black uppercase tracking-wider bg-slate-50">Status</th>
              <th className="py-4 px-3 font-black uppercase tracking-wider bg-slate-50 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm align-top">
            {orders.map((order, idx) => (
              <tr key={order._id} className="border-b border-slate-200">
                <td className="py-4 px-3 font-black">{order.orderNumber}</td>
                <td className="py-4 px-3">{new Date(order._createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="py-4 px-3">
                  <div className="font-bold">{order.customerName}</div>
                  <div className="text-xs mt-1">{order.customerPhone}</div>
                </td>
                <td className="py-4 px-3">
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    {(order.items || []).map((item, i) => (
                      <li key={i}>{item.product?.name} <span className="font-bold">(x{item.quantity})</span></li>
                    ))}
                  </ul>
                </td>
                <td className="py-4 px-3 font-bold">{getStatusText(order.status, order.paymentMethod, order.paymentStatus)}</td>
                <td className="py-4 px-3 text-right font-black">Rp{order.totalAmount.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-[3px] border-slate-900 bg-slate-50">
              <td colSpan={5} className="py-5 px-3 text-right font-black uppercase tracking-widest">Total Nilai Transaksi Keseluruhan</td>
              <td className="py-5 px-3 text-right font-black text-xl">Rp{orders.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-10">
          - Dokumen ini digenerate secara otomatis oleh sistem PAWON Pondokrejo -
        </div>
      </div>
    </div>
  )
}
