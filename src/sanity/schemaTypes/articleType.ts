import { defineField, defineType } from 'sanity'
import { InfoOutlineIcon } from '@sanity/icons'

export const articleType = defineType({
  name: 'article',
  title: 'Info & Pengumuman',
  type: 'document',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Judul Info',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Tanggal Terbit',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori Info',
      type: 'string',
      options: {
        list: [
          { title: 'Pelatihan', value: 'pelatihan' },
          { title: 'Pengumuman', value: 'pengumuman' },
          { title: 'Panduan', value: 'panduan' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Gambar Sampul',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Ringkasan Singkat',
      type: 'text',
      rows: 3,
      description: 'Akan muncul pada kartu info di halaman depan.',
    }),
    defineField({
      name: 'content',
      title: 'Isi Konten',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      subtitle: 'category',
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: subtitle.toUpperCase(),
      }
    },
  },
})
