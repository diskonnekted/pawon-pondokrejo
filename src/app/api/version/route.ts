import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    version: '4.1', 
    message: 'System is running the ULTIMATE anti-cache fallback diagnostic.',
    time: new Date().toISOString()
  })
}
