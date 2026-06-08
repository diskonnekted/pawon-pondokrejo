import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCTS_QUERY, CATEGORIES_QUERY } from "@/sanity/lib/queries";
import ProductCard from "@/components/ProductCard";
import { Product, Category } from "@/types";
import Link from "next/link";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q: search, category, minPrice, maxPrice } = await searchParams;

  // Enhance query to support category and price range filters
  const ENHANCED_PRODUCTS_QUERY = `
    *[_type == "product" 
      && (!defined($search) || name match $search + "*")
      && (!defined($category) || categories[]->slug.current match $category)
      && (!defined($minPrice) || price >= $minPrice)
      && (!defined($maxPrice) || price <= $maxPrice)
    ] | order(_createdAt desc) [0...16] {
      _id,
      name,
      "slug": slug.current,
      price,
      stock,
      image,
      "vendor": vendor->{
        name,
        "slug": slug.current
      },
      "categories": categories[]->{
        name,
        "slug": slug.current
      }
    }
  `;

  const [{ data: products }, { data: categories }] = await Promise.all([
    sanityFetch({ 
      query: ENHANCED_PRODUCTS_QUERY,
      params: { 
        search: search || null,
        category: category || null,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null
      } 
    }) as Promise<{ data: Product[] }>,
    sanityFetch({ query: CATEGORIES_QUERY }) as Promise<{ data: Category[] }>
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filter */}
        <aside className="lg:w-1/4 space-y-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
              Filter Produk
            </h2>
            
            <div className="space-y-8">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Kategori</h3>
                <div className="flex flex-col gap-2">
                  <Link 
                    href="/products"
                    className={`px-4 py-2.5 rounded-xl font-bold transition-all ${!category ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                  >
                    Semua Produk
                  </Link>
                  {categories.filter((cat) => cat.productCount === undefined || cat.productCount > 0).map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/products?${new URLSearchParams({ 
                        ...(search && { q: search }),
                        category: cat.slug,
                        ...(minPrice && { minPrice }),
                        ...(maxPrice && { maxPrice })
                      }).toString()}`}
                      className={`px-4 py-2.5 rounded-xl font-bold transition-all ${category === cat.slug ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Filter (Simplified as links for now) */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Rentang Harga</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Di bawah Rp50rb', min: 0, max: 50000 },
                    { label: 'Rp50rb - Rp200rb', min: 50000, max: 200000 },
                    { label: 'Di atas Rp200rb', min: 200000, max: 10000000 },
                  ].map((range) => (
                    <Link
                      key={range.label}
                      href={`/products?${new URLSearchParams({ 
                        ...(search && { q: search }),
                        ...(category && { category }),
                        minPrice: range.min.toString(),
                        maxPrice: range.max.toString()
                      }).toString()}`}
                      className={`px-4 py-2.5 rounded-xl font-bold transition-all ${minPrice === range.min.toString() && maxPrice === range.max.toString() ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                    >
                      {range.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link 
                href="/products"
                className="block text-center text-sm font-bold text-slate-400 hover:text-green-700 transition-colors py-4 border-t border-slate-100"
              >
                Reset Semua Filter
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:w-3/4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {category ? categories.find(c => c.slug === category)?.name : 'Semua Produk'}
              </h1>
              <p className="text-slate-500 font-medium">Menampilkan {products.length} produk pilihan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
            {products.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-xl">Tidak ada produk yang sesuai kriteria.</p>
                <Link href="/products" className="mt-4 inline-block text-green-700 font-bold hover:underline">
                  Lihat Semua Produk
                </Link>
              </div>
            )}
          </div>
          
          {/* Pagination Placeholder (Since it's 4x4, we limit to 16 for now) */}
          {products.length === 16 && (
            <div className="mt-16 text-center">
              <button className="bg-white border-2 border-slate-200 text-slate-900 font-black py-4 px-10 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-100">
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
