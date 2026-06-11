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

    const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Resolve items (publishing drafts if needed)
    const resolvedItems = await Promise.all(items.map(async (item) => ({
      _key: Math.random().toString(36).substr(2, 9),
      product: {
        _type: 'reference',
        _ref: await publishDraft(item._id),
      },
      quantity: item.quantity,
      price: item.price,
    })))

    const doc: any = {
      _type: 'order',
      orderCategory: 'product',
      orderNumber,
      customerName: formData.name,
      customerPhone: formData.phone,
      deliveryAddress: formData.address,
      totalAmount,
      shippingFee,
      paymentMethod: formData.paymentMethod || 'cod',
      paymentStatus: 'unpaid',
      status: 'pending',
      items: resolvedItems,
    }

    if (customerId) {
      doc.customer = {
        _type: 'reference',
        _ref: await publishDraft(customerId),
      }
    }

    const result = await writeClient.create(doc)
    console.log('Order created in Sanity:', result._id)

    // --- INTEGRASI FONNTE WHATSAPP ---
    if (result._id) {
      console.log('Starting WhatsApp notifications...')
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon.pondokrejo.id'
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
      
      const couriers = await writeClient.fetch(
        `*[_type == "courier"]{_id, name, phone, isActive, status}`,
        {},
        { cache: 'no-store' }
      )
      let courierSelectionCod = ''
      let courierSelectionQris = ''
      
      if (couriers && couriers.length > 0) {
        couriers.filter((c: any) => c.isActive || c.status === 'active').forEach((c: any) => {
          const safeName = encodeURIComponent(c.name)
          const safePhone = encodeURIComponent(c.phone || '')
          courierSelectionCod += `\n👤 Kirim tugas ke ${c.name}: ${baseUrl}/order/${orderNumber}/action?role=admin&status=processing_cod&courierId=${c._id}&courierPhone=${safePhone}&label=Kirim+Tugas+ke+${safeName}`
          courierSelectionQris += `\n👤 Konfirmasi & Kirim ke ${c.name}: ${baseUrl}/order/${orderNumber}/action?role=admin&status=paid&courierId=${c._id}&courierPhone=${safePhone}&label=Konfirmasi+dan+Kirim+ke+${safeName}`
        })
      } else {
        courierSelectionCod = `\n✅ Konfirmasi Pesanan COD: ${baseUrl}/order/${orderNumber}/action?role=admin&status=processing_cod&label=Konfirmasi+Pesanan+COD`
        courierSelectionQris = `\n✅ Konfirmasi Pembayaran: ${baseUrl}/order/${orderNumber}/action?role=admin&status=paid&label=Konfirmasi+Pembayaran+QRIS`
      }

      if (isQris) {
        const adminQrisMsg = `${waMessage}\n\n*⚠️ PEMBAYARAN QRIS*\nPembeli menggunakan QRIS. Mohon cek mutasi rekening Anda sebesar *Rp${totalAmount.toLocaleString('id-ID')}*.\nJika dana sudah masuk, klik link kurir di bawah ini untuk mengonfirmasi dan mengirimkan tugas:\n${courierSelectionQris}`
        await sendWhatsAppNotification(adminPhone, adminQrisMsg)
      } else {
        const adminCodMsg = `${waMessage}\n\n*⚠️ PESANAN COD*\nPembeli menggunakan COD (Bayar di Tempat). Jika pesanan ini valid, klik link kurir di bawah ini untuk memproses dan meneruskannya ke Penjual & Kurir:\n${courierSelectionCod}`
        await sendWhatsAppNotification(adminPhone, adminCodMsg)
      }

      // 2. Kirim ke Pembeli
      console.log('Sending to Buyer:', formData.phone)
      const buyerLinks = `\n\n*KONFIRMASI PENERIMAAN:*\n✅ Barang Diterima: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=completed&label=Barang+Sudah+Diterima\n❌ Barang Bermasalah: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=problem&label=Lapor+Barang+Bermasalah`
      
      const itemsList = items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')
      if (isQris) {
        await sendWhatsAppNotification(formData.phone, `Halo *${formData.name}*,\n\nTerima kasih telah berbelanja di *PAWON Pondokrejo*. Pesanan Anda *${orderNumber}* telah kami terima.\n\n🛍️ *Barang Pesanan:*\n${itemsList}\n\nTotal: *Rp${totalAmount.toLocaleString('id-ID')}*\nMetode: *QRIS*\n\nAdmin Desa sedang memverifikasi pembayaran Anda. Kami akan segera memproses pesanan setelah pembayaran terkonfirmasi.`)
      } else {
        await sendWhatsAppNotification(formData.phone, `Halo *${formData.name}*,\n\nTerima kasih telah berbelanja di *PAWON Pondokrejo*. Pesanan Anda *${orderNumber}* telah kami terima dan sedang diproses.\n\n🛍️ *Barang Pesanan:*\n${itemsList}\n\nTotal: *Rp${totalAmount.toLocaleString('id-ID')}*\nMetode: *COD*\n\nAdmin atau Kurir kami akan segera menghubungi Anda.`)
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

async function notifySellerAndCourier(orderNumber: string, customerName: string, deliveryAddress: string, items: {name: string, quantity: number, vendorName?: string}[], totalAmount: number, courierPhone: string = '6282241593592', sellerPhones: string[] = [], fallbackWarning: string = '', courierName: string = 'Kurir PAWON') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon.pondokrejo.id'
  
  // 3. Kirim ke Penjual
  console.log('Sending to Seller(s)...', sellerPhones)
  const sellerLinks = `\n\n*UPDATE STATUS PENJUAL:*\n📦 Serahkan ke Kurir: ${baseUrl}/order/${orderNumber}/action?role=seller&status=shipped&label=Serahkan+Barang+ke+Kurir\n⚠️ Ada Masalah: ${baseUrl}/order/${orderNumber}/action?role=seller&status=problem&label=Transaksi+Bermasalah`
  const sellerMessage = `🔔 *PESANAN BARU UNTUK SELLER* 🔔\n\nHalo Seller,\nAda pesanan masuk yang perlu disiapkan segera.\n\n👤 *Pemesan:* ${customerName}\n🆔 *No. Pesanan:* ${orderNumber}\n🛵 *Kurir Pengambil:* ${courierName}\n\n🛍️ *Item yang dipesan:* \n${items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}${sellerLinks}`
  
  if (sellerPhones.length > 0) {
    for (let phone of sellerPhones) {
      // Ensure phone starts with 62 for Fonnte
      let cleanPhone = phone.replace(/\D/g, '')
      if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1)
      await sendWhatsAppNotification(cleanPhone, sellerMessage)
    }
  } else {
    // Fallback if no vendor phone found
    await sendWhatsAppNotification('62895360396984', sellerMessage)
  }

  // 4. Kirim ke Kurir
  let cleanCourierPhone = courierPhone.replace(/\D/g, '')
  if (cleanCourierPhone.startsWith('0')) cleanCourierPhone = '62' + cleanCourierPhone.substring(1)
  console.log('Sending to Courier...', cleanCourierPhone)

  const courierLinks = `\n\n*UPDATE STATUS KURIR:*\n👍 Terima Order: ${baseUrl}/order/${orderNumber}/action?role=courier&status=accepted&label=Terima+Tugas+Pengantaran\n📦 Ambil dari Seller: ${baseUrl}/order/${orderNumber}/action?role=courier&status=shipped&label=Ambil+Barang+dari+Seller\n🚚 Mulai Kirim: ${baseUrl}/order/${orderNumber}/action?role=courier&status=delivering&label=Mulai+Pengiriman\n🏁 Barang Diserahkan: ${baseUrl}/order/${orderNumber}/action?role=courier&status=delivered&label=Barang+Telah+Diserahkan\n⚠️ Ada Masalah: ${baseUrl}/order/${orderNumber}/action?role=courier&status=problem&label=Lapor+Masalah+Pengiriman`
  const courierMessage = `🚚 *TUGAS PENGANTARAN BARU* 🚚${fallbackWarning}\n\nHalo Kurir PAWON,\nAda tugas pengantaran baru.\n\n📍 *Alamat Tujuan:* ${deliveryAddress}\n👤 *Penerima:* ${customerName}\n🆔 *No. Pesanan:* ${orderNumber}\n💰 *Tagihan:* Rp${totalAmount.toLocaleString('id-ID')} (Cek apakah COD atau QRIS)\n\n🛍️ *Barang yang Harus Diambil:*\n${items.map(i => `- ${i.name} (x${i.quantity}) dari *${i.vendorName || 'Penjual'}*`).join('\n')}${courierLinks}`
  await sendWhatsAppNotification(cleanCourierPhone, courierMessage)
}

export async function updateOrderStatus(orderNumber: string, newStatus: string, note?: string, courierId?: string, courierPhoneParam?: string) {
  try {
    const query = `*[_type == "order" && orderNumber == $orderNumber][0]{
      _id, customerName, customerPhone, deliveryAddress, totalAmount, paymentMethod, paymentStatus, status, courier->{phone, name},
      items[]{ quantity, product->{name, vendor->{phone, name}} }
    }`
    const order = await writeClient.fetch(query, { orderNumber })

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan.' }
    }

    // Jika Admin menekan tombol Confirm Paid QRIS
    if (newStatus === 'paid') {
      if (order.paymentStatus === 'paid') return { success: false, error: 'Pesanan ini sudah dibayar sebelumnya.' }
      
      let patch = writeClient.patch(order._id).set({ paymentStatus: 'paid', status: 'processing' })
      if (courierId) {
        patch = patch.set({ courier: { _type: 'reference', _ref: courierId } })
      }
      await patch.commit()



      // Dapatkan nomor kurir yang dipilih
      let courierPhone = courierPhoneParam
      let courierName = order.courier?.name || 'Kurir PAWON'
      let fallbackWarning = ''
      
      if (courierId && (!courierPhoneParam || courierName === 'Kurir PAWON')) {
        // Fetch tanpa cache agar data real-time
        const allCouriers = await writeClient.fetch(`*[_type == "courier"]{_id, phone, name}`, {}, { cache: 'no-store' })
        const matchedCourier = allCouriers.find((c: any) => c._id === courierId || c._id === `drafts.${courierId}` || `drafts.${c._id}` === courierId)
        if (matchedCourier?.phone) {
          courierPhone = matchedCourier.phone
          if (matchedCourier?.name) courierName = matchedCourier.name
        }
      }
      
      if (!courierPhone) {
        courierPhone = '6282241593592'
        fallbackWarning = `\n\n*(Sistem melempar tugas ini ke Septian karena gagal menemukan nomor HP kurir di URL WA atau Database Cache)*`
      }

      // Beri tahu pembeli bahwa pembayaran berhasil
      const itemsList = (order.items || []).map((i: any) => `- ${i.product?.name || 'Produk'} (x${i.quantity})`).join('\n')
      await sendWhatsAppNotification(order.customerPhone, `Halo *${order.customerName}*,\n\nPembayaran QRIS Anda untuk pesanan *${orderNumber}* sudah diterima oleh Admin Desa.\n\n🛍️ *Barang Pesanan:*\n${itemsList}\n\nBarang pesanan Anda saat ini sedang disiapkan oleh Penjual dan akan segera dikirim oleh *${courierName}* ke alamat Anda.`)

      // Kumpulkan nomor telepon penjual (uniques)
      const sellerPhones = Array.from(new Set((order.items || [])
        .map((i: any) => i.product?.vendor?.phone)
        .filter(Boolean)
      )) as string[]

      // Lanjutkan notifikasi ke Seller & Courier
      await notifySellerAndCourier(
        orderNumber, 
        order.customerName, 
        order.deliveryAddress, 
        (order.items || []).map((i: any) => ({ name: i.product?.name || 'Produk', quantity: i.quantity, vendorName: i.product?.vendor?.name })), 
        order.totalAmount,
        courierPhone,
        sellerPhones,
        fallbackWarning,
        courierName
      )

      return { success: true }
    }

    // Jika Admin menekan tombol Confirm COD
    if (newStatus === 'processing_cod') {
      if (order.status !== 'pending') return { success: false, error: 'Pesanan ini sudah diproses sebelumnya.' }
      
      let patch = writeClient.patch(order._id).set({ status: 'processing' })
      if (courierId) {
        patch = patch.set({ courier: { _type: 'reference', _ref: courierId } })
      }
      await patch.commit()



      // Dapatkan nomor kurir yang dipilih
      let courierPhone = courierPhoneParam
      let courierName = order.courier?.name || 'Kurir PAWON'
      let fallbackWarning = ''
      
      if (courierId && (!courierPhoneParam || courierName === 'Kurir PAWON')) {
        // Fetch tanpa cache agar data real-time
        const allCouriers = await writeClient.fetch(`*[_type == "courier"]{_id, phone, name}`, {}, { cache: 'no-store' })
        const matchedCourier = allCouriers.find((c: any) => c._id === courierId || c._id === `drafts.${courierId}` || `drafts.${c._id}` === courierId)
        if (matchedCourier?.phone) {
          courierPhone = matchedCourier.phone
          if (matchedCourier?.name) courierName = matchedCourier.name
        }
      }
      
      if (!courierPhone) {
        courierPhone = '6282241593592'
        fallbackWarning = `\n\n*(Sistem melempar tugas ini ke Septian karena gagal menemukan nomor HP kurir di URL WA atau Database Cache)*`
      }

      // Beri tahu pembeli bahwa pesanan diproses
      const itemsList = (order.items || []).map((i: any) => `- ${i.product?.name || 'Produk'} (x${i.quantity})`).join('\n')
      await sendWhatsAppNotification(order.customerPhone, `Halo *${order.customerName}*,\n\nPesanan COD Anda (*${orderNumber}*) sudah dikonfirmasi oleh Admin Desa.\n\n🛍️ *Barang Pesanan:*\n${itemsList}\n\nBarang pesanan Anda saat ini sedang disiapkan oleh Penjual dan akan segera dikirim oleh *${courierName}* ke alamat Anda.`)

      // Kumpulkan nomor telepon penjual (uniques)
      const sellerPhones = Array.from(new Set((order.items || [])
        .map((i: any) => i.product?.vendor?.phone)
        .filter(Boolean)
      )) as string[]

      // Lanjutkan notifikasi ke Seller & Courier
      await notifySellerAndCourier(
        orderNumber, 
        order.customerName, 
        order.deliveryAddress, 
        (order.items || []).map((i: any) => ({ name: i.product?.name || 'Produk', quantity: i.quantity, vendorName: i.product?.vendor?.name })), 
        order.totalAmount,
        courierPhone,
        sellerPhones,
        '',
        courierName
      )

      return { success: true }
    }

    // Jika Kurir mulai mengirim
    if (newStatus === 'delivering') {
      await writeClient
        .patch(order._id)
        .set({ status: 'delivering' })
        .commit()

      const courierName = order.courier?.name || 'Kurir PAWON'
      const itemsList = (order.items || []).map((i: any) => `- ${i.product?.name || 'Produk'} (x${i.quantity})`).join('\n')
      await sendWhatsAppNotification(order.customerPhone, `Halo *${order.customerName}*,\n\nPesanan Anda (*${orderNumber}*) saat ini *SEDANG DALAM PERJALANAN* menuju alamat Anda oleh *${courierName}*.\n\n🛍️ *Barang Pesanan:*\n${itemsList}\n\nHarap siapkan uang tunai sebesar *Rp${order.totalAmount.toLocaleString('id-ID')}* (jika menggunakan COD).\n\nKurir akan segera sampai dan menghubungi Anda.`)

      // Notifikasi ke Admin
      const settings = await writeClient.fetch(APP_SETTINGS_QUERY)
      const adminPhone = settings?.adminPhone || '081328128315'
      const itemsList = (order.items || []).map((i: any) => `- ${i.product?.name || 'Produk'} (x${i.quantity})`).join('\n')
      await sendWhatsAppNotification(adminPhone, `🚚 *PESANAN DIKIRIM*\nPesanan ${orderNumber} sedang diantar oleh kurir ke pembeli.\n\n🛍️ *Item:*\n${itemsList}`)

      return { success: true }
    }

    // Jika Kurir menyatakan barang telah diserahkan
    if (newStatus === 'delivered') {
      await writeClient
        .patch(order._id)
        .set({ status: 'delivered' })
        .commit()

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon.pondokrejo.id'
      const buyerLinks = `\n\n*KONFIRMASI PENERIMAAN:*\n✅ Barang Diterima: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=completed&label=Barang+Sudah+Diterima\n❌ Barang Bermasalah: ${baseUrl}/order/${orderNumber}/action?role=buyer&status=problem&label=Lapor+Barang+Bermasalah`
      await sendWhatsAppNotification(order.customerPhone, `Halo *${order.customerName}*,\n\nKurir kami melaporkan bahwa pesanan (*${orderNumber}*) *TELAH DISERAHKAN* kepada Anda.\n\nJika barang sudah Anda terima dengan baik, mohon **KLIK TOMBOL KONFIRMASI** di bawah ini agar kami dapat menutup transaksi:${buyerLinks}`)

      // Mulai hitung mundur 5 menit untuk Admin
      const settings = await writeClient.fetch(APP_SETTINGS_QUERY)
      const adminPhone = settings?.adminPhone || '081328128315'
      
      setTimeout(async () => {
        try {
          const checkOrder = await writeClient.fetch(`*[_id == $id][0]{status}`, { id: order._id })
          // Jika pembeli belum klik selesai (status masih delivered)
          if (checkOrder && checkOrder.status === 'delivered') {
            const adminFinishLink = `${baseUrl}/order/${orderNumber}/action?role=admin&status=completed&label=Selesaikan+Pesanan+Manual`
            const itemsList = (order.items || []).map((i: any) => `- ${i.product?.name || 'Produk'} (x${i.quantity})`).join('\n')
            await sendWhatsAppNotification(adminPhone, `⚠️ *PERHATIAN ADMIN* ⚠️\n\nKurir melaporkan bahwa pesanan ${orderNumber} telah diserahkan sejak 5 menit yang lalu, namun pembeli belum mengklik tombol konfirmasi terima.\n\n🛍️ *Item:*\n${itemsList}\n\nSilakan telepon pembeli di nomor ${order.customerPhone} untuk memastikan barang benar-benar sudah diterima.\n\nJika sudah dikonfirmasi secara lisan, silakan klik link di bawah ini untuk menutup pesanan:\n\n🏁 Tutup Pesanan: ${adminFinishLink}`)
          }
        } catch (e) {
          console.error('Failed in admin delayed notification', e)
        }
      }, 300000) // 5 minutes

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

    const itemsList = (order.items || []).map((i: any) => `- ${i.product?.name || 'Produk'} (x${i.quantity})`).join('\n')
    const adminMsg = `🔄 *UPDATE STATUS PESANAN*\n------------------\n🆔 *No:* ${orderNumber}\n👤 *User:* ${order.customerName}\n📈 *Status Baru:* ${newStatus}\n🛍️ *Item:*\n${itemsList}\n📝 *Catatan:* ${note || '-'}\n------------------`
    await sendWhatsAppNotification(adminPhone, adminMsg)

    return { success: true }
  } catch (error) {
    console.error('Update status failed:', error)
    return { success: false, error: 'Gagal memperbarui status.' }
  }
}

