import { defineField, defineType } from 'sanity'
import { PresentationIcon } from '@sanity/icons'

export const serviceType = defineType({
  name: 'service',
  title: 'Jasa & Layanan',
  type: 'document',
  icon: PresentationIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nama Jasa',
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
      title: 'Penyedia Jasa',
      type: 'reference',
      to: [{ type: 'vendor' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Kategori Jasa',
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
      name: 'priceType',
      title: 'Tipe Harga',
      type: 'string',
      options: {
        list: [
          { title: 'Harga Pas', value: 'fixed' },
          { title: 'Mulai Dari', value: 'starting_from' },
          { title: 'Per Jam', value: 'hourly' },
          { title: 'Nego', value: 'negotiable' },
        ],
      },
      initialValue: 'starting_from',
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
      name: 'isBestSeller',
      title: 'Jasa Terpopuler',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isPromo',
      title: 'Jasa Promo',
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
