import { defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons'

export const courierType = defineType({
  name: 'courier',
  title: 'Kurir Desa',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'name',
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
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Aktif', value: 'active' },
          { title: 'Tidak Aktif', value: 'inactive' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'phone',
    },
  },
})
