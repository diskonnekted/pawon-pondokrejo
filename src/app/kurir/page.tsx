'use client'

import { useState } from 'react'
import { getCourierByPhone } from '@/app/actions/courier-portal'
import { Truck, Phone, ArrowRight, Loader2, Lock } from 'lucide-react'
import CourierDashboard from './_components/CourierDashboard'

export default function CourierLoginPage() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [courierData, setCourierData] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await getCourierByPhone(phone, pin)
    if (res.success && res.data) {
      setCourierData(res.data)
    } else {
      setError(res.error || 'Terjadi kesalahan.')
    }
    setLoading(false)
  }

  if (courierData) {
    return <CourierDashboard initialData={courierData} onLogout={() => setCourierData(null)} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-blue-50 rounded-3xl mb-4">
            <Truck className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Portal Kurir</h1>
          <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">Pondokrejo Logistik</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Nomor WhatsApp Kurir
            </label>
            <div className="relative">
              <Phone className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
              <input
                required
                type="tel"
                placeholder="08123456789"
                className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              PIN Keamanan
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
              <input
                required
                type="password"
                maxLength={6}
                placeholder="••••••"
                className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-900 tracking-[0.5em]"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>Masuk Tugas</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
