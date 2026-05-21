import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCTS_QUERY, CATEGORIES_QUERY } from "@/sanity/lib/queries";
import ProductCard from "@/components/ProductCard";
import SearchFilter from "@/components/SearchFilter";
import { Product, Category } from "@/types";
import Link from "next/link";
import { ChevronLeft, Filter, Search } from "lucide-react";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
  }>;
}

export default async function MobileProductsPage({ searchParams }: Props) {
  const { q: search, category } = await searchParams;

  const ENHANCED_PRODUCTS_QUERY = `
    *[_type == "product" 
      && (!defined($search) || name match $search + "*")
      && (!defined($category) || categories[]->slug.current match $category)
    ] | order(_createdAt desc) [0...20] {
      _id,
      name,
      "slug": slug.current,
      price,
      stock,
      image,
      "vendor": vendor->{
        name,
        "slug": slug.current,
        isVerified
      }
    }
  `;

  const [{ data: products }, { data: categories }] = await Promise.all([
    sanityFetch({ 
      query: ENHANCED_PRODUCTS_QUERY,
      params: { 
        search: search || null,
        category: category || null
      } 
    }) as Promise<{ data: Product[] }>,
    sanityFetch({ query: CATEGORIES_QUERY }) as Promise<{ data: Category[] }>
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all flex-shrink-0">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-grow">
            <Suspense fallback={<div className="h-10 bg-slate-100 rounded-2xl animate-pulse" />}>
              <SearchFilter />
            </Suspense>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
          <Link 
            href="/products"
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${!category ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-100 text-slate-500'}`}
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/products?category=${cat.slug}${search ? `&q=${search}` : ''}`}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${category === cat.slug ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-100 text-slate-500'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      <main className="p-4 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-slate-400 font-bold">Produk tidak ditemukan.</p>
          </div>
        )}
      </main>
    </div>
  );
}
