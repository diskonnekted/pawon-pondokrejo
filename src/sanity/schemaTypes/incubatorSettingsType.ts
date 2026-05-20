import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const incubatorSettingsType = defineType({
  name: 'incubatorSettings',
  title: 'Pengaturan Halaman Inkubator',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Gambar Hero Inkubator',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Judul Hero (Override)',
      type: 'string',
      description: 'Kosongkan untuk menggunakan judul default.',
    }),
  ],
})
