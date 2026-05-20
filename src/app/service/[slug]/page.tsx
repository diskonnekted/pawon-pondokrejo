import { sanityFetch } from "@/sanity/lib/live";
import { SERVICE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { Service } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, MapPin, BadgeCheck, Clock, ShieldCheck, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const priceTypeLabels: Record<string, string> = {
  fixed: 'Harga Pas',
  starting_from: 'Mulai Dari',
  hourly: 'Per Jam',
  negotiable: 'Nego / Kesepakatan',
};

export default async function ServiceDetailPage({ params }: Props) {
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
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left: Images */}
        <div className="lg:w-1/2">
          <div className="sticky top-32">
            <div className="relative aspect-[4/3] rounded-[4rem] overflow-hidden shadow-2xl shadow-green-900/10 border border-slate-100">
              {service.image && (
                <Image
                  src={urlFor(service.image).width(1200).height(900).url()}
                  alt={service.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {service.isPromo && (
                <div className="absolute top-8 left-8 bg-red-500 text-white font-black px-6 py-2 rounded-2xl shadow-xl animate-pulse">
                  DISKON {service.promoDiscount}%
                </div>
              )}
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 rounded-[2rem] p-6 flex flex-col items-center text-center">
                  {i === 1 && <ShieldCheck className="w-8 h-8 text-green-600 mb-3" />}
                  {i === 2 && <Clock className="w-8 h-8 text-green-600 mb-3" />}
                  {i === 3 && <BadgeCheck className="w-8 h-8 text-green-600 mb-3" />}
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">
                    {i === 1 && 'Terpercaya'}
                    {i === 2 && 'Respon Cepat'}
                    {i === 3 && 'Ahli Lokal'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Link 
              href={`/vendor/${service.vendor.slug}`}
              className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl font-black text-xs hover:bg-green-100 transition-colors"
            >
              {service.vendor.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
              {service.vendor.name}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">
            {service.name}
          </h1>

          <div className="flex items-center gap-4 mb-10">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                {priceTypeLabels[service.priceType] || 'Harga Layanan'}
              </span>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-green-700">
                  Rp{service.price.toLocaleString("id-ID")}
                </span>
                {originalPrice && (
                  <span className="text-xl text-slate-300 line-through font-bold">
                    Rp{originalPrice.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-slate prose-lg mb-12">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Tentang Layanan Ini</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              {service.description || "Dapatkan layanan profesional terbaik langsung dari ahlinya di Pondokrejo. Kami menjamin kualitas pengerjaan dan kepuasan Anda sebagai tetangga."}
            </p>
          </div>

          {/* Booking Card */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-green-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4">Pesan Sekarang</h3>
              <p className="text-slate-400 mb-8 font-medium">Konsultasikan kebutuhan Anda langsung dengan penyedia jasa via WhatsApp.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/${service.vendor.phone}?text=Halo, saya ingin memesan jasa ${service.name} di Pasar Pondokrejo.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black py-5 px-8 rounded-[2rem] transition-all active:scale-95 shadow-xl shadow-green-600/30"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          </div>

          <div className="mt-12 flex items-center gap-4 text-slate-400 text-sm font-bold bg-slate-50 p-6 rounded-3xl">
            <MapPin className="w-5 h-5 text-green-600" />
            <span>Lokasi Layanan: {service.vendor.address || 'Seluruh Pondokrejo'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
