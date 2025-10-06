import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/cards/activate - Активация карты
export async function POST(request: NextRequest) {
  try {
    const { card_id, telegram_user_id, api_key } = await request.json()

    if (!api_key || api_key !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!card_id || !telegram_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Проверяем, существует ли карта и принадлежит ли она пользователю
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        id,
        card_number,
        status,
        users (
          telegram_id
        )
      `)
      .eq('id', card_id)
      .eq('user_id', telegram_user_id)
      .single()

    if (cardError || !card || !card.users) {
      return NextResponse.json({ error: 'Card not found or does not belong to user' }, { status: 404 })
    }

    if (card.status !== 'awaiting_activation') {
      return NextResponse.json({ error: 'Card is not awaiting activation' }, { status: 400 })
    }

    // Активируем карту
    const { error: updateError } = await supabase
      .from('cards')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', card_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to activate card' }, { status: 500 })
    }

    // Создаем транзакцию активации
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        card_id: card_id,
        user_id: telegram_user_id,
        type: 'card_activation',
        amount: 0,
        description: 'Активация карты Stellex Bank',
        status: 'completed'
      })

    if (transactionError) {
      console.error('Failed to create activation transaction:', transactionError)
    }

    // Отправляем уведомление через Telegram
    const telegramMessage = `🎉 **Карта активирована!**

Ваша карта Stellex Bank успешно активирована и готова к использованию.

Номер карты: ****${card.card_number.slice(-4)}
Статус: ✅ Активна

Теперь вы можете:
• Пополнять карту
• Совершать покупки
• Переводить средства
• Использовать все функции банка

Добро пожаловать в Stellex Bank! 🚀`

    try {
      const telegramResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: card.users[0].telegram_id,
          message: telegramMessage,
          parse_mode: 'Markdown'
        })
      })

      if (!telegramResponse.ok) {
        console.error('Failed to send Telegram notification')
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Card activated successfully',
      card_id: card_id,
      status: 'active'
    })
  } catch (error) {
    console.error('API Activate POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
