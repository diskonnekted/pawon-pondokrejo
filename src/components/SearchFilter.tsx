'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        router.push(`/?q=${query}`)
      } else {
        router.push('/')
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query, router])

  return (
    <div className="relative w-full max-w-lg mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          className="w-full p-4 pl-12 bg-white border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all shadow-sm"
          placeholder="Cari produk (misal: beras, telur)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </div>
  )
}
