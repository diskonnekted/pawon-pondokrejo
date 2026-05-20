import { sanityFetch } from "@/sanity/lib/live";
import { INCUBATOR_SERVICES_QUERY, INCUBATOR_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { IncubatorService } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Palette, 
  Globe, 
  Handshake, 
  Banknote, 
  Building,
  ChevronLeft,
  MessageCircle
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, any> = {
  GraduationCap,
  Users,
  ShieldCheck,
  Palette,
  Globe,
  Handshake,
  Banknote,
  Building
};

export default async function MobileIncubatorPage() {
  const [{ data: services }, { data: settings }] = await Promise.all([
    sanityFetch({ query: INCUBATOR_SERVICES_QUERY }) as Promise<{ data: IncubatorService[] }>,
    sanityFetch({ query: INCUBATOR_SETTINGS_QUERY }) as Promise<{ data: any }>
  ]);

  const heroImageUrl = settings?.image ? urlFor(settings.image).width(800).height(1000).url() : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 bg-slate-900/80 backdrop-blur-md z-40 border-b border-white/10 p-4 flex items-center gap-4 text-white">
        <Link href="/" className="p-2 rounded-xl bg-white/10 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black tracking-tight">Inkubator UMKM</h1>
      </header>

      <main>
        {/* Mobile Hero */}
        <section className="bg-slate-900 text-white p-8 pb-16 relative overflow-hidden">
          {heroImageUrl && (
            <div className="absolute inset-0 z-0">
              <Image 
                src={heroImageUrl} 
                alt="Inkubator Background" 
                fill 
                className="object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
          )}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-green-500/30">
              Program Desa
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter leading-tight">Membangun Bisnis dari <span className="text-green-500">Desa</span>.</h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Dukungan penuh Kalurahan Pondokrejo untuk memajukan usaha warga.</p>
            <a
              href="https://wa.me/081234567890"
              className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-600/20 active:scale-95 transition-all"
            >
              Daftar Sekarang
            </a>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 blur-[80px] rounded-full -mr-24 -mt-24"></div>
        </section>

        {/* Services List */}
        <div className="p-6 -mt-8 bg-slate-50 rounded-t-[3rem] relative z-10">
          <div className="space-y-6">
            {services.map((service) => {
              const Icon = iconMap[service.iconName] || Globe;
              return (
                <div key={service._id} className="bg-white p-6 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex gap-6 items-start">
                  <div className="bg-slate-50 p-4 rounded-2xl text-green-600 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{service.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Section */}
        <div className="p-8 pb-32">
           <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Konsultasi UMKM</h3>
                <p className="text-slate-400 text-xs mb-6 font-medium">Punya kendala bisnis? Diskusi gratis dengan tim pendamping kami.</p>
                <a 
                  href="https://wa.me/081234567890"
                  className="inline-flex items-center gap-2 text-green-400 font-black text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Hubungi via WhatsApp
                </a>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mb-16"></div>
           </div>
        </div>
      </main>
    </div>
  );
}
