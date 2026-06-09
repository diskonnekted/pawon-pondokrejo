import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function GET() {
  const couriers = await writeClient.fetch(`*[_type == "courier"]{_id, name, phone, isActive, status}`)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pawon.pondokrejo.id'
  const debugLinks: any = {}
  
  couriers.forEach((c: any) => {
    const safeName = encodeURIComponent(c.name)
    const safePhone = encodeURIComponent(c.phone || '')
    debugLinks[c.name] = {
      phone: c.phone,
      isActive: c.isActive,
      status: c.status,
      adminClickLink_COD: `${baseUrl}/order/TEST-123/action?role=admin&status=processing_cod&courierId=${c._id}&courierPhone=${safePhone}&label=Kirim+Tugas+ke+${safeName}`
    }
  })

  return NextResponse.json({
    message: "Ini adalah daftar 100% akurat dari database Sanity yang terbaca oleh sistem saat ini.",
    totalCouriersFound: couriers.length,
    couriers: debugLinks
  })
}
