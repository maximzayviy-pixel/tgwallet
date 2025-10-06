import { NextRequest, NextResponse } from 'next/server'

// POST /api/telegram/send-message - Отправка сообщения через Telegram бота
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegram_id, message, parse_mode = 'Markdown' } = body

    if (!telegram_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 })
    }

    // Отправляем сообщение через Telegram Bot API
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: message,
        parse_mode: parse_mode,
        disable_web_page_preview: true
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to send message', 
        details: data.description 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message_id: data.result.message_id 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
