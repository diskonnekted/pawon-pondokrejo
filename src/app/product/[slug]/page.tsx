import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCT_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, MapPin } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  }) as { data: Product | null };

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-green-700 transition-colors group">
        <div className="p-2 rounded-lg bg-white border border-slate-100 group-hover:border-green-100 group-hover:bg-green-50 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        </div>
        Kembali ke Pasar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Image */}
        <div className="lg:col-span-7 sticky top-32">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-slate-200 border border-slate-100">
            {product.image && (
              <Image
                src={urlFor(product.image).width(1200).height(1200).url()}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-5 flex flex-col pt-4">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                {product.vendor.name}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${product.stock > 0 ? "border-green-200 text-green-600 bg-green-50" : "border-red-200 text-red-600 bg-red-50"}`}>
                {product.stock > 0 ? "Stok Ready" : "Stok Habis"}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter mb-4">
              {product.name}
            </h1>
            <p className="text-3xl md:text-4xl font-black text-green-700">
              Rp{product.price.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="prose prose-slate max-w-none mb-12">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Deskripsi Produk</h4>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {product.description || "Produk UMKM berkualitas tinggi dari warga Pondokrejo."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <div className="flex-grow">
              <AddToCartButton product={product} />
            </div>
            <a
              href={`https://wa.me/${product.vendor.phone}?text=Halo, saya tertarik dengan produk ${product.name} di Pasar Pondokrejo.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 font-black py-4 px-8 rounded-3xl hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-100"
            >
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span>Tanya Penjual</span>
            </a>
          </div>

          {/* Vendor Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xl font-black">{product.vendor.name}</h4>
                  <p className="text-slate-400 text-sm font-medium">Alamat: {product.vendor.address}</p>
                </div>
              </div>
              <Link href={`/vendor/${product.vendor.slug || ''}`} className="inline-flex text-sm font-bold text-green-400 hover:text-green-300 transition-colors">
                Lihat Semua Produk Toko Ini &rarr;
              </Link>
            </div>
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mt-16 group-hover:bg-green-500/20 transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
