import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const productType = defineType({
  name: 'product',
  title: 'Produk',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'vendor',
      title: 'Penjual',
      type: 'reference',
      to: [{ type: 'vendor' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Kategori',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'price',
      title: 'Harga (Rp)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'stock',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'isBestSeller',
      title: 'Produk Terlaris',
      type: 'boolean',
      initialValue: false,
      description: 'Aktifkan jika produk ini termasuk yang paling banyak dibeli.',
    }),
    defineField({
      name: 'isPromo',
      title: 'Produk Promo',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'promoDiscount',
      title: 'Diskon (%)',
      type: 'number',
      validation: (rule) => rule.min(1).max(99),
      hidden: ({ document }) => !document?.isPromo,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      subtitle: 'price',
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: `Rp ${subtitle.toLocaleString('id-ID')}`,
      }
    },
  },
})
