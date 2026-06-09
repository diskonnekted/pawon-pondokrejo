import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '3.0',
    message: 'System is up to date and running the latest courier fix.',
    time: new Date().toISOString()
  })
}
