import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCT_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, MapPin, ChevronLeft, ShoppingCart, Share2 } from "lucide-react";
import AddToCartButton from "@/components/Cart/AddToCartButton";
import CartIconBadge from "@/components/Cart/CartIconBadge";
import { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MobileProductPage({ params }: Props) {
  const { slug } = await params;
  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  }) as { data: Product | null };

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      {/* Top Header/Action Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between p-4 pointer-events-none">
        <Link href="/products" className="p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </Link>
        <div className="flex gap-2">
          <button className="p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto active:scale-90 transition-all">
            <Share2 className="w-6 h-6 text-slate-900" />
          </button>
          <CartIconBadge />
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-square w-full bg-slate-50">
        {product.image && (
          <Image
            src={urlFor(product.image).width(800).height(800).url()}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Info Section */}
      <div className="p-6 -mt-8 bg-white rounded-t-[3rem] relative z-10 shadow-[-4px_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            {product.vendor.name}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${product.stock > 0 ? "border-green-200 text-green-600 bg-green-50" : "border-red-200 text-red-600 bg-red-50"}`}>
            {product.stock > 0 ? "Stok Ready" : "Stok Habis"}
          </span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
          {product.name}
        </h1>
        <p className="text-2xl font-black text-green-700 mb-6">
          Rp{product.price.toLocaleString("id-ID")}
        </p>

        <div className="h-px bg-slate-100 w-full mb-6" />

        <div className="mb-8">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Deskripsi Produk</h4>
          <p className="text-slate-600 leading-relaxed font-medium">
            {product.description || "Produk UMKM berkualitas tinggi dari warga Pondokrejo."}
          </p>
        </div>

        {/* Vendor Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden mb-8">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-black">{product.vendor.name}</h4>
                <p className="text-slate-400 text-[10px] font-medium">{product.vendor.address}</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${product.vendor.phone}?text=Halo, saya tertarik dengan produk ${product.name} di Pasar Pondokrejo.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-green-400 hover:text-green-300"
            >
              <MessageCircle className="w-4 h-4" />
              Tanya Penjual via WhatsApp
            </a>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-xl rounded-full -mr-12 -mt-12"></div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 flex gap-3 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <a
          href={`https://wa.me/${product.vendor.phone}?text=Halo, saya ingin bertanya tentang ${product.name}`}
          className="p-4 bg-slate-100 rounded-2xl active:scale-90 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6 text-slate-700" />
        </a>
        <div className="flex-grow">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
