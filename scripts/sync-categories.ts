import { createClient } from 'next-sanity'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const predefinedCategories = [
  { name: 'Instalasi Internet', slug: 'instalasi-internet' },
  { name: 'Servis Mobil', slug: 'servis-mobil' },
  { name: 'Servis Motor', slug: 'servis-motor' },
  { name: 'Tambal Ban', slug: 'tambal-ban' },
  { name: 'Servis Mesin Cuci', slug: 'servis-mesin-cuci' },
  { name: 'Servis Listrik', slug: 'servis-listrik' },
  { name: 'Servis HP', slug: 'servis-hp' },
  { name: 'Servis AC', slug: 'servis-ac' },
  { name: 'Fotografer', slug: 'fotografer' },
  { name: 'Video Shooting', slug: 'video-shooting' },
  { name: 'Jasa Lainnya', slug: 'jasa-lainnya' },
]

function getCategoryForService(serviceName: string) {
  const name = serviceName.toLowerCase()
  if (name.includes('internet') || name.includes('wifi')) return 'instalasi-internet'
  if (name.includes('mobil')) return 'servis-mobil'
  if (name.includes('motor')) return 'servis-motor'
  if (name.includes('ban')) return 'tambal-ban'
  if (name.includes('mesin cuci')) return 'servis-mesin-cuci'
  if (name.includes('listrik')) return 'servis-listrik'
  if (name.includes('hp') || name.includes('handphone') || name.includes('ponsel')) return 'servis-hp'
  if (name.includes('ac')) return 'servis-ac'
  if (name.includes('foto') || name.includes('kamera')) return 'fotografer'
  if (name.includes('video')) return 'video-shooting'
  return 'jasa-lainnya'
}

async function run() {
  console.log('Fetching existing categories...')
  const existingCategories = await client.fetch(`*[_type == "category"]{ _id, "slug": slug.current }`)
  
  const categoryIdMap = new Map<string, string>()
  for (const cat of existingCategories) {
    categoryIdMap.set(cat.slug, cat._id)
  }

  console.log('Creating predefined categories if they do not exist...')
  for (const pc of predefinedCategories) {
    if (!categoryIdMap.has(pc.slug)) {
      console.log(`Creating category: ${pc.name}`)
      const res = await client.create({
        _type: 'category',
        name: pc.name,
        slug: { _type: 'slug', current: pc.slug }
      })
      categoryIdMap.set(pc.slug, res._id)
    }
  }

  console.log('Fetching all services...')
  const services = await client.fetch(`*[_type == "service"]{ _id, name, categories }`)

  console.log('Updating services without categories...')
  for (const service of services) {
    if (!service.categories || service.categories.length === 0) {
      const targetSlug = getCategoryForService(service.name)
      const targetId = categoryIdMap.get(targetSlug)
      
      if (targetId) {
        console.log(`Updating service ${service.name} with category ${targetSlug}...`)
        await client.patch(service._id)
          .set({
            categories: [
              { _type: 'reference', _key: Math.random().toString(36).substring(7), _ref: targetId }
            ]
          })
          .commit()
      }
    }
  }

  console.log('Done syncing dummy data to Sanity!')
}

run().catch(console.error)
