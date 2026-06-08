'use server'

import { createClient } from 'next-sanity'
import { OrderFormData } from '@/types'
import { CartItem } from '@/context/CartContext'
import { formatOrderMessage, sendWhatsAppNotification } from '@/sanity/lib/whatsapp'
import { APP_SETTINGS_QUERY } from '@/sanity/lib/queries'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function createOrder(formData: OrderFormData, items: CartItem[], totalAmount: number, shippingFee: number, customerId?: string) {
  try {
    // 0. Ambil Pengaturan Aplikasi (Nomor Admin, dll)
    const settings = await writeClient.fetch(APP_SETTINGS_QUERY)
    const adminPhone = settings?.adminPhone || '081328128315' // Fallback ke nomor awal jika belum diset

    // 1. Cek apakah ada vendor yang sedang tutup
    const productIds = items.map(i => i._id)
    const vendorsStatusQuery = `*[_type == "product" && _id in $productIds]{
      name,
      "vendor": vendor->{name, isOpen, closingMessage}
    }`
    const productsWithVendorStatus = await writeClient.fetch(vendorsStatusQuery, { productIds })

    for (const p of productsWithVendorStatus) {
      if (p.vendor?.isOpen === false) {
        return { 
          success: false, 
          error: `Gagal membuat pesanan. Toko "${p.vendor.name}" (${p.name}) sedang tutup: ${p.vendor.closingMessage || 'Maaf, kami sedang tidak menerima pesanan.'}` 
        }
      }
    }

    const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const doc: any = {
      _type: 'order',
      orderNumber,
      customerName: formData.name,
      customerPhone: formData.phone,
      deliveryAddress: formData.address,
      totalAmount,
      shippingFee,
      paymentMethod: formData.paymentMethod || 'cod',
      paymentStatus: 'unpaid',
      status: 'pending',
      items: items.map((item) => ({
        _key: Math.random().toString(36).substr(2, 9),
        product: {
          _type: 'reference',
          _ref: item._id.replace('drafts.', ''),
          _weak: true,
        },
        quantity: item.quantity,
        price: item.price,
      })),
    }

    if (customerId) {
      doc.customer = {
        _type: 'reference',
        _ref: customerId.replace('drafts.', ''),
        _weak: true,
      }
    }

    const result = await writeClient.create(doc)
    console.log('Order created in Sanity:', result._id)

    // --- INTEGRASI FONNTE WHATSAPP ---
    if (result._id) {
      console.log('Starting WhatsApp notifications...')
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon-Pondokrejo.vercel.app'
      const isQris = formData.paymentMethod === 'qris'
      
      const waMessage = formatOrderMessage(
        orderNumber,
        formData.name,
        formData.phone,
        formData.address,
        items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        totalAmount - shippingFee,
        shippingFee,
        totalAmount
      )

      // 1. Kirim ke Admin
      console.log('Sending to Admin:', adminPhone)
      if (isQris) {
        const adminQrisMsg = `${waMessage}\n\n*⚠️ PEMBAYARAN QRIS*\nPembeli menggunakan QRIS. Mohon cek mutasi rekening Anda sebesar *Rp${totalAmount.toLocaleString('id-ID')}*.\nJika dana sudah masuk, klik link ini untuk memproses pesanan:\n✅ Konfirmasi Pembayaran: ${baseUrl}/order/${orderNumber}/action?role=admin&status=paid&label=Konfirmasi+Pembayaran+QRIS`
        await sendWhatsAppNotification(adminPhone, adminQrisMsg)
      } else {
        const adminCodMsg = `${waMessage}\n\n*⚠️ PESANAN COD*\nPembeli menggunakan COD (Bayar di Tempat). Jika pesanan ini valid/bukan fiktif, klik link di bawah ini untuk memproses dan meneruskannya ke Penjual & Kurir:\n✅ Konfirmasi Pesanan COD: ${baseUrl}/order/${orderNumber}/action?role=admin&status=processing_cod&label=Konfirmasi+Pesanan+COD`
        await sendWhatsAppNotification(adminPhone, adminCodMsg)
      }

      // 2. Kirim ke Pembeli
      console.log('Sending to Buyer:', formData.phone)
      const buyerLinks = `\n\n*KONFIRMASI PENERIMAAN:*\n✅ Barang Diterima: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=completed&label=Barang+Sudah+Diterima\n❌ Barang Bermasalah: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=problem&label=Lapor+Barang+Bermasalah`
      
      if (isQris) {
        await sendWhatsAppNotification(formData.phone, `Halo *${formData.name}*,\n\nTerima kasih telah berbelanja di *PAWON Pondokrejo*. Pesanan Anda *${orderNumber}* telah kami terima.\n\nTotal: *Rp${totalAmount.toLocaleString('id-ID')}*\nMetode: *QRIS*\n\nAdmin Desa sedang memverifikasi pembayaran Anda. Kami akan segera memproses pesanan setelah pembayaran terkonfirmasi.`)
      } else {
        await sendWhatsAppNotification(formData.phone, `Halo *${formData.name}*,\n\nTerima kasih telah berbelanja di *PAWON Pondokrejo*. Pesanan Anda *${orderNumber}* telah kami terima dan sedang diproses.\n\nTotal: *Rp${totalAmount.toLocaleString('id-ID')}*\nMetode: *COD*${buyerLinks}\n\nAdmin atau Kurir kami akan segera menghubungi Anda.`)
      }

      // 3 & 4. Seller & Courier will be notified LATER when Admin confirms the order.
      // Removed immediate notifySellerAndCourier for COD.
    }

    return { success: true, orderId: result._id, orderNumber }
  } catch (error) {
    console.error('Order creation failed:', error)
    return { success: false, error: 'Gagal membuat pesanan.' }
  }
}

async function notifySellerAndCourier(orderNumber: string, customerName: string, deliveryAddress: string, items: {name: string, quantity: number}[], totalAmount: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon-Pondokrejo.vercel.app'
  
  // 3. Kirim ke Penjual
  console.log('Sending to Seller...')
  const sellerLinks = `\n\n*UPDATE STATUS PENJUAL:*\n📦 Serahkan ke Kurir: ${baseUrl}/order/${orderNumber}/action?role=seller&status=shipped&label=Serahkan+Barang+ke+Kurir\n✅ Selesai: ${baseUrl}/order/${orderNumber}/action?role=seller&status=completed&label=Transaksi+Selesai\n⚠️ Masalah: ${baseUrl}/order/${orderNumber}/action?role=seller&status=problem&label=Transaksi+Bermasalah`
  const sellerMessage = `🔔 *PESANAN BARU UNTUK SELLER* 🔔\n\nHalo Seller,\nAda pesanan masuk yang perlu disiapkan segera.\n\n👤 *Pemesan:* ${customerName}\n🆔 *No. Pesanan:* ${orderNumber}\n\n🛍️ *Item yang dipesan:* \n${items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}${sellerLinks}`
  await sendWhatsAppNotification('0895360396984', sellerMessage) // Todo: Fetch seller phones if applicable

  // 4. Kirim ke Kurir
  console.log('Sending to Courier...')
  const courierLinks = `\n\n*UPDATE STATUS KURIR:*\n👍 Terima Order: ${baseUrl}/order/${orderNumber}/action?role=courier&status=accepted&label=Terima+Tugas+Pengantaran\n📦 Ambil dari Seller: ${baseUrl}/order/${orderNumber}/action?role=courier&status=shipped&label=Ambil+Barang+dari+Seller\n🚚 Mulai Kirim: ${baseUrl}/order/${orderNumber}/action?role=courier&status=delivering&label=Mulai+Pengiriman\n🏁 Selesai (Diterima): ${baseUrl}/order/${orderNumber}/action?role=courier&status=completed&label=Pesanan+Diterima+Warga\n⚠️ Ada Masalah: ${baseUrl}/order/${orderNumber}/action?role=courier&status=problem&label=Lapor+Masalah+Pengiriman`
  const courierMessage = `🚚 *TUGAS PENGANTARAN BARU* 🚚\n\nHalo Kurir PAWON,\nAda tugas pengantaran baru.\n\n📍 *Alamat Tujuan:* ${deliveryAddress}\n👤 *Penerima:* ${customerName}\n🆔 *No. Pesanan:* ${orderNumber}\n💰 *Tagihan:* Rp${totalAmount.toLocaleString('id-ID')} (Cek apakah COD atau QRIS)${courierLinks}`
  await sendWhatsAppNotification('082223863537', courierMessage)
}

export async function updateOrderStatus(orderNumber: string, newStatus: string, note?: string) {
  try {
    const query = `*[_type == "order" && orderNumber == $orderNumber][0]{
      _id, customerName, customerPhone, deliveryAddress, totalAmount, paymentMethod, paymentStatus, status,
      items[]{ quantity, product->{name} }
    }`
    const order = await writeClient.fetch(query, { orderNumber })

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan.' }
    }

    // Jika Admin menekan tombol Confirm Paid QRIS
    if (newStatus === 'paid') {
      if (order.paymentStatus === 'paid') return { success: false, error: 'Pesanan ini sudah dibayar sebelumnya.' }
      
      await writeClient
        .patch(order._id)
        .set({ paymentStatus: 'paid', status: 'processing' })
        .commit()

      // Beri tahu pembeli bahwa pembayaran berhasil
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon-Pondokrejo.vercel.app'
      const buyerLinks = `\n\n*KONFIRMASI PENERIMAAN:*\n✅ Barang Diterima: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=completed&label=Barang+Sudah+Diterima\n❌ Barang Bermasalah: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=problem&label=Lapor+Barang+Bermasalah`
      await sendWhatsAppNotification(order.customerPhone, `Halo *${order.customerName}*,\n\nPembayaran QRIS Anda untuk pesanan *${orderNumber}* sudah diterima oleh Admin Desa.\n\nBarang pesanan Anda saat ini sedang disiapkan oleh Penjual dan akan segera dikirim oleh Kurir ke alamat Anda.${buyerLinks}`)

      // Lanjutkan notifikasi ke Seller & Courier
      await notifySellerAndCourier(
        orderNumber, 
        order.customerName, 
        order.deliveryAddress, 
        order.items.map((i: any) => ({ name: i.product?.name || 'Produk', quantity: i.quantity })), 
        order.totalAmount
      )

      return { success: true }
    }

    // Jika Admin menekan tombol Confirm COD
    if (newStatus === 'processing_cod') {
      if (order.status !== 'pending') return { success: false, error: 'Pesanan ini sudah diproses sebelumnya.' }
      
      await writeClient
        .patch(order._id)
        .set({ status: 'processing' })
        .commit()

      // Beri tahu pembeli bahwa pesanan diproses
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon-Pondokrejo.vercel.app'
      const buyerLinks = `\n\n*KONFIRMASI PENERIMAAN:*\n✅ Barang Diterima: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=completed&label=Barang+Sudah+Diterima\n❌ Barang Bermasalah: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=problem&label=Lapor+Barang+Bermasalah`
      await sendWhatsAppNotification(order.customerPhone, `Halo *${order.customerName}*,\n\nPesanan COD Anda (*${orderNumber}*) sudah dikonfirmasi oleh Admin Desa.\n\nBarang pesanan Anda saat ini sedang disiapkan oleh Penjual dan akan segera dikirim oleh Kurir ke alamat Anda.${buyerLinks}`)

      // Lanjutkan notifikasi ke Seller & Courier
      await notifySellerAndCourier(
        orderNumber, 
        order.customerName, 
        order.deliveryAddress, 
        order.items.map((i: any) => ({ name: i.product?.name || 'Produk', quantity: i.quantity })), 
        order.totalAmount
      )

      return { success: true }
    }

    // Default status update
    await writeClient
      .patch(order._id)
      .set({ status: newStatus })
      .commit()

    // Notifikasi ke Admin bahwa ada perubahan status
    const settings = await writeClient.fetch(APP_SETTINGS_QUERY)
    const adminPhone = settings?.adminPhone || '081328128315'

    const adminMsg = `🔄 *UPDATE STATUS PESANAN*\n------------------\n🆔 *No:* ${orderNumber}\n👤 *User:* ${order.customerName}\n📈 *Status Baru:* ${newStatus}\n📝 *Catatan:* ${note || '-'}\n------------------`
    await sendWhatsAppNotification(adminPhone, adminMsg)

    return { success: true }
  } catch (error) {
    console.error('Update status failed:', error)
    return { success: false, error: 'Gagal memperbarui status.' }
  }
}

