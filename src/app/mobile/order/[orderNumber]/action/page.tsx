'use client'

import { useState, use } from 'react'
import { updateOrderStatus } from '@/app/actions/order'
import { CheckCircle, AlertTriangle, Loader2, ChevronLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ orderNumber: string }>
}

export default function MobileOrderActionPage({ params }: Props) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderNumber = resolvedParams.orderNumber
  const role = searchParams.get('role')
  const status = searchParams.get('status')
  const label = searchParams.get('label')

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async () => {
    if (!orderNumber || !status) return
    
    setLoading(true)
    const res = await updateOrderStatus(orderNumber, status, `Update via WhatsApp (${role})`)
    
    if (res.success) {
      setDone(true)
    } else {
      setError(res.error || 'Gagal memperbarui status.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
        <div className="bg-green-100 p-8 rounded-[3rem] mb-6 shadow-lg shadow-green-100/50">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Berhasil!</h1>
        <p className="text-slate-500 mb-10 px-4">
          Status pesanan <b>{orderNumber}</b> telah diperbarui.
        </p>

        <button onClick={() => window.close()} className="w-full max-w-sm bg-slate-900 text-white text-center font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all">
          Tutup Halaman
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Konfirmasi Aksi</h1>
      </header>

      <main className="p-6 pb-32 flex flex-col items-center justify-center flex-grow">
        <div className="text-center mb-8 w-full">
          <div className="inline-block p-4 bg-blue-50 rounded-[2rem] mb-6 shadow-sm">
            <AlertTriangle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Konfirmasi Status</h2>
          <p className="text-slate-500 font-medium mt-2">Pesanan: <span className="font-bold text-slate-800">{orderNumber}</span></p>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2rem] mb-8 w-full max-w-sm border border-slate-100 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Aksi yang Dipilih:</p>
          <p className="text-lg font-black text-slate-800">{label || 'Update Status'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-3xl mb-8 text-sm font-bold w-full max-w-sm border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="w-full max-w-sm space-y-4">
          <button
            disabled={loading}
            onClick={handleAction}
            className="w-full bg-green-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ya, Konfirmasi'}
          </button>
          
          <button
            disabled={loading}
            onClick={() => router.back()}
            className="w-full text-slate-500 bg-slate-50 font-bold py-5 rounded-3xl active:scale-95 transition-all disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </main>
    </div>
  )
}
