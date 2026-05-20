import { sanityFetch } from "@/sanity/lib/live";
import { VENDORS_QUERY } from "@/sanity/lib/queries";
import { Vendor } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, Store, ChevronLeft } from "lucide-react";

export default async function MobileVendorsPage() {
  const { data: vendors } = await sanityFetch({ query: VENDORS_QUERY }) as { data: Vendor[] };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Toko Tetangga</h1>
      </header>

      <main className="p-6 space-y-6 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Dukung <span className="text-green-600">UMKM</span> Lokal Pondokrejo.</h2>
          <p className="text-slate-500 text-sm font-medium mt-2">Berbelanja langsung dari warga terverifikasi.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {vendors.map((vendor) => (
            <div 
              key={vendor._id}
              className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/50 active:scale-[0.98] transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 bg-slate-50">
                  {vendor.logo ? (
                    <Image
                      src={urlFor(vendor.logo).width(200).height(200).url()}
                      alt={vendor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-50">
                      <Store className="w-6 h-6 text-green-600" />
                    </div>
                  )}
                </div>
                {vendor.isVerified && (
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-1">
                {vendor.name}
              </h2>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-4">
                <MapPin className="w-3 h-3 text-green-600" />
                {vendor.address || 'Pondokrejo'}
              </div>
              
              <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-2 font-medium">
                {vendor.description || 'UMKM terpercaya di desa Pondokrejo.'}
              </p>

              <Link 
                href={`/vendor/${vendor.slug}`}
                className="w-full bg-slate-900 text-white text-center font-black py-4 rounded-2xl text-sm shadow-lg shadow-slate-900/10 active:bg-green-600 transition-all"
              >
                Kunjungi Toko &rarr;
              </Link>
            </div>
          ))}
        </div>

        {vendors.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-bold text-center">Belum ada UMKM terdaftar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
