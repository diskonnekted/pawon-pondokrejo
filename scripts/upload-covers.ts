import { createClient } from 'next-sanity'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const artifactDir = 'C:\\Users\\diskonekted\\.gemini\\antigravity\\brain\\1aaea4f3-29ee-440a-9f5b-0e825c85ac5e'

const categoryMap: Record<string, string> = {
  'instalasi-internet': 'cover_internet_',
  'servis-mobil': 'cover_mobil_',
  'servis-motor': 'cover_motor_',
  'tambal-ban': 'cover_ban_',
  'servis-mesin-cuci': 'cover_mesincuci_',
  'servis-listrik': 'cover_listrik_',
  'servis-hp': 'cover_hp_',
  'servis-ac': 'cover_ac_',
  'fotografer': 'cover_foto_',
  'video-shooting': 'cover_video_',
  'jasa-lainnya': 'cover_lainnya_',
}

async function run() {
  console.log('Fetching categories...')
  const categories = await client.fetch(`*[_type == "category"]{ _id, "slug": slug.current }`)
  
  const files = fs.readdirSync(artifactDir)

  for (const cat of categories) {
    const filePrefix = categoryMap[cat.slug]
    if (!filePrefix) continue

    const matchingFile = files.find(f => f.startsWith(filePrefix) && f.endsWith('.png'))
    if (!matchingFile) {
      console.log(`No image found for ${cat.slug} (prefix: ${filePrefix})`)
      continue
    }

    const filePath = path.join(artifactDir, matchingFile)
    console.log(`Uploading image for ${cat.slug}: ${matchingFile}...`)
    
    try {
      const asset = await client.assets.upload('image', fs.createReadStream(filePath), {
        filename: matchingFile
      })

      console.log(`Patching category ${cat.slug} with image asset ${asset._id}...`)
      await client.patch(cat._id)
        .set({
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            }
          }
        })
        .commit()
      
      console.log(`✅ Success for ${cat.slug}`)
    } catch (e) {
      console.error(`❌ Failed for ${cat.slug}:`, e)
    }
  }

  console.log('Done uploading covers!')
}

run().catch(console.error)
