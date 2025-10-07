import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/telegram-stars/payment-success - Обработка успешной оплаты
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      card_id, 
      stars_amount, 
      rub_amount, 
      user_id, 
      telegram_payment_charge_id,
      provider_payment_charge_id 
    } = body

    if (!card_id || !stars_amount || !rub_amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Проверяем, настроен ли Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Mock режим - просто возвращаем успех
      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully (mock mode)',
        transaction_id: `stars_${Date.now()}`,
        new_balance: rub_amount
      })
    }

    // Получаем карту
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', card_id)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.status !== 'active') {
      return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
    }

    // Создаем транзакцию
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        card_id: card_id,
        user_id: user_id || card.user_id,
        type: 'telegram_stars_topup',
        amount: rub_amount,
        description: `Top-up via Telegram Stars (${stars_amount} ⭐)`,
        status: 'completed',
        external_id: telegram_payment_charge_id || `stars_${Date.now()}`
      })
      .select('*')
      .single()

    if (transactionError) {
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // Обновляем баланс карты
    const { error: updateError } = await supabase
      .from('cards')
      .update({ 
        balance: card.balance + rub_amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', card_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      transaction_id: transaction.id,
      stars_amount: stars_amount,
      rub_amount: rub_amount,
      new_balance: card.balance + rub_amount
    })
  } catch (error) {
    console.error('Payment success error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
