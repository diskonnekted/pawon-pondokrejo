'use server'

import { createClient } from 'next-sanity'
import { OrderFormData } from '@/types'
import { CartItem } from '@/context/CartContext'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function createOrder(formData: OrderFormData, items: CartItem[], totalPrice: number) {
  try {
    const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const doc = {
      _type: 'order',
      orderNumber,
      customerName: formData.name,
      customerPhone: formData.phone,
      deliveryAddress: formData.address,
      totalAmount: totalPrice,
      status: 'pending',
      items: items.map((item) => ({
        _key: Math.random().toString(36).substr(2, 9),
        product: {
          _type: 'reference',
          _ref: item._id,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    }

    const result = await writeClient.create(doc)
    return { success: true, orderId: result._id, orderNumber }
  } catch (error) {
    console.error('Order creation failed:', error)
    return { success: false, error: 'Gagal membuat pesanan.' }
  }
}
