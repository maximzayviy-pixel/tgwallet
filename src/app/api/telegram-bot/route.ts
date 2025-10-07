import { NextRequest, NextResponse } from 'next/server'

// POST /api/telegram-bot - Обработка команд бота
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Bot received update:', JSON.stringify(body, null, 2))
    
    const { message, callback_query } = body

    // Обработка сообщений
    if (message) {
      const { text, from, chat } = message
      console.log('Processing message:', { text, fromId: from.id, chatId: chat.id })
      
      if (text?.startsWith('/start')) {
        const args = text.split(' ')
        console.log('Start command args:', args)
        
        if (args.length > 1 && args[1].startsWith('pay_')) {
          // Обработка команды /start pay_uuid
          const paymentRequestId = args[1].replace('pay_', '')
          console.log('Processing payment request:', paymentRequestId)
          return await handlePaymentRequest(paymentRequestId, from.id, chat.id)
        } else {
          // Обычный /start
          console.log('Regular start command')
          await sendMessage(chat.id, 'Добро пожаловать в Stellex Bank! 🏦\n\nДля пополнения карты используйте приложение.')
          return NextResponse.json({ ok: true })
        }
      }
      
      if (text === '/balance') {
        await sendMessage(chat.id, 'Для просмотра баланса используйте приложение.')
        return NextResponse.json({ ok: true })
      }
      
      if (text === '/help') {
        await sendMessage(chat.id, 'Доступные команды:\n/start - Запустить бота\n/balance - Показать баланс\n/help - Помощь')
        return NextResponse.json({ ok: true })
      }
    }

    // Обработка callback query
    if (callback_query) {
      const { data, from, message } = callback_query
      
      if (data?.startsWith('pay_')) {
        const paymentRequestId = data.replace('pay_', '')
        await handlePaymentRequest(paymentRequestId, from.id, message.chat.id)
        return NextResponse.json({ ok: true })
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
    console.log('Fetching payment request:', paymentRequestId)
    
    // Получаем данные запроса из базы данных
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tgwallet-ei8z.vercel.app'
    const response = await fetch(`${appUrl}/api/payment-request/${paymentRequestId}`)
    const data = await response.json()
    
    console.log('Payment request response:', { status: response.status, data })

    if (!response.ok || data.error) {
      console.error('Payment request fetch failed:', data)
      await sendMessage(chatId, '❌ Запрос на пополнение не найден или истек.')
      return
    }

    const paymentRequest = data

    if (paymentRequest.status !== 'pending') {
      await sendMessage(chatId, '❌ Этот запрос уже обработан.')
      return
    }

    console.log('Creating invoice for payment request:', paymentRequest)

    // Создаем инвойс для оплаты звездами согласно документации
    const invoice = {
      chat_id: chatId,
      title: `Stellex: пополнение`,
      description: `Пополнение баланса на ${paymentRequest.amount_stars} ⭐`,
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
          label: 'XTR', // Согласно документации - должно быть XTR
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

    console.log('Sending invoice:', invoice)

    // Отправляем инвойс
    const invoiceResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice)
    })

    const result = await invoiceResponse.json()
    
    if (result.ok) {
      console.log('Invoice sent successfully:', result.result.message_id)
      console.log('Invoice link:', result.result.invoice_link)
    } else {
      console.error('Failed to send invoice:', result)
      await sendMessage(chatId, '❌ Ошибка создания инвойса. Попробуйте позже.')
    }
  } catch (error) {
    console.error('Payment request error:', error)
    await sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.')
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
