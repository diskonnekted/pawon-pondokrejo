'use server'

import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

/**
 * Mengambil semua produk milik vendor tertentu
 */
export async function getVendorProducts(vendorId: string) {
  try {
    const query = `*[_type == "product" && vendor._ref == $vendorId] | order(_createdAt desc) {
      _id,
      name,
      price,
      stock,
      image,
      "slug": slug.current
    }`
    const products = await writeClient.fetch(query, { vendorId })
    return { success: true, data: products }
  } catch (error) {
    console.error('Fetch vendor products failed:', error)
    return { success: false, error: 'Gagal mengambil daftar produk.' }
  }
}

/**
 * Mengunggah gambar ke Sanity Assets
 */
export async function uploadImageToSanity(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) return { success: false, error: 'File tidak ditemukan.' }

    const asset = await writeClient.assets.upload('image', file, {
      filename: file.name,
    })

    return { success: true, assetId: asset._id }
  } catch (error) {
    console.error('Image upload failed:', error)
    return { success: false, error: 'Gagal mengunggah gambar.' }
  }
}

/**
 * Membuat produk baru (Status: Draft/Needs Review)
 */
export async function createVendorProduct(vendorId: string, data: {
  name: string,
  price: number,
  stock: number,
  description?: string,
  assetId: string
}) {
  try {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').slice(0, 200) + '-' + Math.random().toString(36).substr(2, 5)
    
    const doc = {
      _type: 'product',
      name: data.name,
      slug: { _type: 'slug', current: slug },
      price: data.price,
      stock: data.stock,
      description: data.description,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: data.assetId,
        },
      },
      vendor: {
        _type: 'reference',
        _ref: vendorId,
      },
    }

    // Buat sebagai dokumen baru. 
    // Catatan: Di Sanity Studio, Admin akan melihat produk ini masuk.
    const result = await writeClient.create(doc)

    return { success: true, productId: result._id }
  } catch (error) {
    console.error('Create product failed:', error)
    return { success: false, error: 'Gagal menambah produk.' }
  }
}

/**
 * Menghapus produk milik sendiri
 */
export async function deleteVendorProduct(productId: string, vendorId: string) {
  try {
    // Validasi kepemilikan sebelum hapus
    const product = await writeClient.fetch(`*[_type == "product" && _id == $productId][0]{"vId": vendor._ref}`, { productId })
    
    if (!product || product.vId !== vendorId) {
      return { success: false, error: 'Akses ditolak.' }
    }

    await writeClient.delete(productId)
    return { success: true }
  } catch (error) {
    console.error('Delete product failed:', error)
    return { success: false, error: 'Gagal menghapus produk.' }
  }
}
