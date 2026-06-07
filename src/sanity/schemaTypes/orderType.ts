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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'product', type: 'reference', to: [{ type: 'product' }] }),
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
      options: {
        list: [
          { title: 'Menunggu Konfirmasi Admin', value: 'pending' },
          { title: 'Order Diterima Kurir', value: 'accepted' },
          { title: 'Diproses Penjual', value: 'processing' },
          { title: 'Diserahkan ke Kurir', value: 'shipped' },
          { title: 'Dalam Pengiriman', value: 'delivering' },
          { title: 'Selesai (Diterima)', value: 'completed' },
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
    }),
    defineField({
      name: 'courierNotes',
      title: 'Catatan Khusus untuk Kurir',
      type: 'text',
      rows: 3,
      description: 'Instruksi tambahan dari Admin (misal: Barang pecah belah, titipkan ke tetangga jika tidak ada orang, dll).',
    }),
  ],
})

