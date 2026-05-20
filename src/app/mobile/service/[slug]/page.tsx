import { sanityFetch } from "@/sanity/lib/live";
import { SERVICE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { Service } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, MapPin, BadgeCheck, ChevronLeft, Share2, ShieldCheck, Clock } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const priceTypeLabels: Record<string, string> = {
  fixed: 'Harga Pas',
  starting_from: 'Mulai Dari',
  hourly: 'Per Jam',
  negotiable: 'Nego / Kesepakatan',
};

export default async function MobileServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: service } = await sanityFetch({
    query: SERVICE_BY_SLUG_QUERY,
    params: { slug },
  }) as { data: Service | null };

  if (!service) {
    notFound();
  }

  const originalPrice = service.isPromo && service.promoDiscount 
    ? Math.round(service.price / (1 - service.promoDiscount / 100))
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      {/* Top Header/Action Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between p-4 pointer-events-none">
        <Link href="/services" className="p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </Link>
        <div className="flex gap-2">
          <button className="p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto active:scale-90 transition-all">
            <Share2 className="w-6 h-6 text-slate-900" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full bg-slate-50">
        {service.image && (
          <Image
            src={urlFor(service.image).width(800).height(600).url()}
            alt={service.name}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Info Section */}
      <div className="p-6 -mt-8 bg-white rounded-t-[3rem] relative z-10 shadow-[-4px_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 mb-4">
          <Link 
            href={`/vendor/${service.vendor.slug}`}
            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
          >
            {service.vendor.isVerified && <BadgeCheck className="w-3 h-3 text-blue-500" />}
            {service.vendor.name}
          </Link>
          {service.isPromo && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              PROMO {service.promoDiscount}%
            </span>
          )}
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
          {service.name}
        </h1>
        
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-black text-green-700">
            Rp{service.price.toLocaleString("id-ID")}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            ({priceTypeLabels[service.priceType] || 'Harga Layanan'})
          </span>
        </div>

        <div className="h-px bg-slate-100 w-full mb-6" />

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center text-center">
              {i === 1 && <ShieldCheck className="w-6 h-6 text-green-600 mb-2" />}
              {i === 2 && <Clock className="w-6 h-6 text-green-600 mb-2" />}
              {i === 3 && <BadgeCheck className="w-6 h-6 text-green-600 mb-2" />}
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                {i === 1 && 'Aman'}
                {i === 2 && 'Cepat'}
                {i === 3 && 'Ahli'}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Deskripsi Layanan</h4>
          <p className="text-slate-600 leading-relaxed font-medium text-sm">
            {service.description || "Layanan profesional berkualitas tinggi dari tenaga ahli berpengalaman di Pondokrejo."}
          </p>
        </div>

        {/* Provider Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden mb-8">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-black">{service.vendor.name}</h4>
                <p className="text-slate-400 text-[10px] font-medium">{service.vendor.address || 'Pondokrejo'}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-xl rounded-full -mr-12 -mt-12"></div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-6 z-40 pb-8">
        <a
          href={`https://wa.me/${service.vendor.phone}?text=Halo, saya ingin bertanya tentang layanan ${service.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-600 text-white text-center font-black py-5 rounded-2xl shadow-xl shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <MessageCircle className="w-6 h-6" />
          <span>Hubungi via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
