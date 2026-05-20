'use client'

import { useState } from 'react'
import { registerVendor } from '@/app/actions/vendor'
import { CheckCircle, Loader2, Store } from 'lucide-react'
import Link from 'next/link'

export default function RegisterVendorPage() {
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
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-sm inline-block max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Terkirim!</h1>
          <p className="text-gray-600 mb-8">
            Terima kasih telah mendaftar. Admin Desa akan memverifikasi data UMKM Anda. Kami akan menghubungi Anda melalui WhatsApp jika sudah aktif.
          </p>
          <Link href="/" className="bg-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-green-700 transition-colors inline-block w-full">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            <Store className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-6">Buka Toko Online UMKM Anda</h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Daftarkan UMKM Anda di Pasar Pondokrejo untuk menjangkau lebih banyak pembeli di wilayah desa kita. Nikmati fasilitas pengiriman kurir desa dan sistem pembayaran COD yang aman.
          </p>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1">1</div>
              <p className="text-gray-700 font-medium">Isi formulir pendaftaran dengan lengkap.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1">2</div>
              <p className="text-gray-700 font-medium">Tunggu verifikasi identitas dari Admin Desa.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1">3</div>
              <p className="text-gray-700 font-medium">Setelah aktif, Anda bisa mulai mengunggah produk UMKM Anda.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Formulir Pendaftaran UMKM</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama UMKM / Toko</label>
              <input
                required
                type="text"
                className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Contoh: Keripik Tempe Mak Mur"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nomor WhatsApp</label>
              <input
                required
                type="tel"
                className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Alamat di Pondokrejo</label>
              <input
                required
                type="text"
                className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Dusun, RT, RW"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Produk (Singkat)</label>
              <textarea
                required
                rows={3}
                className="w-full p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Jelaskan apa yang Anda jual..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Kirim Pendaftaran UMKM'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
