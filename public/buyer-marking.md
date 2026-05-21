Berikut adalah implementasi lengkap fitur **Location Marker untuk Pembeli** pada aplikasi PAWON dengan dua metode: **Manual Marking** dan **Automatic Marking**, menggunakan **OpenStreetMap + Leaflet.js** (tanpa Google Maps), disesuaikan dengan stack Next.js + Tailwind + Sanity CMS, dan tema warna merah-hitam-putih.

---

## 🗂️ 1. Update Schema Sanity CMS

Tambahkan field lokasi pembeli pada schema `order`:

```javascript
// schemas/order.js (tambahkan di fields array)
{
  name: 'buyerLocation',
  title: 'Lokasi Pembeli',
  type: 'object',
  fields: [
    { name: 'lat', title: 'Latitude', type: 'number' },
    { name: 'lng', title: 'Longitude', type: 'number' },
    { 
      name: 'method', 
      title: 'Metode Penandaan', 
      type: 'string', 
      options: { list: ['automatic', 'manual'] } 
    },
    { name: 'address', title: 'Alamat Lengkap', type: 'text' },
    { name: 'markedAt', title: 'Waktu Penandaan', type: 'datetime' }
  ]
}
```

---

## 🧩 2. Komponen React: LocationMarker.jsx

```jsx
// components/checkout/LocationMarker.jsx
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon Leaflet di Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon merah-hitam sesuai tema PAWON
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
      <path fill="#DC2626" d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z"/>
      <circle fill="#fff" cx="12" cy="12" r="5"/>
      <circle fill="#000" cx="12" cy="12" r="3"/>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

// Komponen untuk update view saat marker dipindah
function LocationWatcher({ position, onMove }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
  }, [position, map]);
  return null;
}

export default function LocationMarker({ onLocationSelect, initialPosition = null }) {
  const [position, setPosition] = useState(initialPosition || { lat: -7.7956, lng: 110.3695 }); // Default: Pondokrejo
  const [method, setMethod] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reverse geocoding sederhana via Nominatim (gratis)
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'PAWON-App/1.0' } }
      );
      const data = await res.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  // Metode 1: Automatic Marking (Geolocation API)
  const handleAutoLocate = async () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung browser ini.');
      setLoading(false);
      return;
    }

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      const newPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      
      setPosition(newPos);
      setMethod('automatic');
      const addr = await fetchAddress(newPos.lat, newPos.lng);
      setAddress(addr);
      onLocationSelect?.({ ...newPos, method: 'automatic', address: addr });
      
    } catch (err) {
      setError(err.message || 'Gagal mendapatkan lokasi otomatis.');
    } finally {
      setLoading(false);
    }
  };

  // Metode 2: Manual Marking (klik peta)
  const handleMapClick = async (e) => {
    const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
    setPosition(newPos);
    setMethod('manual');
    const addr = await fetchAddress(newPos.lat, newPos.lng);
    setAddress(addr);
    onLocationSelect?.({ ...newPos, method: 'manual', address: addr });
  };

  // Handler saat marker di-drag
  const handleMarkerDrag = async (e) => {
    const newPos = { lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng };
    setPosition(newPos);
    setMethod('manual');
    const addr = await fetchAddress(newPos.lat, newPos.lng);
    setAddress(addr);
    onLocationSelect?.({ ...newPos, method: 'manual', address: addr });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAutoLocate}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-spin">🔄</span>
          ) : (
            '📍 Gunakan Lokasi Saya'
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {
            setPosition({ lat: -7.7956, lng: 110.3695 });
            setMethod('manual');
            setAddress('Area Pondokrejo (Default)');
          }}
          className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition"
        >
          🎯 Reset ke Pusat Pondokrejo
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Map Container */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden h-80 md:h-96">
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={true}
          className="h-full w-full"
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={position} 
            icon={customIcon}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDrag }}
          >
            <Popup>
              <strong>Lokasi Anda</strong><br/>
              {address || 'Klik peta untuk menandai lokasi'}<br/>
              <small className="text-gray-500">
                Metode: {method || '-'} | Drag marker untuk menyesuaikan
              </small>
            </Popup>
          </Marker>
          <LocationWatcher position={position} />
        </MapContainer>
      </div>

      {/* Info Panel */}
      {position && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-black">Koordinat:</span>{' '}
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
          {address && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium text-black">Alamat Perkiraan:</span><br/>
              {address}
            </p>
          )}
          {method && (
            <p className="text-xs text-gray-500 mt-2">
              🏷️ Ditandai secara <strong>{method === 'automatic' ? 'otomatis (GPS)' : 'manual (klik peta)'}</strong>
            </p>
          )}
        </div>
      )}

      {/* Hidden input untuk form submission */}
      <input type="hidden" name="location_lat" value={position?.lat || ''} />
      <input type="hidden" name="location_lng" value={position?.lng || ''} />
      <input type="hidden" name="location_method" value={method || ''} />
      <input type="hidden" name="location_address" value={address || ''} />
    </div>
  );
}
```

---

## 🔌 3. Integrasi di Halaman Checkout

```jsx
// app/checkout/page.jsx (atau pages/checkout.jsx)
'use client';

import { useState } from 'react';
import LocationMarker from '@/components/checkout/LocationMarker';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    location: null // { lat, lng, method, address }
  });

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData,
      // Opsional: auto-fill alamat jika kosong
      address: prev.address || locationData.address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.location) {
      alert('Harap tandai lokasi Anda pada peta terlebih dahulu.');
      return;
    }

    // Kirim ke API
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        buyerLocation: formData.location
      })
    });

    if (response.ok) {
      // Redirect ke halaman sukses + kirim notifikasi WA via Fonnte
      window.location.href = '/checkout/success';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      {/* ... field nama, phone, address ... */}
      
      <fieldset className="space-y-3">
        <legend className="text-lg font-bold text-red-600 border-b-2 border-red-600 pb-2">
          📍 Tanda Lokasi Pengiriman
        </legend>
        <p className="text-sm text-gray-600">
          Pilih metode penandaan lokasi untuk memudahkan kurir menemukan alamat Anda.
        </p>
        <LocationMarker onLocationSelect={handleLocationSelect} />
      </fieldset>

      <button
        type="submit"
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg"
      >
        ✅ Konfirmasi Pesanan & Kirim ke WhatsApp
      </button>
    </form>
  );
}
```

---

## 🌐 4. API Endpoint untuk Menyimpan Lokasi

```javascript
// app/api/orders/route.js (Next.js App Router)
import { createClient } from '@sanity/client';
import { sendWhatsApp } from '@/lib/fonnte';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { buyerLocation, ...orderData } = body;

    // Buat dokumen pesanan di Sanity
    const order = await client.create({
      _type: 'order',
      ...orderData,
      buyerLocation: buyerLocation ? {
        _type: 'buyerLocation',
        ...buyerLocation,
        markedAt: new Date().toISOString()
      } : null,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Kirim notifikasi ke Admin & Kurir via Fonnte
    await sendWhatsApp({
      target: process.env.ADMIN_PHONE,
      message: `🛒 Pesanan Baru #${order._id.slice(-6)}\n📍 Lokasi: ${buyerLocation?.address || 'Belum ditandai'}\n🗺️ Koordinat: ${buyerLocation?.lat}, ${buyerLocation?.lng}\n🔗 Detail: https://pawon.pondokrejo.id/studio/orders/${order._id}`
    });

    return Response.json({ success: true, orderId: order._id });
  } catch (error) {
    console.error('Order error:', error);
    return Response.json({ error: 'Gagal memproses pesanan' }, { status: 500 });
  }
}
```

---

## 🎨 5. Styling Tambahan (Tailwind + Tema PAWON)

Tambahkan di `globals.css` untuk konsistensi tema:

```css
/* Custom Leaflet controls agar sesuai tema merah-hitam */
.leaflet-control-zoom a {
  @apply bg-white text-black border-gray-300 hover:bg-gray-100;
}
.leaflet-control-attribution {
  @apply bg-white/90 text-gray-600;
}
.leaflet-popup-content-wrapper {
  @apply rounded-lg border-2 border-red-600;
}
.leaflet-popup-tip {
  @apply bg-red-600;
}
```

---

## ✅ Checklist Implementasi

```markdown
### Persiapan
- [ ] Install dependency: `npm install leaflet react-leaflet`
- [ ] Tambahkan schema `buyerLocation` di Sanity
- [ ] Deploy schema: `sanity schema extract` + `sanity deploy`

### Komponen
- [ ] Buat `LocationMarker.jsx` dengan fitur auto + manual
- [ ] Integrasi di halaman checkout
- [ ] Tambahkan validasi: lokasi wajib diisi sebelum submit

### Backend
- [ ] Update endpoint `/api/orders` untuk simpan koordinat
- [ ] Tambahkan koordinat ke notifikasi WhatsApp Fonnte
- [ ] Simpan riwayat lokasi untuk referensi kurir

### Testing
- [ ] Test geolocation di Chrome/Firefox mobile
- [ ] Test manual marking + drag marker
- [ ] Verifikasi data tersimpan di Sanity Dashboard
- [ ] Cek notifikasi WA berisi link peta OpenStreetMap
```

---

## 💡 Tips Tambahan untuk Area Pondokrejo

1. **Default View**: Set center peta ke `[-7.7956, 110.3695]` (pusat Pondokrejo) agar user tidak perlu zoom jauh.
2. **Offline Fallback**: Jika geolocation gagal, tampilkan pesan:  
   *"GPS tidak tersedia? Silakan klik pada peta di sekitar rumah Anda."*
3. **Link Peta Eksternal**: Di notifikasi WA, tambahkan link langsung ke OSM:  
   `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`
4. **Privasi**: Tambahkan disclaimer kecil:  
   *"Lokasi hanya digunakan untuk pengantaran dan tidak disimpan permanen setelah pesanan selesai."*

---

buatkan juga:
1. 🗺️ Komponen `TrackingMap` untuk halaman lacak pesanan (tampilan kurir bergerak)?
2. 🔔 Integrasi notifikasi real-time via Fonnte saat kurir mendekati lokasi?
3. 🎨 Versi custom marker dengan logo PAWON (SVG)?

