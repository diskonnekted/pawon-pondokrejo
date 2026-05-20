'use client'

import { useState } from 'react'
import { registerVendor } from '@/app/actions/vendor'
import { CheckCircle, Loader2, Store, ChevronLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function MobileRegisterVendorPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await registerVendor(formData)
    if (result.success) {
      setSuccess(true)
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
        <div className="bg-green-100 p-8 rounded-[3rem] mb-6 shadow-lg shadow-green-100/50">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Terdaftar!</h1>
        <p className="text-slate-500 mb-10 px-4">
          Data UMKM Anda sedang diverifikasi oleh Admin Desa.
        </p>

        <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-10 text-left w-full max-w-sm">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-green-600" />
            Apa Selanjutnya?
          </h4>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Admin Desa akan memverifikasi identitas dan alamat Anda. Kami akan menghubungi Anda via WhatsApp jika akun sudah aktif dan siap untuk mengunggah produk.
          </p>
        </div>

        <Link href="/" className="w-full max-w-sm bg-slate-900 text-white text-center font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all">
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Daftar UMKM</h1>
      </header>

      <main className="p-6 pb-32">
        <div className="mb-10 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-green-700" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Buka Toko Online</h2>
          <p className="text-slate-500 text-sm font-medium px-4">
            Jangkau pembeli di seluruh Pondokrejo dengan sistem COD dan kurir desa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              required
              type="text"
              placeholder="Nama UMKM / Toko"
              className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              required
              type="tel"
              placeholder="Nomor WhatsApp"
              className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <input
              required
              type="text"
              placeholder="Alamat di Pondokrejo"
              className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <textarea
              required
              rows={3}
              placeholder="Deskripsi Singkat Produk"
              className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Kirim Pendaftaran UMKM'}
          </button>
        </form>

        <div className="mt-12 p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-2">Informasi</h4>
          <p className="text-xs font-bold text-amber-800 leading-relaxed">
            Pendaftaran ini gratis dan hanya untuk warga dengan KTP/Domisili Pondokrejo.
          </p>
        </div>
      </main>
    </div>
  )
}
