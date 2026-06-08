'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Search } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const { totalItems } = useCart()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group min-w-fit">
          <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
            <Image
              src="/logo.webp"
              alt="Logo Pasar Pondokrejo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            PA<span className="text-green-600">WON</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/products" className="hover:text-green-600 transition-colors">Produk</Link>
          <Link href="/services" className="hover:text-green-600 transition-colors">Jasa</Link>
          <Link href="/categories" className="hover:text-green-600 transition-colors">Kategori</Link>
          <Link href="/vendors" className="hover:text-green-600 transition-colors">Toko</Link>
          <Link href="/info" className="hover:text-green-600 transition-colors">Info</Link>
          <Link href="/track" className="hover:text-green-600 transition-colors">Lacak</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/cart" className="relative p-3 hover:bg-green-50 rounded-2xl transition-colors group">
            <ShoppingCart className="w-6 h-6 text-slate-700 group-hover:text-green-600" />
            {totalItems > 0 && (
              <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>
          <Link href="/studio" className="p-3 hover:bg-slate-100 rounded-2xl transition-colors flex items-center gap-2 border border-slate-100">
            <User className="w-5 h-5 text-slate-700" />
            <span className="hidden lg:inline text-xs font-bold text-slate-700">LOGIN</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
