'use server'

import { client } from '@/sanity/lib/client'

export async function fetchAllOrders() {
  try {
    const query = `*[_type == "order"] | order(_createdAt desc) {
      _id,
      orderNumber,
      _createdAt,
      customerName,
      customerPhone,
      deliveryAddress,
      totalAmount,
      shippingFee,
      paymentMethod,
      paymentStatus,
      status,
      items[]{
        quantity,
        price,
        product->{
          name,
          "vendorName": vendor->name
        }
      },
      courier->{
        name,
        phone
      }
    }`

    // Ensure we fetch the most recent data (no cache)
    const orders = await client.fetch(query, {}, { cache: 'no-store' })
    return { success: true, data: orders }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: 'Gagal memuat daftar pesanan.' }
  }
}

