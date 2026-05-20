import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const vendorType = defineType({
  name: 'vendor',
  title: 'Penjual (UMKM)',
  type: 'document',
  icon: UserIcon,
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
      name: 'logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'phone',
      title: 'Nomor WhatsApp',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      type: 'string',
    }),
    defineField({
      name: 'isVerified',
      title: 'Status Verifikasi',
      type: 'boolean',
      initialValue: false,
      description: 'Aktifkan ini jika UMKM sudah diverifikasi oleh Admin Desa.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'address',
      media: 'logo',
    },
  },
})
