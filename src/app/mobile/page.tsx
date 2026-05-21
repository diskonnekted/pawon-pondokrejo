import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCTS_QUERY, BANNERS_QUERY, BEST_SELLERS_QUERY, PROMO_PRODUCTS_QUERY, CATEGORIES_QUERY, SERVICES_QUERY, LATEST_ARTICLES_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import ArticleCard from "@/components/ArticleCard";
import SearchFilter from "@/components/SearchFilter";
import PromoBanner from "@/components/PromoBanner";
import { Product, Banner, Category, Service, Article } from "@/types";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function MobileHome({ searchParams }: Props) {
  const { q: search } = await searchParams;

  const [{ data: products }, { data: banners }, { data: bestSellers }, { data: promoProducts }, { data: categories }, { data: services }, { data: articles }] = await Promise.all([
    sanityFetch({ 
      query: PRODUCTS_QUERY,
      params: { search: search || null } 
    }) as Promise<{ data: Product[] }>,
    sanityFetch({ query: BANNERS_QUERY }) as Promise<{ data: Banner[] }>,
    sanityFetch({ query: BEST_SELLERS_QUERY }) as Promise<{ data: Product[] }>,
    sanityFetch({ query: PROMO_PRODUCTS_QUERY }) as Promise<{ data: Product[] }>,
    sanityFetch({ query: CATEGORIES_QUERY }) as Promise<{ data: Category[] }>,
    sanityFetch({ query: SERVICES_QUERY, params: { search: null } }) as Promise<{ data: Service[] }>,
    sanityFetch({ query: LATEST_ARTICLES_QUERY }) as Promise<{ data: Article[] }>
  ]);

  const isSearching = !!search;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Hero - Hide when searching */}
      {!isSearching && (
        <section className="relative h-[50vh] flex items-end p-6 overflow-hidden">
          <Image 
            src="/hero.jpg" 
            alt="Hero" 
            fill 
            className="object-cover z-0"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
          
          <div className="relative z-20 w-full">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-md">
              <Image src="/logo.webp" alt="Logo" width={16} height={16} className="object-contain" />
              Produk Lokal Pondokrejo
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
              PAWON - <span className="text-green-500">Pasar Online</span> Warga Pondokrejo
            </h1>
          </div>
        </section>
      )}

      <div className={`p-6 space-y-12 ${isSearching ? 'pt-8' : ''}`}>
        {/* Search */}
        <div className={isSearching ? "sticky top-4 z-40" : ""}>
          <Suspense fallback={<div className="h-14 bg-slate-200 rounded-[2rem] animate-pulse" />}>
            <SearchFilter />
          </Suspense>
        </div>

        {isSearching ? (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">Hasil Pencarian</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">"{search}"</h2>
              </div>
              <Link href="/" className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl">
                Reset
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Produk Tidak Ditemukan</p>
                <p className="text-slate-300 text-[10px] mt-1 px-10">Coba gunakan kata kunci lain seperti "beras" atau "telur".</p>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Categories - Horizontal Scroll */}
            {categories.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Kategori ✨</h2>
                  <Link href="/categories" className="text-xs font-black text-green-700 uppercase tracking-widest">
                    Semua &rarr;
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                  {categories.map((category) => (
                    <Link 
                      key={category._id}
                      href={`/products?category=${category.slug}`}
                      className="min-w-[140px] w-[140px] group relative h-48 rounded-[2rem] overflow-hidden shadow-lg snap-start active:scale-95 transition-all"
                    >
                      {category.image ? (
                        <Image
                          src={urlFor(category.image).width(300).height(450).url()}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-3 right-4 text-white text-center">
                        <h3 className="font-black text-xs leading-tight">{category.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Promo Products - Horizontal Scroll */}
            {promoProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Promo Menarik 🏷️</h2>
                  <Link href="/products" className="text-xs font-black text-green-700 uppercase tracking-widest">
                    Semua &rarr;
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {promoProducts.map((product: Product) => (
                    <div key={product._id} className="min-w-[200px] w-[200px] snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Promo Banner */}
            {banners.length > 0 && (
              <section>
                <PromoBanner banners={banners} />
              </section>
            )}

            {/* Best Sellers - Horizontal Scroll */}
            {bestSellers.length > 0 && (
              <section className="bg-slate-50 -mx-6 px-6 py-10 rounded-[3rem]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Paling Laris 🔥</h2>
                  <Link href="/products" className="text-xs font-black text-green-700 uppercase tracking-widest">
                    Semua &rarr;
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {bestSellers.map((product: Product) => (
                    <div key={product._id} className="min-w-[200px] w-[200px] snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Services - Horizontal Scroll */}
            {services.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Jasa Kalurahan 🛠️</h2>
                  <Link href="/services" className="text-xs font-black text-green-700 uppercase tracking-widest">
                    Semua &rarr;
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                  {services.map((service: Service) => (
                    <div key={service._id} className="min-w-[280px] w-[280px] snap-start">
                      <ServiceCard service={service} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Products */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <BadgeCheck className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-600 text-[8px] font-black uppercase tracking-wider">Terverifikasi Kalurahan</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Barang Nyata ✅</h2>
                </div>
                <Link href="/products" className="text-xs font-black text-green-700 uppercase tracking-widest">
                  Semua &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 8).map((product: Product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <Link href="/products" className="mt-10 block w-full text-center bg-white border-2 border-slate-100 text-slate-900 font-black py-4 rounded-2xl active:scale-95 transition-all">
                Lihat Semua Produk
              </Link>
            </section>

            {/* Village Info Section */}
            {articles.length > 0 && (
              <section className="pb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Kabar Kalurahan 📰</h2>
                  <Link href="/info" className="text-xs font-black text-green-700 uppercase tracking-widest">
                    Semua &rarr;
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                  {articles.map((article: Article) => (
                    <div key={article._id} className="min-w-[280px] w-[280px] snap-start">
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inkubator Mobile CTA */}
            <section className="pb-10">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10 text-center">
                   <h3 className="text-2xl font-black mb-4">Ingin Usaha Naik Kelas? 🚀</h3>
                   <p className="text-slate-400 text-sm mb-6 leading-relaxed">Dapatkan mentoring, bantuan modal, dan pelatihan gratis dari Inkubator UMKM Pondokrejo.</p>
                   <Link href="/inkubator" className="block w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">
                      Pelajari Program
                   </Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
