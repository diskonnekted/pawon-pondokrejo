'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'

export default function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    
    setLoading(true)
    router.push(`/track/${orderNumber.trim().toUpperCase()}`)
  }

  return (
    <form onSubmit={handleTrack} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          required
          className="flex-grow p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all uppercase font-mono"
          placeholder="Masukkan No. Pesanan (Contoh: ORD-ABC123)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
        </button>
      </div>
    </form>
  )
}
