# PAWON (Pasar Warga Pondokrejo) 🍲⚡

**PAWON** adalah inisiatif marketplace digital resmi milik **Kalurahan Pondokrejo** yang dirancang untuk memperkuat ekonomi lokal. Nama PAWON sendiri merupakan akronim dari **Pasar Warga Pondokrejo**, sekaligus melambangkan kehangatan dapur (pawon) yang menjadi pusat kehidupan warga.

Aplikasi ini menghubungkan produk UMKM, hasil bumi, dan layanan jasa profesional warga langsung ke tangan pembeli dengan sistem yang modern, terverifikasi, dan ramah pengguna.

## 🚀 Fitur Utama

### 🛒 Marketplace Produk (UMKM)
*   **Katalog Terverifikasi**: Semua produk telah diverifikasi oleh Admin Kalurahan untuk menjamin keaslian dan kualitas.
*   **Seksi Promo & Terlaris**: Menampilkan produk unggulan dan penawaran spesial untuk warga.
*   **Kategori Pilihan**: Pencarian produk berdasarkan kategori (Makanan, Kerajinan, Pertanian, dll) dengan tampilan elegan.

### 🛠️ Layanan Jasa (Services)
*   **Tenaga Ahli Lokal**: Temukan jasa instalasi listrik, internet, pijat bayi, hingga perbaikan elektronik langsung dari warga berkopetensi.
*   **Booking Mudah**: Terhubung langsung ke WhatsApp penyedia jasa untuk konsultasi dan pemesanan.

### 📱 Pengalaman Mobile Native (PWA)
*   **Optimasi Mobile**: Tampilan khusus mobile dengan navigasi bawah (*Bottom Nav*) layaknya aplikasi Android/iOS native.
*   **PWA Ready**: Dapat diinstal langsung di layar utama HP tanpa melalui Play Store.
*   **Deteksi Otomatis**: Sistem secara cerdas menyajikan layout terbaik berdasarkan perangkat yang digunakan.

### 📰 Kabar Kalurahan (Info Desa)
*   **Pusat Informasi**: Update resmi mengenai pelatihan UMKM, bantuan modal BUMDes, dan panduan resmi desa.
*   **Dukungan Pemerintah**: Pengumuman kegiatan yang bertujuan meningkatkan kapasitas pelaku usaha desa.

### 🚚 Logistik & Tracking
*   **Kurir Desa**: Pengiriman barang ditangani oleh tenaga kurir resmi desa.
*   **Lacak Pesanan**: Fitur real-time untuk memantau status pengiriman paket.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
*   **CMS**: [Sanity.io](https://www.sanity.io/) (Headless CMS for Content & Products)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Rich Text**: [Portable Text](https://github.com/portabletext/react)
*   **PWA**: [@ducanh2912/next-pwa](https://www.npmjs.com/package/@ducanh2912/next-pwa)
*   **Deployment**: Ubuntu with CloudPanel (Nginx Reverse Proxy)

## 📦 Instalasi Lokal

1.  **Clone Repository**:
    ```bash
    git clone https://github.com/diskonnekted/pawon-pondokrejo.git
    cd pawon-pondokrejo
    ```

2.  **Instal Dependensi**:
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment**:
    Buat file `.env.local` dan isi dengan kredensial Sanity Anda:
    ```env
    NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
    NEXT_PUBLIC_SANITY_DATASET="production"
    SANITY_API_WRITE_TOKEN="your_write_token"
    ```

4.  **Jalankan Mode Pengembangan**:
    ```bash
    npm run dev
    ```
    Buka `http://localhost:3000` di browser Anda.

## 🌐 Panduan Deployment (CloudPanel)

Jika Anda menggunakan **Ubuntu** dengan **CloudPanel**:

1.  **Buat Reverse Proxy Site** di CloudPanel yang diarahkan ke port internal (misal: `http://127.0.0.1:8080`).
2.  **Build Aplikasi** di server:
    ```bash
    npm run build
    ```
3.  **Jalankan menggunakan PM2**:
    ```bash
    PORT=8080 pm2 start npm --name "pawon-app" -- start
    ```
4.  **Aktifkan SSL** melalui menu SSL di CloudPanel menggunakan Let's Encrypt.

## 🤝 Kontribusi

Aplikasi ini dikembangkan untuk kemajuan warga Kalurahan Pondokrejo. Saran dan masukan sangat kami harapkan untuk pengembangan fitur ke depannya.

---
**PAWON** - *Membangun Desa dari Tetangga.*
© 2026 Pemerintah Kalurahan Pondokrejo.
