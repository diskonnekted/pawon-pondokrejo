Untuk menerapkan fitur **tracking kurir pada aplikasi PAWON tanpa Google Maps**, berikut adalah komponen teknis dan arsitektur yang Anda butuhkan, disesuaikan dengan stack teknologi Anda (Next.js, Sanity CMS, Fonnte API):

---

## 🗺️ 1. Alternatif Peta (Pengganti Google Maps)

| Opsi | Kelebihan | Kekurangan | Rekomendasi |
|------|-----------|------------|-------------|
| **OpenStreetMap + Leaflet.js** | Gratis, open-source, ringan, mudah diintegrasikan dengan React | Tidak ada routing otomatis bawaan (perlu plugin) | ✅ **Paling direkomendasikan** |
| **Mapbox GL JS (Free Tier)** | UI modern, performa smooth, ada routing | Free tier terbatas (50k load/bulan), perlu API key | Opsi premium jika butuh fitur advanced |
| **Static Map Image (OSM Static API)** | Sangat ringan, tidak perlu JS berat | Tidak interaktif, hanya gambar | Cocok untuk notifikasi WhatsApp |
| **Custom SVG/Peta Kalurahan** | Full control, sangat ringan, offline-friendly | Harus buat manual, tidak scalable ke area lain | ✅ **Ideal untuk cakupan lokal Pondokrejo** |

### 💡 Rekomendasi Implementasi:
```bash
# Install library Leaflet untuk Next.js
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

```jsx
// components/TrackingMap.jsx (Contoh sederhana)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function TrackingMap({ courierLocation, destination }) {
  return (
    <MapContainer center={courierLocation} zoom={15} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker position={courierLocation}>
        <Popup>🚚 Kurir: {courierLocation.lat}, {courierLocation.lng}</Popup>
      </Marker>
      <Marker position={destination}>
        <Popup>🏠 Tujuan: {destination.lat}, {destination.lng}</Popup>
      </Marker>
    </MapContainer>
  );
}
```

---

## 📍 2. Mekanisme Pengambilan Lokasi Kurir

Karena tidak pakai Google Maps, Anda tetap butuh koordinat GPS dari perangkat kurir:

### Opsi A: Browser Geolocation API (Paling Simpel)
```javascript
// Fungsi ambil lokasi di portal kurir (/kurir)
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
```

### Opsi B: PWA + Background Geolocation (Lebih Advance)
- Gunakan `@capacitor/geolocation` jika aplikasi di-wrap sebagai PWA/native
- Kurir bisa update lokasi meski aplikasi di-background (perlu izin khusus)

### ⚠️ Persyaratan:
- Portal kurir harus diakses via **HTTPS** (wajib untuk Geolocation API)
- Kurir harus mengizinkan akses lokasi di browser HP
- Tambahkan fallback: jika GPS gagal, izinkan input manual ("Saya sudah di depan Rumah Warga X")

---

## 🗄️ 3. Struktur Data di Sanity CMS

Tambahkan schema untuk menyimpan riwayat lokasi kurir:

```javascript
// schemas/courierTracking.js
export default {
  name: 'courierTracking',
  title: 'Pelacakan Kurir',
  type: 'document',
  fields: [
    { name: 'order', title: 'Pesanan', type: 'reference', to: [{type: 'order'}] },
    { name: 'courier', title: 'Kurir', type: 'reference', to: [{type: 'courier'}] },
    { 
      name: 'locations', 
      title: 'Riwayat Lokasi', 
      type: 'array', 
      of: [{
        type: 'object',
        fields: [
          { name: 'lat', type: 'number' },
          { name: 'lng', type: 'number' },
          { name: 'timestamp', type: 'datetime' },
          { name: 'status', type: 'string', options: { list: ['diambil', 'dalam_perjalanan', 'tiba'] } }
        ]
      }]
    },
    { name: 'lastUpdate', title: 'Update Terakhir', type: 'datetime' }
  ]
}
```

---

## 🔄 4. Mekanisme Update Lokasi (Real-time vs Polling)

| Metode | Cara Kerja | Cocok Untuk |
|--------|-----------|-------------|
| **Polling via API** | Kurir kirim lokasi tiap 30-60 detik ke endpoint Next.js → simpan ke Sanity | ✅ **Rekomendasi awal** (sederhana, stabil) |
| **WebSocket (Socket.io)** | Koneksi persisten, update instan ke pembeli | Butuh server tambahan, lebih kompleks |
| **WhatsApp Periodic Update** | Server kirim notifikasi via Fonnte tiap status berubah | ✅ **Pelengkap** untuk warga yang tidak buka web |

### Contoh Endpoint API (Next.js API Route):
```javascript
// pages/api/courier/update-location.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { orderId, courierId, lat, lng, status } = req.body;
  
  // Simpan ke Sanity
  await client.patch(orderId)
    .setIfMissing({ courierTracking: [] })
    .append('courierTracking', [{
      _key: crypto.randomUUID(),
      lat, lng, 
      timestamp: new Date().toISOString(),
      status
    }])
    .set({ lastUpdate: new Date().toISOString() })
    .commit();
    
  // Opsional: Kirim notifikasi WA ke pembeli via Fonnte
  if (status === 'tiba') {
    await sendWhatsAppNotification(courierId, orderId, 'Kurir telah tiba di lokasi Anda!');
  }
  
  res.status(200).json({ success: true });
}
```

---

## 🖥️ 5. Tampilan Tracking untuk Pembeli

### Opsi 1: Halaman Web Interaktif (Leaflet)
- Pembeli buka `pawon.pondokrejo.id/track/[orderId]`
- Lihat peta dengan marker kurir (update tiap 30 detik via polling)

### Opsi 2: Timeline Status + Link Peta Eksternal
```text
📦 Status Pesanan #PAWON-123
✅ Pesanan Diterima (10:00)
✅ Barang Disiapkan (10:15) 
🚚 Kurir Mengambil Barang (10:30)
📍 Dalam Perjalanan - [Lihat di OpenStreetMap](https://www.openstreetmap.org/?mlat=-7.8&mlon=110.4#map=15/-7.8/110.4)
⏳ Menunggu Diterima
```

### Opsi 3: Notifikasi WhatsApp Bertahap (Via Fonnte)
```text
🚚 Update Pesanan #PAWON-123
Kurir Bapak Slamet sedang dalam perjalanan ke alamat Anda.
Perkiraan tiba: 15-20 menit.

📍 Pantau posisi: https://pawon.pondokrejo.id/track/PAWON-123
```

---

## 🔐 6. Pertimbangan Keamanan & Privasi

1. **Izin Lokasi**: Wajib minta izin eksplisit ke kurir sebelum ambil GPS
2. **Data Minimalis**: Hanya simpan koordinat saat status berubah, bukan rekaman kontinu
3. **Retensi Data**: Hapus riwayat lokasi setelah 7-30 hari (kecuali untuk dispute)
4. **Akses Terbatas**: Hanya pembeli yang terkait + admin yang bisa lihat tracking
5. **Fallback Manual**: Sediakan opsi "Konfirmasi Tiba" manual jika GPS gagal

---

## 📦 Checklist Implementasi (Prioritas)

```markdown
### Fase 1: MVP (2-3 hari)
- [ ] Integrasi Leaflet.js di Next.js
- [ ] Endpoint API untuk update lokasi kurir
- [ ] Schema Sanity untuk courierTracking
- [ ] Halaman tracking sederhana (peta + marker)
- [ ] Notifikasi WA via Fonnte saat status berubah

### Fase 2: Enhancement (1 minggu)
- [ ] Polling otomatis lokasi kurir tiap 30 detik
- [ ] Timeline status visual di halaman tracking
- [ ] Fallback input lokasi manual
- [ ] Export riwayat lokasi untuk admin

### Fase 3: Optimasi (Opsional)
- [ ] PWA untuk portal kurir (bisa jalan offline)
- [ ] Kompresi koordinat untuk hemat bandwidth
- [ ] Custom SVG map khusus area Pondokrejo
```

---

## 💡 Tips Hemat Resource untuk Area Lokal

Karena cakupan PAWON hanya di **Kalurahan Pondokrejo**, Anda bisa:
1. **Gunakan koordinat tetap** untuk titik-titik penting (balai, pos kamling, landmark)
2. **Ganti peta interaktif dengan gambar statis** yang sudah ditandai zona
3. **Gunakan sistem "zona"**: Kurir hanya update saat pindah zona (RT/RW), bukan koordinat presisi
4. **Manfaatkan WhatsApp sebagai "peta sosial"**: Kurir kirim foto lokasi via WA yang otomatis terlampir di notifikasi

---

Jika Anda ingin, saya bisa bantu buatkan:
1. 🗂️ Schema Sanity lengkap untuk tracking
2. 🧩 Komponen React Leaflet yang siap pakai
3. 🔌 Endpoint API Next.js untuk handle update lokasi
4. 🎨 Desain halaman tracking dengan tema merah-hitam-putih sesuai preferensi Anda

Silakan pilih mana yang ingin diprioritaskan, Mas Windy! 🛠️