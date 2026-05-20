import { sanityFetch } from "@/sanity/lib/live";
import { VENDOR_BY_SLUG_QUERY, PRODUCTS_BY_VENDOR_QUERY, SERVICES_BY_VENDOR_QUERY } from "@/sanity/lib/queries";
import { Vendor, Product, Service } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, MessageCircle, Store, Briefcase, Package } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function VendorShopPage({ params }: Props) {
  const { slug } = await params;

  const [{ data: vendor }, { data: products }, { data: services }] = await Promise.all([
    sanityFetch({ query: VENDOR_BY_SLUG_QUERY, params: { slug } }) as Promise<{ data: Vendor | null }>,
    sanityFetch({ query: PRODUCTS_BY_VENDOR_QUERY, params: { slug } }) as Promise<{ data: Product[] }>,
    sanityFetch({ query: SERVICES_BY_VENDOR_QUERY, params: { slug } }) as Promise<{ data: Service[] }>
  ]);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Vendor Header Header */}
      <header className="bg-white rounded-[4rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-slate-200/50 mb-16 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center md:items-start">
          <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner bg-slate-50 flex-shrink-0">
            {vendor.logo ? (
              <Image
                src={urlFor(vendor.logo).width(400).height(400).url()}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-50">
                <Store className="w-16 h-16 text-green-600" />
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                {vendor.name}
              </h1>
              {vendor.isVerified && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-black text-sm">
                  <BadgeCheck className="w-5 h-5" />
                  DIVERIFIKASI
                </div>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 font-bold mb-6">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-green-600" />
                {vendor.address || 'Pondokrejo'}
              </div>
            </div>

            <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-3xl font-medium">
              {vendor.description || 'Selamat datang di lapak resmi kami. Temukan berbagai produk pilihan berkualitas tinggi langsung dari kami.'}
            </p>

            <a 
              href={`https://wa.me/${vendor.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-green-600/30 hover:bg-green-700 hover:scale-105 transition-all active:scale-95"
            >
              <MessageCircle className="w-6 h-6" />
              Tanya Penjual
            </a>
          </div>
        </div>

        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
      </header>

      {/* Products Grid */}
      {products.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-green-100 p-2 rounded-xl">
              <Package className="w-6 h-6 text-green-700" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Produk</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Services Grid */}
      {services.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-700" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Layanan Jasa</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && services.length === 0 && (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xl text-center">Belum ada produk atau jasa yang diunggah oleh toko ini.</p>
        </div>
      )}
    </div>
  );
}
