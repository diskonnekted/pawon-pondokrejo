import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SanityLive } from "@/sanity/lib/live";
import { CartProvider } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pasar Pondokrejo - Marketplace Desa",
  description: "Marketplace lokal untuk warga Kalurahan Pondokrejo",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PasarRejo",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const isMobile = headerList.get("x-is-mobile") === "true";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <CartProvider>
          {!isMobile && <Navbar />}
          <main className="flex-grow">
            {children}
          </main>
          {!isMobile && (
            <footer className="border-t bg-white pt-16 pb-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                  <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative w-10 h-10">
                        <Image
                          src="/logo.webp"
                          alt="Logo PAWON"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-slate-900">
                        PA<span className="text-green-600">WON</span>
                      </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed font-medium">
                      Pasar Warga Pondokrejo (PAWON) adalah inisiatif marketplace digital resmi milik Kalurahan Pondokrejo untuk menghubungkan produk dan jasa warga langsung ke tangan pembeli.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Tentang Kami</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      PAWON hadir untuk memperkuat ekonomi lokal dengan semangat gotong-royong. Semua transaksi di sini membantu pertumbuhan UMKM dan kemandirian ekonomi kalurahan kita.
                    </p>
                    <div className="flex gap-4">
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Real UMKM</div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Verified</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Layanan Kalurahan</h4>
                    <ul className="space-y-4 text-sm font-bold">
                      <li>
                        <Link href="/register-vendor" className="text-slate-500 hover:text-green-600 transition-colors">Daftar Jadi Penjual</Link>
                      </li>
                      <li>
                        <Link href="/register-courier" className="text-slate-500 hover:text-green-600 transition-colors">Daftar Jadi Kurir</Link>
                      </li>
                      <li>
                        <Link href="/track" className="text-slate-500 hover:text-green-600 transition-colors">Lacak Pesanan Kurir</Link>
                      </li>
                      <li>
                        <Link href="/services" className="text-slate-500 hover:text-green-600 transition-colors">Cari Tenaga Ahli</Link>
                      </li>
                      <li>
                        <Link href="/info" className="text-slate-500 hover:text-green-600 transition-colors">Info & Pengumuman</Link>
                      </li>
                      <li className="pt-4">
                        <Link 
                          href="/inkubator" 
                          className="inline-block bg-slate-900 text-white font-black px-6 py-3 rounded-xl hover:bg-green-600 transition-all shadow-lg active:scale-95 text-xs"
                        >
                          Program Inkubator UMKM &rarr;
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-gray-400 text-xs font-medium">
                    &copy; 2026 Kalurahan Pondokrejo. PAWON: Pasar Warga Pondokrejo.
                  </div>
                  <div className="flex gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Membangun Kalurahan dari Tetangga</span>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </CartProvider>
        <SanityLive />
      </body>
    </html>
  );
}
