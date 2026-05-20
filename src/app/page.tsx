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
import { BadgeCheck, ArrowRight, Rocket } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: Props) {
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

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-20">
        <div className="relative bg-slate-900 rounded-[3rem] p-8 md:p-20 text-white overflow-hidden shadow-2xl shadow-green-900/20">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: "url('/hero.jpg')" }}
          >
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-green-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-50"></span>
              </span>
              Produk Lokal Pondokrejo
            </div>            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              PAWON - <span className="text-green-500">Pasar Online</span> Warga Pondokrejo
            </h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg">
              Pasar digital resmi Kalurahan Pondokrejo. Temukan hasil bumi dan produk UMKM berkualitas tinggi langsung dari warga kita sendiri.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#products" className="bg-green-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-green-600/30">
                Jelajahi Produk
              </a>
            </div>
          </div>
          
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-600/20 blur-[120px] rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kategori Pilihan ✨</h2>
              <p className="text-slate-500 font-medium">Cari kebutuhan Anda lebih cepat</p>
            </div>
            <Link href="/categories" className="text-green-700 font-bold hover:underline underline-offset-8 decoration-2">
              Lihat Semua &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.slice(0, 5).map((category) => (
              <Link 
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group relative h-64 rounded-[2.5rem] overflow-hidden shadow-lg shadow-slate-100 transition-all duration-500 hover:scale-[1.03]"
              >
                {category.image ? (
                  <Image
                    src={urlFor(category.image).width(400).height(600).url()}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                  <h3 className="font-black text-lg">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promo Products Section */}
      {promoProducts.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Terbatas</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lagi Promo Nih! 🏷️</h2>
              <p className="text-slate-500 font-medium">Harga spesial buat kamu hari ini</p>
            </div>
            <Link href="/products" className="text-green-700 font-bold hover:underline underline-offset-8 decoration-2">
              Lihat Semua &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {promoProducts.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Banner - Moved here */}
      {banners.length > 0 && (
        <section className="mb-20">
          <PromoBanner banners={banners} />
        </section>
      )}

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="mb-20 bg-slate-50 -mx-4 px-4 py-20 rounded-[4rem]">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Paling Laris 🔥</h2>
                <p className="text-slate-500 font-medium">Produk favorit warga Pondokrejo</p>
              </div>
              <Link href="/products" className="text-green-700 font-bold hover:underline underline-offset-8 decoration-2">
                Lihat Semua &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellers.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Jasa Profesional Kalurahan 🛠️</h2>
              <p className="text-slate-500 font-medium">Layanan terpercaya langsung dari tenaga ahli Pondokrejo</p>
            </div>
            <Link href="/services" className="text-green-700 font-bold hover:underline underline-offset-8 decoration-2">
              Lihat Semua Jasa &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service: Service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </section>
      )}

      <div id="products">
        <Suspense fallback={<div className="h-20 mb-12 animate-pulse bg-slate-200 rounded-3xl" />}>
          <SearchFilter />
        </Suspense>

        <section className="mb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck className="w-5 h-5 text-blue-500" />
                <span className="text-blue-600 text-[10px] font-black uppercase tracking-wider">Produk Terverifikasi</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Barang Nyata & Terpercaya ✅</h2>
              <p className="text-slate-500 font-medium">Semua produk di bawah ini telah diverifikasi langsung oleh Pemerintah Kalurahan Pondokrejo</p>
            </div>
            <Link href="/products" className="hidden sm:block text-green-700 font-bold hover:underline underline-offset-8 decoration-2">
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-xl">Belum ada produk yang ditemukan.</p>
              </div>
            )}
          </div>
        </section>

        {/* Village Info Section */}
        {articles.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kabar Kalurahan 📰</h2>
                <p className="text-slate-500 font-medium">Info pelatihan, dukungan UMKM, dan pengumuman resmi Kalurahan Pondokrejo</p>
              </div>
              <Link href="/info" className="text-green-700 font-bold hover:underline underline-offset-8 decoration-2">
                Lihat Semua Berita &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.map((article: Article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Inkubator CTA Section */}
        <section className="mb-20">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left flex-grow">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-green-500/30">
                Program Unggulan Kalurahan
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Bawa Usaha Anda <br/>ke Level <span className="text-green-500">Profesional</span>.</h2>
              <p className="text-slate-400 text-lg mb-10 font-medium max-w-xl">Bergabunglah dengan Inkubator UMKM PAWON. Dapatkan pelatihan, mentoring, bantuan legalitas, hingga akses modal gratis dari Kalurahan.</p>
              <Link href="/inkubator" className="inline-flex items-center gap-3 bg-white text-slate-900 font-black px-10 py-4 rounded-2xl hover:bg-green-500 hover:text-white transition-all shadow-xl active:scale-95">
                Pelajari Program
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative z-10 hidden lg:block w-1/3 aspect-square rounded-[3rem] bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-3xl border border-white/10 p-12">
               <Rocket className="w-full h-full text-green-500/40" />
            </div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-600/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
          </div>
        </section>
      </div>
    </div>
  );
}
