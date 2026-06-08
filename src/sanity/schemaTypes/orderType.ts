import { defineField, defineType } from 'sanity'
import { BasketIcon } from '@sanity/icons'

export const orderType = defineType({
  name: 'order',
  title: 'Pesanan',
  type: 'document',
  liveEdit: true,
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'orderNumber',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'customerName',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerPhone',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'deliveryAddress',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customer',
      title: 'Profil Warga (Pembeli)',
      type: 'reference',
      to: [{ type: 'customer' }],
      weak: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'orderCategory',
      title: 'Kategori Pesanan',
      type: 'string',
      options: {
        list: [
          { title: 'Produk Barang', value: 'product' },
          { title: 'Pemesanan Jasa', value: 'service' },
        ],
      },
      initialValue: 'product',
    }),
    defineField({
      name: 'serviceItem',
      title: 'Layanan Jasa yang Dipesan',
      type: 'reference',
      to: [{ type: 'service' }],
      weak: true,
      hidden: ({ document }) => document?.orderCategory !== 'service',
    }),
    defineField({
      name: 'serviceDate',
      title: 'Jadwal Pelaksanaan Jasa',
      type: 'datetime',
      hidden: ({ document }) => document?.orderCategory !== 'service',
    }),
    defineField({
      name: 'items',
      type: 'array',
      hidden: ({ document }) => document?.orderCategory === 'service',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'product', type: 'reference', to: [{ type: 'product' }], weak: true }),
            defineField({ name: 'quantity', type: 'number' }),
            defineField({ name: 'price', type: 'number', title: 'Harga saat dibeli' }),
          ],
          preview: {
            select: {
              productName: 'product.name',
              quantity: 'quantity',
              media: 'product.image',
            },
            prepare({ productName, quantity, media }) {
              return {
                title: `${productName || 'Produk Tidak Terdaftar'}`,
                subtitle: `Jumlah: ${quantity || 0}`,
                media,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Pembayaran',
      type: 'number',
    }),
    defineField({
      name: 'shippingFee',
      title: 'Ongkos Kirim',
      type: 'number',
      hidden: ({ document }) => document?.orderCategory === 'service',
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Metode Pembayaran',
      type: 'string',
      options: {
        list: [
          { title: 'Bayar di Tempat (COD)', value: 'cod' },
          { title: 'QRIS', value: 'qris' },
        ],
      },
      initialValue: 'cod',
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Status Pembayaran',
      type: 'string',
      options: {
        list: [
          { title: 'Belum Dibayar', value: 'unpaid' },
          { title: 'Sudah Dibayar', value: 'paid' },
        ],
      },
      initialValue: 'unpaid',
      hidden: ({ document }) => document?.paymentMethod === 'cod',
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status Pesanan',
      options: {
        list: [
          { title: 'Menunggu Konfirmasi', value: 'pending' },
          { title: 'Sedang Diproses / Disanggupi', value: 'accepted' },
          { title: 'Diproses Penjual (Barang)', value: 'processing' },
          { title: 'Diserahkan ke Kurir (Barang)', value: 'shipped' },
          { title: 'Dalam Perjalanan / Proses Jasa', value: 'delivering' },
          { title: 'Selesai', value: 'completed' },
          { title: 'Dibatalkan', value: 'cancelled' },
          { title: 'Ada Masalah', value: 'problem' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'courier',
      title: 'Kurir yang Bertugas',
      type: 'reference',
      to: [{ type: 'courier' }],
      hidden: ({ document }) => document?.orderCategory === 'service',
    }),
    defineField({
      name: 'courierNotes',
      title: 'Catatan Khusus untuk Kurir',
      type: 'text',
      rows: 3,
      description: 'Instruksi tambahan dari Admin (misal: Barang pecah belah, titipkan ke tetangga jika tidak ada orang, dll).',
      hidden: ({ document }) => document?.orderCategory === 'service',
    }),
    defineField({
      name: 'vendorId_for_query_only',
      title: 'Vendor ID (Query Purpose)',
      type: 'string',
      hidden: true,
    }),
  ],
})

