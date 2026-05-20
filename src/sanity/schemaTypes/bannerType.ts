import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const bannerType = defineType({
  name: 'banner',
  title: 'Banner Promosi',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Judul Banner',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'imageDesktop',
      title: 'Gambar Desktop (Landscape)',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'imageMobile',
      title: 'Gambar Mobile (Square/Portrait)',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link Tujuan',
      type: 'string',
      placeholder: '/products?category=kuliner',
    }),
    defineField({
      name: 'isActive',
      title: 'Aktif',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'imageDesktop',
    },
  },
})
