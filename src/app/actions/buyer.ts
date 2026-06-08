'use server'

import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function loginBuyer(phone: string, pin: string) {
  try {
    // Cari customer berdasarkan phone
    const customerQuery = `*[_type == "customer" && phone == $phone][0]{ _id, name, phone, pin }`
    let customer = await writeClient.fetch(customerQuery, { phone })

    // Jika customer belum ada di tabel customer (karena order pertama pakai data manual di order),
    // kita cek apakah ada order dengan nomor hp ini
    if (!customer) {
      const orderQuery = `*[_type == "order" && customerPhone == $phone][0]{ customerName, customerPhone }`
      const order = await writeClient.fetch(orderQuery, { phone })
      
      if (!order) {
        return { success: false, error: 'Nomor WhatsApp tidak ditemukan dalam riwayat pesanan manapun.' }
      }

      // Buat data customer baru jika belum ada
      const newCustomer = {
        _type: 'customer',
        name: order.customerName,
        phone: order.customerPhone,
        address: '-', // default
        pin: '123456', // default PIN
      }
      customer = await writeClient.create(newCustomer)
    }

    const currentPin = customer.pin || '123456'
    
    if (currentPin !== pin) {
      return { success: false, error: 'PIN yang Anda masukkan salah.' }
    }

    return { 
      success: true, 
      data: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone
      }
    }
  } catch (error) {
    console.error('Login buyer failed:', error)
    return { success: false, error: 'Gagal melakukan login. Terjadi kesalahan server.' }
  }
}

export async function getBuyerOrders(phone: string) {
  try {
    const query = `*[_type == "order" && customerPhone == $phone] | order(_createdAt desc) {
      _id,
      orderNumber,
      _createdAt,
      totalAmount,
      status,
      paymentMethod,
      paymentStatus,
      items[]{
        quantity,
        product->{name}
      }
    }`
    const orders = await writeClient.fetch(query, { phone })
    return { success: true, data: orders }
  } catch (error) {
    console.error('Fetch buyer orders failed:', error)
    return { success: false, error: 'Gagal mengambil riwayat pesanan.' }
  }
}

export async function changeBuyerPin(phone: string, oldPin: string, newPin: string) {
  try {
    const customerQuery = `*[_type == "customer" && phone == $phone][0]{ _id, pin }`
    const customer = await writeClient.fetch(customerQuery, { phone })

    if (!customer) {
      return { success: false, error: 'Data pelanggan tidak ditemukan.' }
    }

    const currentPin = customer.pin || '123456'
    if (currentPin !== oldPin) {
      return { success: false, error: 'PIN lama salah.' }
    }

    await writeClient
      .patch(customer._id)
      .set({ pin: newPin })
      .commit()

    return { success: true }
  } catch (error) {
    console.error('Change PIN failed:', error)
    return { success: false, error: 'Gagal mengubah PIN.' }
  }
}
