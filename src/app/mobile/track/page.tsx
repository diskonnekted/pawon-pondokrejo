import TrackOrderForm from '@/components/TrackOrderForm'
import { Package, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function MobileTrackLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Lacak Pesanan</h1>
      </header>

      <main className="p-8 text-center flex-grow flex flex-col justify-center">
        <div className="bg-green-100 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-100/50">
          <Package className="w-12 h-12 text-green-700" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
          Cek Status <span className="text-green-600">Paketmu</span>.
        </h2>
        <p className="text-slate-500 mb-12 text-sm font-medium leading-relaxed">
          Masukkan nomor pesanan untuk melihat posisi paket dari Kurir Desa.
        </p>
        
        <div className="w-full max-w-sm mx-auto">
          <TrackOrderForm />
        </div>

        <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-slate-300">
          Pasar Digital Pondokrejo
        </p>
      </main>
    </div>
  );
}
