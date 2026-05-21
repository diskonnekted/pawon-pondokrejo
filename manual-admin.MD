# 📖 Panduan Operasional Admin PAWON
**Pasar Online Warga Pondokrejo**

Dokumen ini berisi panduan bagi Admin Kalurahan untuk mengelola data operasional, mulai dari pengaturan nomor WhatsApp, pengelolaan Penjual (UMKM), hingga penugasan Kurir.

---

## 🛠 1. Mengakses Dashboard Admin
1.  Buka browser dan masuk ke URL: `https://pawon.pondokrejo.id/studio` (atau `http://localhost:3000/studio` saat pengembangan).
2.  Login menggunakan akun Sanity Admin yang sudah terdaftar.

---

## ⚙️ 2. Pengaturan Global (Nomor Admin & Ongkir)
Gunakan menu ini untuk menentukan siapa yang menerima laporan pusat setiap ada pesanan masuk.

1.  Pilih menu **"Pengaturan Aplikasi"** di sisi kiri.
2.  Klik pada dokumen **"Konfigurasi Global PAWON"**.
3.  Isi field berikut:
    *   **Nomor WhatsApp Admin Pusat**: Masukkan nomor WA Admin utama (Contoh: `081328128315`). Gunakan format angka saja.
    *   **Biaya Ongkir Flat**: Masukkan biaya kirim standar di lingkungan desa (Contoh: `5000`).
4.  Klik tombol **Publish** di pojok kanan bawah.

---

## 🏪 3. Mengelola Penjual (UMKM)
Agar penjual bisa menerima notifikasi pesanan dan login ke portal mandiri, Admin harus mendaftarkannya terlebih dahulu.

### Menambah Penjual Baru:
1.  Pilih menu **"Penjual (UMKM)"**.
2.  Klik ikon **Plus (+)** atau **Create New**.
3.  Isi Data Penjual:
    *   **Nama**: Nama Toko atau Nama Pemilik.
    *   **Nomor WhatsApp**: Masukkan nomor WA aktif penjual. Nomor ini akan menerima notifikasi setiap ada pesanan masuk untuk produk mereka.
    *   **PIN Akses Portal**: Masukkan 4-6 digit angka rahasia (Contoh: `1234`). Berikan PIN ini kepada penjual agar mereka bisa login ke `/lapak`.
    *   **Status Verifikasi**: Nyalakan (hijau) agar toko muncul di website.
    *   **Status Toko Buka**: Pastikan dalam kondisi Nyala agar produk bisa dibeli.

---

## 🚚 4. Mengelola Kurir
Kurir adalah pihak yang akan mengantar barang dan menagih pembayaran COD kepada warga.

### Menambah Kurir Baru:
1.  Pilih menu **"Kurir"**.
2.  Klik ikon **Plus (+)** atau **Create New**.
3.  Isi Data Kurir:
    *   **Nama Kurir**: Nama lengkap petugas pengantar.
    *   **Nomor WhatsApp**: Masukkan nomor WA aktif kurir. Nomor ini akan menerima rincian alamat pengiriman dan tagihan COD setiap ada pesanan baru.
    *   **Wilayah Tugas**: (Opsional) Catatan wilayah operasionalnya.
4.  Klik **Publish**.

---

## 📦 5. Alur Notifikasi & Update Status
Sistem PAWON bekerja secara otomatis dengan alur sebagai berikut:

1.  **Pesanan Masuk**: Admin Pusat, Penjual, dan Kurir menerima WhatsApp otomatis berisi rincian pesanan.
2.  **Update Status (Magic Links)**:
    *   Di bagian bawah pesan WhatsApp Penjual & Kurir, terdapat **Link Biru**.
    *   **Penjual** harus mengklik link tersebut saat barang diserahkan ke kurir.
    *   **Kurir** harus mengklik link tersebut saat mulai mengirim dan saat barang sudah sampai di tangan warga.
3.  **Pantauan Real-time**: Admin akan menerima laporan otomatis setiap kali Penjual atau Kurir mengklik link update tersebut.

---

## 💡 Tips Penting
*   **Format Nomor WA**: Pastikan nomor yang dimasukkan diawali dengan `08` atau `62`. Jangan menggunakan spasi atau tanda hubung.
*   **Keamanan PIN**: Jangan memberikan PIN penjual A kepada penjual B. PIN ini bersifat pribadi untuk akses ke dashboard manajemen lapak mereka.
*   **Toko Tutup**: Jika ada penjual yang melapor sedang libur, Admin bisa membantu mematikan status **"Status Toko Buka"** melalui dashboard ini agar tidak ada pesanan masuk yang terbengkalai.

---
*Dibuat untuk Pemerintah Kalurahan Pondokrejo.*
*Update terakhir: Mei 2026*
