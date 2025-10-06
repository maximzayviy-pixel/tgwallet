import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/cards/verify - Генерация кода верификации для привязки карты
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_number, holder_name, expiry_date, cvv, service_name, service_url, api_key } = body

    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!card_number || !holder_name || !expiry_date || !cvv || !service_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Проверяем существование карты
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*, users!inner(telegram_id, first_name)')
      .eq('card_number', card_number)
      .eq('holder_name', holder_name.toUpperCase())
      .eq('expiry_date', expiry_date)
      .eq('cvv', cvv)
      .eq('status', 'active')
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found or invalid' }, { status: 404 })
    }

    // Генерируем 6-значный код верификации
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Время жизни кода - 5 минут
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Сохраняем код верификации
    const { data: verification, error: verificationError } = await supabase
      .from('card_verifications')
      .insert({
        card_id: card.id,
        user_id: card.user_id,
        verification_code: verificationCode,
        service_name: service_name,
        service_url: service_url || null,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select('*')
      .single()

    if (verificationError) {
      return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 })
    }

    // Отправляем код через Telegram бота
    const telegramMessage = `🔐 **Код верификации карты**

Карта: ****${card_number.slice(-4)}
Сервис: ${service_name}

Ваш код верификации:
**${verificationCode}**

⏰ Код действителен 5 минут
🔒 Никому не сообщайте этот код!`

    try {
      // Отправляем сообщение через Telegram
      const telegramResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: card.users.telegram_id,
          message: telegramMessage,
          parse_mode: 'Markdown'
        })
      })

      if (!telegramResponse.ok) {
        console.error('Failed to send Telegram message')
      }
    } catch (error) {
      console.error('Error sending Telegram message:', error)
    }

    return NextResponse.json({ 
      success: true,
      verification_id: verification.id,
      expires_at: expiresAt.toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
