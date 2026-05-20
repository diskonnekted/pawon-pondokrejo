import { sanityFetch } from "@/sanity/lib/live";
import { SERVICES_QUERY, CATEGORIES_QUERY } from "@/sanity/lib/queries";
import ServiceCard from "@/components/ServiceCard";
import { Service, Category } from "@/types";
import Link from "next/link";
import { ChevronLeft, Filter, Search } from "lucide-react";
import Form from "next/form";

interface Props {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
  }>;
}

export default async function MobileServicesPage({ searchParams }: Props) {
  const { q: search, category } = await searchParams;

  const ENHANCED_SERVICES_QUERY = `
    *[_type == "service" 
      && (!defined($search) || name match $search + "*")
      && (!defined($category) || categories[]->slug.current match $category)
    ] | order(_createdAt desc) [0...20] {
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
      },
      "categories": categories[]->{
        name,
        "slug": slug.current
      }
    }
  `;

  const [{ data: services }, { data: categories }] = await Promise.all([
    sanityFetch({ 
      query: ENHANCED_SERVICES_QUERY,
      params: { 
        search: search || null,
        category: category || null
      } 
    }) as Promise<{ data: Service[] }>,
    sanityFetch({ query: CATEGORIES_QUERY }) as Promise<{ data: Category[] }>
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <Form action="/services" className="flex-grow relative">
            <input
              name="q"
              defaultValue={search}
              placeholder="Cari jasa warga..."
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-green-600 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            {category && <input type="hidden" name="category" value={category} />}
          </Form>
          <button className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
            <Filter className="w-6 h-6" />
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <Link 
            href="/services"
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${!category ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-100 text-slate-500'}`}
          >
            Semua Jasa
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/services?category=${cat.slug}${search ? `&q=${search}` : ''}`}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${category === cat.slug ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-100 text-slate-500'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      <main className="p-4 flex-grow">
        <div className="grid grid-cols-1 gap-4">
          {services.map((service: Service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>

        {services.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-slate-400 font-bold">Layanan jasa tidak ditemukan.</p>
          </div>
        )}
      </main>
    </div>
  );
}
