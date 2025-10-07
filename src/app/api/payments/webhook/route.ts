import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { payment_id, status, amount, description } = await request.json()

    if (!payment_id || !status) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      )
    }

    // Обновляем статус платежа в базе данных
    const { error: updateError } = await supabase
      .from('payment_links')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_id)

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json(
        { error: 'Ошибка обновления статуса платежа' },
        { status: 500 }
      )
    }

    // Получаем информацию о платеже для отправки webhook
    const { data: payment, error: fetchError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('id', payment_id)
      .single()

    if (fetchError || !payment) {
      console.error('Error fetching payment:', fetchError)
      return NextResponse.json(
        { error: 'Платеж не найден' },
        { status: 404 }
      )
    }

    // Если есть webhook_url, отправляем уведомление
    if (payment.webhook_url) {
      try {
        await fetch(payment.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_id: payment.id,
            status: status,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            created_at: payment.created_at,
            updated_at: new Date().toISOString()
          })
        })
      } catch (webhookError) {
        console.error('Webhook delivery failed:', webhookError)
        // Не возвращаем ошибку, так как платеж уже обработан
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook обработан успешно'
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
