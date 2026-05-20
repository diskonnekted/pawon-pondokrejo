import { sanityFetch } from "@/sanity/lib/live";
import { VENDORS_QUERY } from "@/sanity/lib/queries";
import { Vendor } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, Store } from "lucide-react";

export default async function VendorsPage() {
  const { data: vendors } = await sanityFetch({ query: VENDORS_QUERY }) as { data: Vendor[] };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
          UMKM <span className="text-green-600">Pondokrejo</span>.
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          Dukung tetangga dengan berbelanja langsung dari pelaku usaha lokal terverifikasi di desa kita.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vendors.map((vendor) => (
          <div 
            key={vendor._id}
            className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 group flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-50 flex-shrink-0">
                {vendor.logo ? (
                  <Image
                    src={urlFor(vendor.logo).width(200).height(200).url()}
                    alt={vendor.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-50">
                    <Store className="w-8 h-8 text-green-600" />
                  </div>
                )}
              </div>
              {vendor.isVerified && (
                <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                  <BadgeCheck className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                {vendor.name}
              </h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-4">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="line-clamp-1">{vendor.address || 'Pondokrejo'}</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                {vendor.description || 'Pelaku UMKM kebanggaan desa Pondokrejo yang menyediakan produk berkualitas.'}
              </p>
            </div>

            <Link 
              href={`/vendor/${vendor.slug}`}
              className="w-full bg-slate-900 text-white text-center font-black py-4 rounded-2xl group-hover:bg-green-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              Lihat Lapak &rarr;
            </Link>
          </div>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xl text-center">Belum ada UMKM yang terdaftar.</p>
        </div>
      )}
    </div>
  );
}
