import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/stars-invoice-bot - Создание инвойса для пополнения звездами
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount_stars, tg_id, business_connection_id } = body
    const initData = request.headers.get('x-telegram-init-data')

    console.log('Stars invoice request:', { amount_stars, tg_id, business_connection_id })

    if (!amount_stars || amount_stars <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!tg_id) {
      return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 })
    }

    // Проверяем, настроен ли Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      console.log('Supabase not configured, creating mock invoice')
      
      // Создаем mock инвойс для тестирования
      const mockInvoice = {
        ok: true,
        link: `https://t.me/your_bot?start=invoice_${Date.now()}`,
        invoice_id: `mock_${Date.now()}`,
        amount: amount_stars,
        currency: 'XTR'
      }
      
      return NextResponse.json(mockInvoice)
    }

    // Получаем или создаем пользователя
    let userId: string
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', tg_id)
      .single()

    if (userError || !existingUser) {
      // Создаем нового пользователя
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: tg_id,
          first_name: 'Пользователь',
          last_name: '',
          username: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (createError || !newUser) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      userId = newUser.id
    } else {
      userId = existingUser.id
    }

    // Создаем запрос на пополнение
    const { data: paymentRequest, error: requestError } = await supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        tg_id: tg_id,
        amount_rub: amount_stars / 2, // 2 звезды = 1 рубль
        amount_stars: amount_stars,
        status: 'pending'
      })
      .select('id')
      .single()

    if (requestError || !paymentRequest) {
      console.error('Failed to create payment request:', requestError)
      return NextResponse.json({ error: 'Failed to create payment request' }, { status: 500 })
    }

    // Создаем ссылку на бота для оплаты
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'your_bot'
    const invoiceLink = `https://t.me/${botUsername}?start=pay_${paymentRequest.id}`

    console.log('Invoice created:', { paymentRequestId: paymentRequest.id, link: invoiceLink })

    return NextResponse.json({
      ok: true,
      link: invoiceLink,
      invoice_id: paymentRequest.id,
      amount: amount_stars,
      currency: 'XTR'
    })

  } catch (error) {
    console.error('Stars invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
