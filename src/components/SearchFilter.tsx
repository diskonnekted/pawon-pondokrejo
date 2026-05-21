'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Loader2, X } from 'lucide-react'

export default function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const currentQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(currentQuery)

  // Sync state with URL when URL changes (e.g. back button)
  useEffect(() => {
    setQuery(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query === currentQuery) return

      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (query) {
          params.set('q', query)
        } else {
          params.delete('q')
        }
        
        const queryString = params.toString()
        const url = queryString ? `${pathname}?${queryString}` : pathname
        
        router.replace(url, { scroll: false })
      })
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query, router, pathname, searchParams, currentQuery])

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative group">
        <input
          type="text"
          className="w-full p-4 pl-12 pr-12 bg-white border-2 border-gray-100 rounded-3xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all shadow-sm font-bold text-slate-900 placeholder:text-slate-300"
          placeholder="Cari produk desa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isPending ? 'text-green-500' : 'text-slate-400'}`} />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-green-500" />}
          {query && !isPending && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
