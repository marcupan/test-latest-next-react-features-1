import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.warn('CSP Report:', body)

  return new NextResponse(null, { status: 204 })
}
