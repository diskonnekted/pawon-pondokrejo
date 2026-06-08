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
      price, "vendor": vendor->{_id}
    }`, { serviceId: data.serviceId })

    if (!service) {
      return { success: false, error: 'Layanan jasa tidak ditemukan.' }
    }

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
        _ref: data.customerId.replace('drafts.', ''),
        _weak: true,
      },
      serviceItem: {
        _type: 'reference',
        _ref: data.serviceId.replace('drafts.', ''),
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

    return { success: true, orderId: result._id, orderNumber }
  } catch (error: any) {
    console.error('Create service order failed:', error)
    return { success: false, error: error.message || 'Gagal memproses pesanan jasa.' }
  }
}
