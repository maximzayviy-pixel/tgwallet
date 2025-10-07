import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params

    // Получаем информацию о платеже
    const { data: payment, error: paymentError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Платеж не найден' },
        { status: 404 }
      )
    }

    // Проверяем, не истек ли платеж
    if (new Date(payment.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Платеж истек' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      expires_at: payment.expires_at,
      created_at: payment.created_at
    })

  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
