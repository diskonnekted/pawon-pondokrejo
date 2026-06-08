'use client'

import { useState, useEffect } from 'react'
import TrackOrderForm from '@/components/TrackOrderForm'
import { Package, User, LogOut, Loader2, KeyRound, ChevronLeft } from 'lucide-react'
import { loginBuyer, getBuyerOrders, changeBuyerPin } from '@/app/actions/buyer'
import Link from 'next/link'

export default function MobileTrackLandingPage() {
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
    if (status === 'problem') return 'Kendala'
    if (paymentMethod === 'qris' && paymentStatus === 'unpaid') return 'Bayar QRIS'
    if (status === 'pending') return 'Pending'
    if (status === 'delivering') return 'Diantar'
    return 'Diproses'
  }

  const getStatusColor = (status: string, paymentMethod: string, paymentStatus: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-200'
    if (status === 'cancelled' || status === 'problem') return 'bg-red-100 text-red-700 border-red-200'
    if (paymentMethod === 'qris' && paymentStatus === 'unpaid') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (status === 'pending') return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    if (status === 'delivering') return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-orange-100 text-orange-700 border-orange-200'
  }

  if (isAuthenticated && buyerInfo) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl bg-slate-100 text-slate-700 active:scale-90 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-black text-slate-900">Dasbor Anda</h1>
          </div>
          <button onClick={handleLogout} className="p-2 bg-red-50 text-red-600 rounded-xl active:scale-90">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="p-4 pb-24 space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-black tracking-widest uppercase">Halo,</p>
              <h2 className="text-xl font-black text-slate-900 leading-tight">{buyerInfo.name}</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">{buyerInfo.phone}</p>
            </div>
            <button 
              onClick={() => setIsChangingPin(!isChangingPin)} 
              className={`p-3 rounded-2xl active:scale-90 transition-all ${isChangingPin ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              <KeyRound className="w-6 h-6" />
            </button>
          </div>

          {isChangingPin && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 text-sm">
                <KeyRound className="w-4 h-4 text-slate-400" />
                Ganti PIN Keamanan
              </h3>
              <form onSubmit={handleChangePin} className="space-y-3">
                <input 
                  type="password" 
                  placeholder="PIN Lama" 
                  value={oldPin}
                  onChange={e => setOldPin(e.target.value)}
                  required
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:border-green-500 outline-none"
                />
                <input 
                  type="password" 
                  placeholder="PIN Baru" 
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  required
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:border-green-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={loadingPin}
                  className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-sm"
                >
                  {loadingPin ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Simpan PIN'}
                </button>
              </form>
              {pinError && <p className="text-red-500 text-xs font-bold mt-2 text-center">{pinError}</p>}
              {pinSuccess && <p className="text-green-500 text-xs font-bold mt-2 text-center">{pinSuccess}</p>}
            </div>
          )}

          <div>
            <h3 className="font-black text-slate-900 px-2 mb-3 text-sm">Riwayat Pesanan</h3>
            {loadingOrders ? (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-500 text-sm">Belum ada pesanan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order._id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-black tracking-widest">
                          {order.orderNumber}
                        </span>
                        <div className="text-xs text-slate-400 font-bold mt-1">
                          {new Date(order._createdAt).toLocaleDateString('id-ID', { dateStyle: 'short' })}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status, order.paymentMethod, order.paymentStatus)}`}>
                        {getStatusText(order.status, order.paymentMethod, order.paymentStatus)}
                      </div>
                    </div>
                    
                    <ul className="text-xs font-bold text-slate-700 mb-3 space-y-1 pl-3 list-disc">
                      {order.items?.slice(0, 2).map((item: any, i: number) => (
                        <li key={i}>{item.product?.name} <span className="text-slate-400">x{item.quantity}</span></li>
                      ))}
                      {order.items?.length > 2 && (
                        <li className="text-slate-400 list-none text-[10px]">+{order.items.length - 2} item lainnya</li>
                      )}
                    </ul>

                    <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                      <div className="text-sm font-black text-slate-900">
                        Rp{order.totalAmount.toLocaleString('id-ID')}
                      </div>
                      <Link 
                        href={`/mobile/track/${order.orderNumber}`}
                        className="px-4 py-2 bg-green-50 text-green-700 text-xs font-black rounded-lg"
                      >
                        Detail &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4 shadow-sm">
        <Link href="/" className="p-2 rounded-xl bg-slate-100 text-slate-700 active:scale-90 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Portal Pelanggan</h1>
      </header>

      <main className="p-5 pb-20 space-y-6 flex-grow">
        
        {/* LOGIN FORM */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 text-center">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-[1rem] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Masuk Dasbor</h2>
          <p className="text-slate-500 text-xs font-bold mb-6">Kelola seluruh riwayat pesanan Anda.</p>
          
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="0812xxxx (Nomor WhatsApp)"
              className="w-full text-center text-sm font-black p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-slate-900 outline-none transition-all"
            />
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN (Default: 123456)"
              className="w-full text-center tracking-[0.3em] font-black p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-slate-900 outline-none transition-all"
            />
            {errorLogin && <p className="text-red-500 text-xs font-bold">{errorLogin}</p>}
            <button 
              disabled={loadingLogin}
              type="submit" 
              className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl active:scale-95 transition-all mt-2 text-sm"
            >
              {loadingLogin ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Masuk Dasbor'}
            </button>
          </form>
        </div>

        {/* FAST TRACK */}
        <div className="bg-green-600 rounded-[2rem] p-6 text-white shadow-xl shadow-green-600/20 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Package className="w-40 h-40" />
          </div>
          
          <h2 className="text-2xl font-black mb-2 relative z-10">Lacak Cepat</h2>
          <p className="text-green-100 text-xs font-medium mb-6 relative z-10">
            Tanpa login? Lacak langsung dengan <br/><strong>Nomor Pesanan (ORD-XXX)</strong>.
          </p>
          
          <div className="relative z-10">
            <TrackOrderForm />
          </div>
        </div>

      </main>
    </div>
  )
}
