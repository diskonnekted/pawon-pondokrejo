'use client'

import { useState, useEffect } from 'react'
import TrackOrderForm from '@/components/TrackOrderForm'
import { Package, User, LogOut, Loader2, KeyRound, CheckCircle, AlertTriangle, Truck, Clock, CreditCard, Edit3 } from 'lucide-react'
import { loginBuyer, getBuyerOrders, changeBuyerPin } from '@/app/actions/buyer'
import Link from 'next/link'

export default function TrackLandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [buyerInfo, setBuyerInfo] = useState<{name: string, phone: string} | null>(null)
  
  const [phoneInput, setPhoneInput] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)

  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  const [isChangingPin, setIsChangingPin] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [loadingPin, setLoadingPin] = useState(false)

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('pawon_buyer_auth')
    const savedName = sessionStorage.getItem('pawon_buyer_name')
    if (savedAuth) {
      setIsAuthenticated(true)
      setBuyerInfo({ phone: savedAuth, name: savedName || 'Warga' })
      loadOrders(savedAuth)
    }
  }, [])

  const loadOrders = async (phone: string) => {
    setLoadingOrders(true)
    const res = await getBuyerOrders(phone)
    if (res.success && res.data) {
      setOrders(res.data)
    }
    setLoadingOrders(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneInput || !pinInput) return
    
    setLoadingLogin(true)
    setErrorLogin('')
    
    const res = await loginBuyer(phoneInput, pinInput)
    if (res.success && res.data) {
      sessionStorage.setItem('pawon_buyer_auth', res.data.phone)
      sessionStorage.setItem('pawon_buyer_name', res.data.name)
      setIsAuthenticated(true)
      setBuyerInfo({ phone: res.data.phone, name: res.data.name })
      loadOrders(res.data.phone)
    } else {
      setErrorLogin(res.error || 'Login gagal.')
    }
    setLoadingLogin(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('pawon_buyer_auth')
    sessionStorage.removeItem('pawon_buyer_name')
    setIsAuthenticated(false)
    setBuyerInfo(null)
    setOrders([])
    setPhoneInput('')
    setPinInput('')
    setIsChangingPin(false)
  }

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPin || !newPin) return
    if (!buyerInfo) return

    setLoadingPin(true)
    setPinError('')
    setPinSuccess('')

    const res = await changeBuyerPin(buyerInfo.phone, oldPin, newPin)
    if (res.success) {
      setPinSuccess('PIN berhasil diubah!')
      setOldPin('')
      setNewPin('')
      setTimeout(() => setIsChangingPin(false), 2000)
    } else {
      setPinError(res.error || 'Gagal mengubah PIN.')
    }
    setLoadingPin(false)
  }

  const getStatusText = (status: string, paymentMethod: string, paymentStatus: string) => {
    if (status === 'completed') return 'Selesai'
    if (status === 'cancelled') return 'Batal'
    if (status === 'problem') return 'Bermasalah'
    if (paymentMethod === 'qris' && paymentStatus === 'unpaid') return 'Menunggu QRIS'
    if (status === 'pending') return 'Menunggu Admin'
    if (status === 'delivering') return 'Diantar Kurir'
    return 'Diproses Penjual'
  }

  const getStatusColor = (status: string, paymentMethod: string, paymentStatus: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'cancelled' || status === 'problem') return 'bg-red-100 text-red-700'
    if (paymentMethod === 'qris' && paymentStatus === 'unpaid') return 'bg-yellow-100 text-yellow-800'
    if (status === 'pending') return 'bg-yellow-50 text-yellow-700'
    if (status === 'delivering') return 'bg-blue-100 text-blue-700'
    return 'bg-orange-100 text-orange-700'
  }

  if (isAuthenticated && buyerInfo) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-green-100 rounded-[2rem] flex items-center justify-center text-green-600">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Halo, {buyerInfo.name}!</h1>
              <p className="text-slate-500 font-bold">{buyerInfo.phone}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setIsChangingPin(!isChangingPin)}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Ganti PIN
            </button>
            <button 
              onClick={handleLogout}
              className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>

        {isChangingPin && (
          <div className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100 mb-8">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-slate-400" />
              Ganti PIN Keamanan
            </h2>
            <form onSubmit={handleChangePin} className="flex flex-col md:flex-row gap-4 items-start">
              <input 
                type="password" 
                placeholder="PIN Lama" 
                value={oldPin}
                onChange={e => setOldPin(e.target.value)}
                required
                className="w-full md:w-auto p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-500 outline-none"
              />
              <input 
                type="password" 
                placeholder="PIN Baru" 
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                required
                className="w-full md:w-auto p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-500 outline-none"
              />
              <button 
                type="submit" 
                disabled={loadingPin}
                className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loadingPin ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan PIN'}
              </button>
            </form>
            {pinError && <p className="text-red-500 text-sm font-bold mt-3">{pinError}</p>}
            {pinSuccess && <p className="text-green-500 text-sm font-bold mt-3">{pinSuccess}</p>}
          </div>
        )}

        <h2 className="text-xl font-black text-slate-900 mb-6 px-2">Riwayat Pesanan Saya</h2>
        
        {loadingOrders ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-slate-300 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-800">Belum Ada Pesanan</h3>
            <p className="text-slate-500 font-bold mt-2">Anda belum pernah melakukan pesanan dengan nomor ini.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-black tracking-widest">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-400 text-xs font-bold">
                      {new Date(order._createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <ul className="text-sm font-bold text-slate-700 space-y-1 mb-4">
                    {order.items?.map((item: any, i: number) => (
                      <li key={i}>{item.product?.name} <span className="text-slate-400">(x{item.quantity})</span></li>
                    ))}
                  </ul>
                  <div className="text-lg font-black text-slate-900">
                    Rp{order.totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between items-start md:items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusColor(order.status, order.paymentMethod, order.paymentStatus)}`}>
                    {getStatusText(order.status, order.paymentMethod, order.paymentStatus)}
                  </div>
                  
                  <Link 
                    href={`/track/${order.orderNumber}`}
                    className="w-full md:w-auto px-6 py-3 bg-green-50 text-green-700 font-black rounded-xl hover:bg-green-100 transition-colors text-center text-sm"
                  >
                    Lacak Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Kiri: Login Dasbor */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
        <div className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-xl text-center">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Dasbor Pembeli</h1>
          <p className="text-slate-500 font-bold mb-8 text-sm">Masuk untuk melihat riwayat pesanan Anda.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="0812xxxx (Nomor WhatsApp)"
              className="w-full text-center text-lg font-black p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none transition-all"
            />
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN (Default: 123456)"
              className="w-full text-center text-xl tracking-[0.5em] font-black p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none transition-all"
            />
            {errorLogin && <p className="text-red-500 text-sm font-bold">{errorLogin}</p>}
            <button 
              disabled={loadingLogin}
              type="submit" 
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-slate-200 mt-2"
            >
              {loadingLogin ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Masuk Dasbor'}
            </button>
          </form>
        </div>
      </div>

      {/* Kanan: Lacak Cepat */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-green-600 text-white">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/20 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4">Lacak Cepat</h1>
          <p className="text-green-100 mb-10 text-lg font-medium">
            Tidak ingin login? Lacak langsung menggunakan Nomor Pesanan Anda (ORD-XXX).
          </p>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl">
            <TrackOrderForm />
          </div>

          <div className="mt-10 text-left text-sm text-green-100/80 max-w-xs mx-auto">
            <p className="font-bold mb-2">Tips:</p>
            <ul className="list-disc ml-4 space-y-2">
              <li>Nomor pesanan diawali <strong>ORD-</strong></li>
              <li>Status diperbarui secara real-time.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
