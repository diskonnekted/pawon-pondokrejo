import { sanityFetch } from "@/sanity/lib/live";
import { VENDOR_BY_SLUG_QUERY, PRODUCTS_BY_VENDOR_QUERY, SERVICES_BY_VENDOR_QUERY } from "@/sanity/lib/queries";
import { Vendor, Product, Service } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, MessageCircle, Store, ChevronLeft, Package, Briefcase } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MobileVendorShopPage({ params }: Props) {
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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/vendors" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900 truncate">Lapak Penjual</h1>
      </header>

      <main>
        {/* Vendor Header */}
        <div className="bg-white p-6 pb-10 rounded-b-[3rem] shadow-sm mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 bg-slate-50 shadow-inner">
              {vendor.logo ? (
                <Image
                  src={urlFor(vendor.logo).width(200).height(200).url()}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-50">
                  <Store className="w-10 h-10 text-green-600" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{vendor.name}</h2>
              </div>
              {vendor.isVerified && (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">
                  <BadgeCheck className="w-4 h-4" />
                  Terverifikasi
                </div>
              )}
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-bold text-[10px]">
                <MapPin className="w-3 h-3 text-green-600" />
                {vendor.address || 'Pondokrejo'}
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed font-medium mb-8">
            {vendor.description || 'Selamat datang di lapak resmi kami di Pasar PAWON.'}
          </p>

          <a 
            href={`https://wa.me/${vendor.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-600/20 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Tanya Penjual via WhatsApp</span>
          </a>
        </div>

        {/* Catalog Sections */}
        <div className="p-6 space-y-12">
          {/* Products */}
          {products.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <Package className="w-4 h-4 text-green-700" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Katalog Produk</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <Briefcase className="w-4 h-4 text-blue-700" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Layanan Jasa</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            </section>
          )}

          {products.length === 0 && services.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold">Toko ini belum mengunggah produk atau jasa.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
