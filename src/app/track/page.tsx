import TrackOrderForm from '@/components/TrackOrderForm'
import { Package } from 'lucide-react'

export default function TrackLandingPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Package className="w-10 h-10 text-green-700" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Lacak Pesanan Anda</h1>
        <p className="text-gray-600 mb-12 text-lg">
          Gunakan nomor pesanan yang Anda dapatkan setelah checkout untuk melihat status pengiriman oleh Kurir Desa Pondokrejo.
        </p>
        
        <TrackOrderForm />
        
        <div className="mt-12 p-6 bg-white rounded-3xl border border-dashed border-gray-300 inline-block text-left text-sm text-gray-500">
          <p className="font-bold mb-2">Tips:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Nomor pesanan diawali dengan <strong>ORD-</strong></li>
            <li>Status diperbarui secara real-time oleh kurir kami.</li>
            <li>Jika ada kendala, hubungi Admin Desa atau Penjual terkait.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
