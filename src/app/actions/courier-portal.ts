'use server'

import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

/**
 * Mencari kurir berdasarkan nomor WhatsApp dan PIN untuk keperluan login portal.
 */
export async function getCourierByPhone(phone: string, pin: string) {
  try {
    const query = `*[_type == "courier" && phone == $phone][0]{
      _id,
      name,
      phone,
      pin,
      isActive,
      statusMessage
    }`
    const courier = await writeClient.fetch(query, { phone })
    
    if (!courier) {
      return { success: false, error: 'Nomor WhatsApp tidak terdaftar sebagai kurir.' }
    }

    if (courier.pin !== pin) {
      return { success: false, error: 'PIN yang Anda masukkan salah.' }
    }

    delete courier.pin
    return { success: true, data: courier }
  } catch (error) {
    console.error('Fetch courier failed:', error)
    return { success: false, error: 'Terjadi kesalahan sistem.' }
  }
}

/**
 * Update status operasional kurir
 */
export async function updateCourierStatus(courierId: string, data: { isActive: boolean, statusMessage?: string }) {
  try {
    await writeClient
      .patch(courierId)
      .set({
        isActive: data.isActive,
        statusMessage: data.statusMessage || ''
      })
      .commit()

    return { success: true }
  } catch (error) {
    console.error('Update courier failed:', error)
    return { success: false, error: 'Gagal memperbarui status kurir.' }
  }
}

/**
 * Mengambil daftar pesanan yang ditugaskan ke kurir ini
 */
export async function getCourierOrders(courierId: string) {
  try {
    const query = `*[_type == "order" && courier._ref == $courierId && status != "completed" && status != "cancelled"] | order(_createdAt desc) {
      _id,
      orderNumber,
      customerName,
      customerPhone,
      deliveryAddress,
      totalAmount,
      status,
      _createdAt
    }`
    const orders = await writeClient.fetch(query, { courierId })
    return { success: true, data: orders }
  } catch (error) {
    console.error('Fetch courier orders failed:', error)
    return { success: false, error: 'Gagal memuat tugas pengantaran.' }
  }
}
