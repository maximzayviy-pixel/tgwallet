import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/payment-request/[id] - Получение данных запроса на пополнение
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: paymentRequestId } = await context.params

    if (!paymentRequestId) {
      return NextResponse.json({ error: 'Payment request ID required' }, { status: 400 })
    }

    // Проверяем, настроен ли Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      console.log('Supabase not configured, returning mock data')
      
      // Возвращаем mock данные для тестирования
      return NextResponse.json({
        id: paymentRequestId,
        amount_rub: 50,
        amount_stars: 100,
        status: 'pending',
        created_at: new Date().toISOString()
      })
    }

    // Получаем данные из Supabase
    const { data: paymentRequest, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', paymentRequestId)
      .single()

    if (error) {
      console.error('Error fetching payment request:', error)
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
    }

    if (!paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
    }

    return NextResponse.json(paymentRequest)

  } catch (error) {
    console.error('Payment request API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
