import { sanityFetch } from "@/sanity/lib/live";
import { ORDER_BY_NUMBER_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { MapPin, Phone, User, Clock, PackageCheck, ChevronLeft, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Menunggu Konfirmasi", color: "text-yellow-700", bg: "bg-yellow-50", icon: Clock },
  processing: { label: "Diproses Penjual", color: "text-blue-700", bg: "bg-blue-50", icon: PackageCheck },
  delivering: { label: "Diantar Kurir", color: "text-purple-700", bg: "bg-purple-50", icon: Truck },
  completed: { label: "Selesai (COD)", color: "text-green-700", bg: "bg-green-50", icon: PackageCheck },
};

export default async function MobileOrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const { data: order } = await sanityFetch({
    query: ORDER_BY_NUMBER_QUERY,
    params: { orderNumber },
  }) as { data: any | null };

  if (!order) {
    notFound();
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/track" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Detail Pesanan</h1>
      </header>

      <main className="p-6 pb-20">
        {/* Status Badge */}
        <div className={`${status.bg} ${status.color} p-6 rounded-[2rem] mb-8 flex items-center gap-4`}>
          <div className="bg-white/50 p-3 rounded-2xl">
            <StatusIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Status Saat Ini</p>
            <h2 className="text-xl font-black">{status.label}</h2>
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Nomor Pesanan</h3>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{order.orderNumber}</p>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-6 space-y-6">
            <div className="flex gap-4">
              <div className="bg-white p-2 h-fit rounded-xl">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Penerima</p>
                <p className="font-black text-slate-900">{order.customerName}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white p-2 h-fit rounded-xl">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Alamat Antar</p>
                <p className="font-bold text-slate-700 text-sm">{order.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Daftar Produk</h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item._key} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-900 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">{item.quantity}x</span>
                    <span className="font-bold text-slate-700 text-sm">{item.product.name}</span>
                  </div>
                  <span className="font-black text-slate-900 text-sm">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl border border-green-100">
                <span className="font-black text-green-800">Total COD</span>
                <span className="text-xl font-black text-green-700">Rp{order.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Courier Info */}
          {order.courier && (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-green-400 mb-4">Informasi Kurir</h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-lg">{order.courier.name}</p>
                    <p className="text-slate-400 text-xs font-medium">Kurir Desa Pondokrejo</p>
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${order.courier.phone}`}
                  className="inline-flex items-center gap-2 bg-green-600 text-white font-black px-6 py-3 rounded-xl text-sm active:scale-95 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi Kurir
                </a>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
