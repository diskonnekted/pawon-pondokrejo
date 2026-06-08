import { sanityFetch } from "@/sanity/lib/live";
import { SERVICES_QUERY, CATEGORIES_QUERY } from "@/sanity/lib/queries";
import ServiceCard from "@/components/ServiceCard";
import { Service, Category } from "@/types";
import Link from "next/link";
import { Suspense } from "react";
import { Briefcase } from "lucide-react";

interface Props {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: Props) {
  const { q: search, category } = await searchParams;

  const ENHANCED_SERVICES_QUERY = `
    *[_type == "service" 
      && (!defined($search) || name match $search + "*")
    ] | order(_createdAt desc) {
      _id,
      name,
      "slug": slug.current,
      price,
      priceType,
      image,
      isBestSeller,
      isPromo,
      promoDiscount,
      "vendor": vendor->{
        name,
        "slug": slug.current,
        isVerified
      }
    }
  `;

  const [{ data: allServices }, { data: categories }] = await Promise.all([
    sanityFetch({ 
      query: ENHANCED_SERVICES_QUERY,
      params: { 
        search: search || null
      } 
    }) as Promise<{ data: Service[] }>,
    sanityFetch({ query: CATEGORIES_QUERY }) as Promise<{ data: Category[] }>
  ]);

  const serviceCategories = categories.filter(c => c.serviceCount !== undefined && c.serviceCount > 0);

  const services = allServices.filter(service => {
    if (!category) return true;
    return service.categories?.some(c => c.slug === category);
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filter */}
        <aside className="lg:w-1/4 space-y-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
              Filter Jasa
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Kategori Jasa</h3>
                <div className="flex flex-col gap-2">
                  <Link 
                    href="/services"
                    className={`px-4 py-2.5 rounded-xl font-bold transition-all ${!category ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                  >
                    Semua Jasa
                  </Link>
                  {serviceCategories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/services?category=${cat.slug}${search ? `&q=${search}` : ''}`}
                      className={`px-4 py-2.5 rounded-xl font-bold transition-all ${category === cat.slug ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link 
                href="/services"
                className="block text-center text-sm font-bold text-slate-400 hover:text-green-700 transition-colors py-4 border-t border-slate-100"
              >
                Reset Filter
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="bg-white/10 p-3 rounded-2xl w-fit mb-4">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-black text-lg mb-2">Punya Keahlian?</h4>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Daftarkan jasa Anda dan bantu tetangga sambil menambah penghasilan.</p>
              <Link href="/register-vendor" className="inline-block bg-green-600 text-white font-black px-6 py-3 rounded-xl text-sm hover:bg-green-700 transition-all">
                Daftar Sekarang
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
          </div>
        </aside>

        {/* Services Grid */}
        <main className="lg:w-3/4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {category ? serviceCategories.find(c => c.slug === category)?.name : 'Layanan Jasa Kalurahan'}
              </h1>
              <p className="text-slate-500 font-medium">Temukan tenaga ahli terpercaya di Pondokrejo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
            {services.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-xl">Belum ada jasa yang tersedia di kategori ini.</p>
                <Link href="/services" className="mt-4 inline-block text-green-700 font-bold hover:underline">
                  Lihat Semua Jasa
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
