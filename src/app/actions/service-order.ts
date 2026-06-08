'use server'

import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function createServiceOrder(data: {
  customerName: string,
  customerPhone: string,
  deliveryAddress: string,
  serviceId: string,
  serviceDate: string,
  customerId: string,
}) {
  try {
    // Cari layanan untuk mendapatkan vendor
    const service = await writeClient.fetch(`*[_type == "service" && _id == $serviceId][0]{
      name, price, "vendor": vendor->{_id, name, phone}
    }`, { serviceId: data.serviceId })

    if (!service) {
      return { success: false, error: 'Layanan jasa tidak ditemukan.' }
    }

    const publishDraft = async (id: string) => {
      if (id.startsWith('drafts.')) {
        const draft = await writeClient.fetch(`*[_id == $id][0]`, { id })
        if (draft) {
          const publishedId = id.replace('drafts.', '')
          const publishedDoc = { ...draft, _id: publishedId }
          await writeClient.createOrReplace(publishedDoc)
          await writeClient.delete(id)
          return publishedId
        }
      }
      return id.replace('drafts.', '')
    }

    const finalCustomerId = await publishDraft(data.customerId)
    const finalServiceId = await publishDraft(data.serviceId)

    const orderNumber = `SVC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

    const doc = {
      _type: 'order',
      orderNumber,
      orderCategory: 'service',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliveryAddress,
      customer: {
        _type: 'reference',
        _ref: finalCustomerId,
        _weak: true,
      },
      serviceItem: {
        _type: 'reference',
        _ref: finalServiceId,
        _weak: true,
      },
      serviceDate: data.serviceDate,
      totalAmount: service.price, // Harga acuan awal (bisa nego nanti)
      paymentMethod: 'cod', // Jasa biasanya dibayar di tempat setelah selesai
      paymentStatus: 'unpaid',
      status: 'pending', // Menunggu penjual menyanggupi
      // Simpan referensi ke vendor agar mudah dicari di dasbor vendor
      vendorId_for_query_only: service.vendor?._id // Catatan: ini tidak ada di schema secara default, tapi Sanity tetap menyimpan jika dikirim
    }

    const result = await writeClient.create(doc)

    // --- INTEGRASI FONNTE WHATSAPP ---
    if (result._id) {
      try {
        const { formatServiceOrderMessage, sendWhatsAppNotification } = await import('@/sanity/lib/whatsapp')
        const { APP_SETTINGS_QUERY } = await import('@/sanity/lib/queries')
        
        const settings = await writeClient.fetch(APP_SETTINGS_QUERY)
        const adminPhone = settings?.adminPhone || '081328128315'
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon-Pondokrejo.vercel.app'
        
        const waMessage = formatServiceOrderMessage(
          orderNumber,
          data.customerName,
          data.customerPhone,
          data.deliveryAddress,
          service.name,
          data.serviceDate,
          service.price
        )

        // Kirim ke Admin
        const adminMsg = `${waMessage}\n\n✅ Konfirmasi (Sanggup): ${baseUrl}/order/${orderNumber}/action?role=admin&status=accepted&label=Sanggup+Mengerjakan\n❌ Batal/Tolak: ${baseUrl}/order/${orderNumber}/action?role=admin&status=cancelled&label=Tolak+Pesanan`
        await sendWhatsAppNotification(adminPhone, adminMsg)

        // Kirim ke Penjual Jasa (Vendor)
        if (service.vendor?.phone) {
          const sellerMsg = `🔔 *PESANAN JASA BARU* 🔔\n\nHalo *${service.vendor.name}*,\nAda pemesanan jasa yang masuk untuk Anda:\n\n👤 *Pemesan:* ${data.customerName}\n📞 *No. WA:* ${data.customerPhone}\n📍 *Lokasi:* ${data.deliveryAddress}\n🗓️ *Jadwal:* ${new Date(data.serviceDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}\n💼 *Jasa:* ${service.name}\n\n*Admin Desa akan segera menghubungi Anda untuk memastikan kesanggupan.* Anda juga bisa berkoordinasi langsung dengan pemesan melalui nomor WA di atas.`
          await sendWhatsAppNotification(service.vendor.phone, sellerMsg)
        }

        // Kirim ke Pembeli
        await sendWhatsAppNotification(
          data.customerPhone, 
          `Halo *${data.customerName}*,\n\nTerima kasih, pemesanan jasa *${service.name}* Anda telah kami terima dengan ID *${orderNumber}*.\n\nAdmin Desa dan Penjual Jasa sedang mengecek jadwal dan akan segera menghubungi Anda untuk konfirmasi pelaksanaan.`
        )
      } catch (err) {
        console.error('Failed to send WA notification for service:', err)
      }
    }

    return { success: true, orderId: result._id, orderNumber }
  } catch (error: any) {
    console.error('Create service order failed:', error)
    return { success: false, error: error.message || 'Gagal memproses pesanan jasa.' }
  }
}
