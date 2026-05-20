# Panduan Penggunaan Marketplace Kalurahan Pondokrejo

Dokumen ini berisi panduan operasional untuk pengelola (Admin Desa), Penjual (UMKM), dan Pembeli di platform Marketplace Pondokrejo.

---

## 1. Peran Pengguna (Roles)

| Peran | Tanggung Jawab | Akses |
| :--- | :--- | :--- |
| **Admin Desa** | Mengelola data penjual, kurir, dan kategori produk. | Panel Admin (`/studio`) |
| **Penjual (UMKM)** | Mengupload produk dan memperbarui stok. | Panel Admin (`/studio`) |
| **Kurir Desa** | Memperbarui status pengiriman pesanan COD. | Panel Admin (`/studio`) |
| **Pembeli (Warga)** | Menjelajahi produk dan melakukan pemesanan. | Halaman Depan (Website) |
---

## 2. Panduan Admin & Penjual (Panel Admin)

Akses Panel Admin melalui alamat: `http://localhost:3000/studio`

### A. Pendaftaran Penjual Baru
Calon penjual dapat mendaftar melalui halaman website `/register-vendor`.
1.  **Verifikasi**: Admin Desa membuka menu **Penjual (UMKM)** -> **Perlu Verifikasi**.
2.  **Aktivasi**: Periksa data UMKM, jika sesuai, aktifkan toggle **Status Verifikasi** dan klik **Publish**.
3.  **Unggah Produk**: Setelah aktif, penjual dapat mulai menambahkan produk melalui menu **Produk**.

### B. Mengelola Produk
1.  Buka menu **Produk** di sidebar.
...

2.  Klik ikon tambah (+) untuk membuat produk baru.
3.  Isi data produk: Nama, Harga, Foto, Deskripsi, dan pilih Penjual (UMKM) yang bersangkutan.
4.  Klik **Publish** untuk menampilkan produk di website.

### B. Mengelola Pesanan Masuk (Alur COD)
Semua pesanan yang dibuat oleh warga akan muncul di menu **Pesanan Masuk**.
1.  **Filter Pesanan**: Gunakan tab "Perlu Konfirmasi" untuk melihat pesanan baru.
2.  **Proses Pesanan**: Ubah status pesanan dari `Menunggu Konfirmasi` menjadi `Diproses Penjual`.
3.  **Tugaskan Kurir**: Pilih nama kurir pada field "Kurir yang Bertugas" dan ubah status menjadi `Sedang Diantar Kurir`.
4.  **Selesaikan Transaksi**: Setelah kurir menerima uang tunai dari warga, ubah status menjadi `Selesai (COD)`.

---

## 3. Panduan Pembeli (Warga)

### A. Cara Berbelanja
1.  Buka halaman utama website.
2.  Gunakan kotak **Pencarian** untuk mencari produk tertentu atau jelajahi daftar produk.
3.  Klik produk untuk melihat detail, lalu klik **Tambah ke Keranjang**.
4.  Buka ikon **Keranjang Belanja** di pojok kanan atas.
5.  Klik **Lanjut Checkout**.

### B. Proses Checkout (COD)
1.  Isi formulir Nama, Nomor WhatsApp, dan Alamat Lengkap di wilayah Pondokrejo.
2.  Klik **Buat Pesanan Sekarang**.
3.  **PENTING**: Catat atau screenshot **Nomor Pesanan** (misal: `ORD-ABC123`) yang muncul di layar sukses.

### C. Melacak Pesanan
1.  Klik menu **Lacak Pesanan** di Navbar.
2.  Masukkan Nomor Pesanan Anda.
3.  Sistem akan menampilkan status terbaru (misal: "Sedang Diantar Kurir") beserta nama kurir yang bertugas.

---

## 4. Informasi Teknis (Untuk Developer)

### Menjalankan Aplikasi secara Lokal
```bash
# Instal dependensi (jika baru pertama kali)
npm install

# Jalankan mode pengembangan
npm run dev
```

### Konfigurasi Environment (`.env.local`)
Pastikan file `.env.local` berisi kunci berikut agar aplikasi terhubung ke database:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_WRITE_TOKEN` (Untuk mencatat pesanan)

### Skema Database (Sanity)
Skema didefinisikan dalam folder `src/sanity/schemaTypes/`:
- `productType.ts`: Struktur data produk.
- `orderType.ts`: Logika transaksi dan tracking.
- `vendorType.ts`: Data profil UMKM.
- `courierType.ts`: Data tim pengantar desa.

---

*Dibuat oleh Gemini CLI untuk Kalurahan Pondokrejo.*
