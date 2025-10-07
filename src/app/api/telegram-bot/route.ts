import { NextRequest, NextResponse } from 'next/server'

// POST /api/telegram-bot - Обработка команд бота
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, callback_query } = body

    // Обработка сообщений
    if (message) {
      const { text, from, chat } = message
      
      if (text?.startsWith('/start')) {
        const args = text.split(' ')
        if (args.length > 1 && args[1].startsWith('pay_')) {
          // Обработка команды /start pay_uuid
          const paymentRequestId = args[1].replace('pay_', '')
          return await handlePaymentRequest(paymentRequestId, from.id, chat.id)
        } else {
          // Обычный /start
          return await sendMessage(chat.id, 'Добро пожаловать в Stellex Bank! 🏦\n\nДля пополнения карты используйте приложение.')
        }
      }
      
      if (text === '/balance') {
        return await sendMessage(chat.id, 'Для просмотра баланса используйте приложение.')
      }
      
      if (text === '/help') {
        return await sendMessage(chat.id, 'Доступные команды:\n/start - Запустить бота\n/balance - Показать баланс\n/help - Помощь')
      }
    }

    // Обработка callback query
    if (callback_query) {
      const { data, from, message } = callback_query
      
      if (data?.startsWith('pay_')) {
        const paymentRequestId = data.replace('pay_', '')
        return await handlePaymentRequest(paymentRequestId, from.id, message.chat.id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Bot handler error:', error)
    return NextResponse.json({ ok: true })
  }
}

// Обработка запроса на пополнение
async function handlePaymentRequest(paymentRequestId: string, userId: number, chatId: number) {
  try {
    // Получаем данные запроса из базы данных
    const { data: paymentRequest, error } = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment-request/${paymentRequestId}`)
      .then(res => res.json())

    if (error || !paymentRequest) {
      return await sendMessage(chatId, '❌ Запрос на пополнение не найден или истек.')
    }

    if (paymentRequest.status !== 'pending') {
      return await sendMessage(chatId, '❌ Этот запрос уже обработан.')
    }

    // Создаем инвойс для оплаты звездами
    const invoice = {
      chat_id: chatId,
      title: `Пополнение карты Stellex`,
      description: `Пополнение виртуальной карты на ${paymentRequest.amount_rub} ₽`,
      payload: JSON.stringify({
        payment_request_id: paymentRequestId,
        user_id: userId,
        amount_rub: paymentRequest.amount_rub,
        amount_stars: paymentRequest.amount_stars
      }),
      provider_token: '', // Для Telegram Stars не нужен provider token
      currency: 'XTR', // Telegram Stars currency
      prices: [
        {
          label: `Пополнение на ${paymentRequest.amount_rub} ₽`,
          amount: paymentRequest.amount_stars * 100 // Telegram Stars в копейках
        }
      ],
      start_parameter: `pay_${paymentRequestId}`,
      is_flexible: false,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false
    }

    // Отправляем инвойс
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice)
    })

    const result = await response.json()
    
    if (result.ok) {
      console.log('Invoice sent successfully:', result.result.message_id)
    } else {
      console.error('Failed to send invoice:', result)
      await sendMessage(chatId, '❌ Ошибка создания инвойса. Попробуйте позже.')
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Payment request error:', error)
    await sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.')
    return NextResponse.json({ ok: true })
  }
}

// Отправка сообщения
async function sendMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    })
    
    return await response.json()
  } catch (error) {
    console.error('Send message error:', error)
    return { ok: false }
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
