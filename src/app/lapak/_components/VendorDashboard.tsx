import { useState } from 'react'
import { updateVendorProfile } from '@/app/actions/vendor-portal'
import { Save, Power, LogOut, CheckCircle2, MessageSquare, AlignLeft, Loader2, Package, User } from 'lucide-react'
import VendorProductManager from './VendorProductManager'

interface Props {
  initialData: any
  onLogout: () => void
}

export default function VendorDashboard({ initialData, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'products'>('profile')
  const [isOpen, setIsOpen] = useState(initialData.isOpen)
  const [closingMessage, setClosingMessage] = useState(initialData.closingMessage || '')
  const [description, setDescription] = useState(initialData.description || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    setSuccess(false)
    const res = await updateVendorProfile(initialData._id, {
      isOpen,
      closingMessage,
      description
    })

    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      alert('Gagal memperbarui profil.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{initialData.name}</h1>
            <p className="text-slate-400 font-bold text-sm">Portal UMKM Pondokrejo</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-3 bg-white text-slate-400 hover:text-red-600 rounded-2xl shadow-sm transition-colors border border-slate-100"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            <User className="w-4 h-4" />
            Profil Toko
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            <Package className="w-4 h-4" />
            Kelola Produk
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {/* Status Buka/Tutup */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Power className={`w-5 h-5 ${isOpen ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <h3 className="font-black text-slate-800">Status Operasional</h3>
                </div>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isOpen ? 'bg-green-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOpen ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <p className="text-sm text-slate-500 font-medium mb-6">
                {isOpen 
                  ? 'Toko Anda saat ini BUKA dan dapat menerima pesanan dari warga.' 
                  : 'Toko Anda saat ini TUTUP. Produk akan tetap tampil namun tidak bisa dibeli.'}
              </p>

              {!isOpen && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    <MessageSquare className="w-3 h-3" /> Pesan Penutupan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sedang istirahat, buka lagi jam 4 sore."
                    className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-slate-900"
                    value={closingMessage}
                    onChange={(e) => setClosingMessage(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Deskripsi Toko */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <AlignLeft className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-800">Profil Toko</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Lapak</label>
                <textarea
                  rows={4}
                  placeholder="Ceritakan tentang toko atau produk unggulan Anda..."
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 text-sm leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Save Button (Hanya tampil di tab profil) */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-40">
              <div className="max-w-2xl mx-auto">
                <button
                  disabled={loading}
                  onClick={handleUpdate}
                  className={`w-full py-5 rounded-3xl font-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${success ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white shadow-slate-900/20'}`}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Berhasil Disimpan!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      <span>Simpan Perubahan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <VendorProductManager vendorId={initialData._id} />
        )}
      </div>
    </div>
  )
}
