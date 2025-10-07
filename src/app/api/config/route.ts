import { NextResponse } from 'next/server'

// GET /api/config - Получить конфигурацию для клиента
export async function GET() {
  try {
    return NextResponse.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      apiKey: process.env.API_KEY ? 'configured' : 'not_configured'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 })
  }
}
