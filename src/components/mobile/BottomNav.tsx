'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User, Grid, Store, Briefcase } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // On mobile, the pathname will actually start with /mobile due to rewrite
  // but usePathname returns the URL path as seen by the browser (original path)
  
  const navItems = [
    { name: 'Beranda', icon: Home, href: '/' },
    { name: 'Produk', icon: ShoppingBag, href: '/products' },
    { name: 'Jasa', icon: Briefcase, href: '/services' },
    { name: 'Toko', icon: Store, href: '/vendors' },
    { name: 'Keranjang', icon: ShoppingCart, href: '/cart' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-3 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-green-600 scale-110' : 'text-slate-400'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-green-600/10' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
