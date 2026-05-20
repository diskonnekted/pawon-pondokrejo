import { sanityFetch } from "@/sanity/lib/live";
import { CATEGORIES_QUERY } from "@/sanity/lib/queries";
import { Category } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function MobileCategoriesPage() {
  const { data: categories } = await sanityFetch({ query: CATEGORIES_QUERY }) as { data: Category[] };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Semua Kategori</h1>
      </header>

      <main className="p-6 space-y-6">
        {categories.map((category) => (
          <Link 
            key={category._id}
            href={`/products?category=${category.slug}`}
            className="group relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl active:scale-[0.98] transition-all"
          >
            {category.image ? (
              <Image
                src={urlFor(category.image).width(600).height(400).url()}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-2xl font-black">{category.name}</h2>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Lihat Produk &rarr;</p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
