import { defineField, defineType } from 'sanity'
import { BasketIcon } from '@sanity/icons'

export const orderType = defineType({
  name: 'order',
  title: 'Pesanan',
  type: 'document',
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
      type: 'number',
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Menunggu Konfirmasi', value: 'pending' },
          { title: 'Diproses Penjual', value: 'processing' },
          { title: 'Sedang Diantar Kurir', value: 'delivering' },
          { title: 'Selesai (COD)', value: 'completed' },
          { title: 'Dibatalkan', value: 'cancelled' },
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
  ],
})
