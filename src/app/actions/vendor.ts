'use server'

import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function registerVendor(formData: { name: string, phone: string, address: string, description: string }) {
  try {
    const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    
    const doc = {
      _type: 'vendor',
      name: formData.name,
      slug: { _type: 'slug', current: slug },
      phone: formData.phone,
      address: formData.address,
      description: formData.description,
      isVerified: false, // Default pending
    }

    const result = await writeClient.create(doc)
    return { success: true, vendorId: result._id }
  } catch (error) {
    console.error('Vendor registration failed:', error)
    return { success: false, error: 'Gagal mengirim pendaftaran.' }
  }
}
