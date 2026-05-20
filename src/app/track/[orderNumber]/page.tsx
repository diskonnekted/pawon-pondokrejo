import { sanityFetch } from "@/sanity/lib/live";
import { ORDER_BY_NUMBER_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { MapPin, Phone, User, Clock, PackageCheck } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Menunggu Konfirmasi", color: "text-yellow-700", bg: "bg-yellow-50" },
  processing: { label: "Diproses Penjual", color: "text-blue-700", bg: "bg-blue-50" },
  delivering: { label: "Sedang Diantar Kurir", color: "text-purple-700", bg: "bg-purple-50" },
  completed: { label: "Selesai (COD)", color: "text-green-700", bg: "bg-green-50" },
  cancelled: { label: "Dibatalkan", color: "text-red-700", bg: "bg-red-50" },
};

export default async function OrderResultPage({ params }: Props) {
  const { orderNumber } = await params;
  const { data: order } = await sanityFetch({
    query: ORDER_BY_NUMBER_QUERY,
    params: { orderNumber },
  }) as { data: any };

  if (!order) {
    notFound();
  }

  const currentStatus = statusConfig[order.status] || { label: order.status, color: "text-gray-700", bg: "bg-gray-50" };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/track" className="text-green-700 font-bold mb-6 inline-block hover:underline">
          &larr; Kembali ke Pelacakan
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className={`p-8 ${currentStatus.bg} border-b flex items-center justify-between`}>
            <div>
              <p className="text-sm font-bold opacity-70 uppercase tracking-widest mb-1">Nomor Pesanan</p>
              <h1 className="text-2xl font-black text-gray-900 font-mono">{order.orderNumber}</h1>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold text-sm border shadow-sm ${currentStatus.bg} ${currentStatus.color}`}>
              {currentStatus.label}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Informasi Penerima
                  </h3>
                  <p className="font-bold text-lg">{order.customerName}</p>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" /> {order.customerPhone}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Alamat Pengiriman
                  </h3>
                  <p className="text-gray-600">{order.deliveryAddress}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Waktu Pesanan
                  </h3>
                  <p className="text-gray-600">
                    {new Date(order._createdAt).toLocaleString('id-ID', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>

                {order.courier && (
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <PackageCheck className="w-4 h-4" /> Kurir yang Bertugas
                    </h3>
                    <p className="font-bold text-green-900">{order.courier.name}</p>
                    <a 
                      href={`https://wa.me/${order.courier.phone}`}
                      className="text-green-600 text-sm font-bold hover:underline block mt-1"
                    >
                      Hubungi Kurir (WA)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Item Table */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Rincian Barang</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item._key} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div className="flex gap-4 items-center">
                      <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-gray-400">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">@ Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t flex justify-between items-center">
                <span className="text-xl font-bold text-gray-500">Total Pembayaran (COD)</span>
                <span className="text-3xl font-black text-green-700">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
