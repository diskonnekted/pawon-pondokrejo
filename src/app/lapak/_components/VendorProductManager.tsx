'use client'

import { useState, useEffect } from 'react'
import { getVendorProducts, createVendorProduct, uploadImageToSanity, deleteVendorProduct } from '@/app/actions/vendor-products'
import { Package, Plus, Trash2, Image as ImageIcon, Loader2, X, CheckCircle2, DollarSign, Database } from 'lucide-react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

export default function VendorProductManager({ vendorId }: { vendorId: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newStock, setNewStock] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const res = await getVendorProducts(vendorId)
    if (res.success) setProducts(res.data)
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return alert('Pilih foto produk terlebih dahulu.')

    setSubmitting(true)
    
    // 1. Upload Image
    const formData = new FormData()
    formData.append('file', selectedFile)
    const uploadRes = await uploadImageToSanity(formData)

    if (!uploadRes.success || !uploadRes.assetId) {
      alert(uploadRes.error)
      setSubmitting(false)
      return
    }

    // 2. Create Product
    const productRes = await createVendorProduct(vendorId, {
      name: newName,
      price: Number(newPrice),
      stock: Number(newStock),
      description: newDesc,
      assetId: uploadRes.assetId
    })

    if (productRes.success) {
      setNewName('')
      setNewPrice('')
      setNewStock('')
      setNewDesc('')
      setSelectedFile(null)
      setPreviewUrl(null)
      setShowAddForm(false)
      fetchProducts()
    } else {
      alert(productRes.error)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    const res = await deleteVendorProduct(id, vendorId)
    if (res.success) fetchProducts()
    else alert(res.error)
  }

  return (
    <div className="space-y-6 pb-32">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Package className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-black text-slate-800 text-lg">Produk Saya</h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white font-black px-4 py-2.5 rounded-2xl text-sm shadow-lg shadow-green-200 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-bold text-sm uppercase tracking-widest">Memuat Produk...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 text-center px-6">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold">Belum ada produk. Klik tombol tambah di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 group">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
                {p.image ? (
                  <Image src={urlFor(p.image).width(200).url()} alt={p.name} fill className="object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-black text-slate-800 line-clamp-1">{p.name}</h4>
                <p className="text-green-700 font-bold text-sm mt-0.5">Rp{p.price.toLocaleString('id-ID')}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Stok: {p.stock}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(p._id)}
                className="p-3 text-slate-300 hover:text-red-600 transition-colors active:scale-90"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-t-[3rem] sm:rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-20 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Tambah Produk Baru</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Foto Produk</label>
                <div 
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="relative aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-slate-100 transition-all"
                >
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-400">Tekan untuk pilih foto</p>
                    </>
                  )}
                  <input id="file-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Informasi Barang</label>
                <div className="space-y-4">
                  <input
                    required
                    type="text"
                    placeholder="Nama Produk"
                    className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
                      <input
                        required
                        type="number"
                        placeholder="Harga (Rp)"
                        className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Database className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
                      <input
                        required
                        type="number"
                        placeholder="Stok"
                        className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                      />
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Deskripsi singkat (Bahan, rasa, atau ukuran)"
                    className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900 text-sm"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Upload & Publikasi Produk</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
