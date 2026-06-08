import { sanityFetch } from "@/sanity/lib/live";
import { CATEGORIES_QUERY } from "@/sanity/lib/queries";
import { Category } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";

export default async function CategoriesPage() {
  const { data: categories } = await sanityFetch({ query: CATEGORIES_QUERY }) as { data: Category[] };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
          Kategori <span className="text-green-600">Pilihan</span>.
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          Temukan berbagai produk unggulan dari Pondokrejo berdasarkan kategori favorit Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link 
            key={category._id}
            href={category.serviceCount! > 0 && category.productCount === 0 ? `/services?category=${category.slug}` : `/products?category=${category.slug}`}
            className="group relative h-80 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 hover:scale-[1.02] transition-all duration-500"
          >
            {category.image ? (
              <Image
                src={urlFor(category.image).width(800).height(800).url()}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-slate-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h2 className="text-3xl font-black mb-2">{category.name}</h2>
              <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                Jelajahi Produk &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
