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
  MessageCircle,
  ArrowRight
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

export default async function IncubatorPage() {
  const [{ data: services }, { data: settings }] = await Promise.all([
    sanityFetch({ query: INCUBATOR_SERVICES_QUERY }) as Promise<{ data: IncubatorService[] }>,
    sanityFetch({ query: INCUBATOR_SETTINGS_QUERY }) as Promise<{ data: any }>
  ]);

  const heroImageUrl = settings?.image ? urlFor(settings.image).width(1920).height(1080).url() : null;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 md:py-32 relative overflow-hidden">
        {heroImageUrl && (
          <div className="absolute inset-0 z-0">
            <Image 
              src={heroImageUrl} 
              alt="Inkubator Background" 
              fill 
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900/60" />
          </div>
        )}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-green-500/30 backdrop-blur-md">
            Inisiatif Pemberdayaan Ekonomi
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            Inkubator <span className="text-green-500">UMKM</span> PAWON
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Program pendampingan komprehensif dari Kalurahan Pondokrejo untuk membantu warga membangun, mengembangkan, dan memajukan usaha hingga level profesional.
          </p>
          <a
            href="https://wa.me/081234567890?text=Halo, saya ingin bergabung dengan Inkubator UMKM Pondokrejo."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black px-10 py-5 rounded-3xl transition-all shadow-xl shadow-green-600/30 hover:scale-105 active:scale-95"
          >
            Daftar Program Sekarang
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-600/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
      </section>

      {/* Services Grid */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Layanan Unggulan Kami</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Kami menyediakan 8 pilar dukungan untuk memastikan usaha Anda tumbuh berkelanjutan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => {
            const Icon = iconMap[service.iconName] || Globe;
            return (
              <div key={service._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 group">
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left flex-grow">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">Membangun Ekonomi <br/>Mulai dari <span className="text-green-500">Tetangga</span>.</h2>
              <p className="text-slate-400 text-lg mb-10 font-medium">Jangan biarkan usaha Anda jalan di tempat. Bergabunglah dengan puluhan UMKM Pondokrejo lainnya yang sudah naik kelas.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                   href="https://wa.me/081234567890" 
                   className="bg-green-600 text-white font-black px-8 py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  Konsultasi Gratis
                </a>
              </div>
            </div>
            <div className="relative z-10 w-full md:w-1/3 aspect-square rounded-[3rem] bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-3xl border border-white/10 flex items-center justify-center">
               <Building className="w-32 h-32 text-green-500/40" />
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
