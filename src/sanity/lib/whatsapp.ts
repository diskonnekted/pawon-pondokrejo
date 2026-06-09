export function formatOrderMessage(
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  items: { name: string; quantity: number; price: number }[],
  totalPrice: number,
  shippingFee: number,
  grandTotal: number
): string {
  const itemLines = items
    .map((item, index) => `${index + 1}. *${item.name}*\n   Jumlah: ${item.quantity}\n   Harga: Rp${(item.price * item.quantity).toLocaleString('id-ID')}`)
    .join('\n\n')

  return `📦 *PESANAN BARU MASUK* 📦
----------------------------------
🆔 *No. Pesanan:* ${orderNumber}
👤 *Pemesan:* ${customerName}
📞 *No. WhatsApp:* ${customerPhone}
📍 *Alamat Kirim:* ${customerAddress}
----------------------------------

🛍️ *DAFTAR BELANJA:*
${itemLines}

----------------------------------
💰 *RINGKASAN PEMBAYARAN:*
Subtotal: Rp${totalPrice.toLocaleString('id-ID')}
Ongkir: Rp${shippingFee.toLocaleString('id-ID')}
*TOTAL BAYAR: Rp${grandTotal.toLocaleString('id-ID')}*

----------------------------------
📝 *Catatan:* Pembayaran dilakukan secara *COD (Bayar di Tempat)* saat barang diantar oleh kurir.

_Mohon segera diproses dan hubungi pemesan jika diperlukan. Terima kasih!_`
}

export function formatServiceOrderMessage(
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  serviceAddress: string,
  serviceName: string,
  serviceDate: string,
  price: number
): string {
  const dateStr = new Date(serviceDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
  return `🛠️ *PEMESANAN JASA BARU* 🛠️
----------------------------------
🆔 *No. Pesanan:* ${orderNumber}
👤 *Pemesan:* ${customerName}
📞 *No. WhatsApp:* ${customerPhone}
📍 *Alamat Pelaksanaan:* ${serviceAddress}
🗓️ *Jadwal:* ${dateStr}
----------------------------------

💼 *JASA YANG DIPESAN:*
*${serviceName}*
Estimasi Harga: Rp${price.toLocaleString('id-ID')}

_Mohon segera konfirmasi kesanggupan dan hubungi pemesan!_`
}

/**
 * Mengirim pesan WhatsApp menggunakan API Fonnte.
 */
export async function sendWhatsAppNotification(target: string, message: string) {
  const token = 'Mi2V1BEF2o8kkis8FfRF' // Gunakan token secara eksplisit sesuai permintaan

  if (!token) {
    console.warn('FONNTE_API_TOKEN tidak ditemukan di environment variables.')
    return { success: false, error: 'API Token tidak dikonfigurasi.' }
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
      }),
    })

    const data = await response.json()
    console.log(`Fonnte API Response (${target}):`, data)
    return { success: data.status, data }
  } catch (error) {
    console.error(`Fonnte API Error Detail (${target}):`, error)
    return { success: false, error: 'Gagal menghubungi server Fonnte.' }
  }
}
