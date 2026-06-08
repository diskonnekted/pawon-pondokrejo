import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const customerType = defineType({
  name: 'customer',
  title: 'Data Warga (Pembeli)',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nama Lengkap',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Nomor WhatsApp',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Alamat Lengkap',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pin',
      title: 'PIN Login',
      type: 'string',
      initialValue: '123456',
      description: 'PIN default adalah 123456. Warga bisa mengubahnya sendiri.',
    }),
    defineField({
      name: 'isVerified',
      title: 'Sudah Diverifikasi Kalurahan?',
      type: 'boolean',
      initialValue: false,
      description: 'Centang jika warga ini sudah terbukti nyata dan terpercaya.',
    }),
    defineField({
      name: 'successfulOrders',
      title: 'Total COD Berhasil',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'failedOrders',
      title: 'Total COD Gagal (Fiktif)',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'phone',
      success: 'successfulOrders',
      failed: 'failedOrders',
    },
    prepare({ title, subtitle, success, failed }) {
      return {
        title,
        subtitle: `WA: ${subtitle} | ✅ ${success || 0} | ❌ ${failed || 0}`,
      }
    },
  },
})
