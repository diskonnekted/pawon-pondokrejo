# PAWON Architecture 🏛️

Dokumen ini menjelaskan pola desain dan struktur teknis yang digunakan dalam pengembangan aplikasi **PAWON (Pasar Warga Pondokrejo)**.

## 1. Core Framework: Next.js 15+ (App Router)
Aplikasi ini dibangun menggunakan arsitektur modern Next.js dengan pola **Server-First**:
- **Server Components**: Digunakan untuk hampir semua halaman utama (Beranda, Produk, Info, Inkubator) guna memastikan performa maksimal, SEO yang optimal, dan pengambilan data langsung dari database.
- **Client Components**: Hanya digunakan pada bagian yang membutuhkan interaktivitas tinggi seperti `CartContext`, `AddToCartButton`, dan `PromoBanner`.

## 2. Headless Architecture: Sanity.io
PAWON menggunakan pemisahan penuh antara *Content* dan *Code*:
- **Sanity as Database**: Semua data (Produk, Jasa, UMKM, Artikel, Pesanan) dikelola melalui Sanity Studio.
- **GROQ Queries**: Pengambilan data menggunakan bahasa query GROQ yang sangat efisien untuk relasi antar dokumen (misal: mengambil produk beserta data penjualnya dalam satu request).
- **Embedded Studio**: Dashboard admin (`/studio`) terintegrasi langsung di dalam aplikasi Next.js, memudahkan pengelola Kalurahan dalam melakukan update data.

## 3. Adaptive Mobile Strategy
PAWON menggunakan strategi **Hybrid Mobile Detection**:
- **Next.js Middleware**: Sistem secara cerdas mendeteksi `user-agent` pengunjung. Jika terdeteksi perangkat mobile, permintaan akan di-*rewrite* secara invisible ke subpath `/src/app/mobile/*`.
- **Dedicated UI**: Memberikan pengalaman navigasi bawah (*Bottom Nav*) yang mirip aplikasi Android/iOS asli bagi pengguna HP, sementara pengguna komputer mendapatkan tampilan dashboard belanja yang luas.

## 4. Progressive Web App (PWA)
Aplikasi ini dikonfigurasi sebagai PWA untuk mendukung kemandirian warga:
- **Offline Ready**: Menggunakan service worker untuk caching aset dasar.
- **Installable**: Memiliki `manifest.json` yang memungkinkan warga menginstal PAWON langsung di layar utama HP mereka tanpa perlu lewat Play Store.

## 5. State Management & Data Flow
- **Cart Context**: Pengelolaan keranjang belanja menggunakan React Context API yang dipadukan dengan `localStorage` untuk persistensi data belanja warga.
- **Server Actions**: Proses pengiriman data sensitif (seperti membuat pesanan baru atau pendaftaran UMKM) menggunakan Next.js Server Actions yang aman dari sisi server.
- **Sanity Live**: Menggunakan fitur Sanity Live Content untuk pembaruan data produk secara real-time tanpa perlu refresh halaman.

## 6. Project Structure
```text
src/
├── app/              # Routing & Pages (Desktop & Mobile subpaths)
│   ├── actions/      # Logic bisnis & database (Server Actions)
│   └── mobile/       # UI khusus untuk perangkat mobile
├── components/       # UI Reusable components
├── context/          # State management (Cart, Auth, etc)
├── sanity/           # Konfigurasi CMS, Schema, & Queries
└── types/            # Definisi tipe data TypeScript
```

---
**PAWON** - *Modern, Terpusat, dan Berbasis Warga.*
