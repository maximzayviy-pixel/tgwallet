import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      )
    }

    const { 
      amount, 
      description, 
      return_url, 
      webhook_url, 
      currency = 'RUB',
      expires_in = 3600 // 1 час по умолчанию
    } = await request.json()

    // Валидация
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Сумма должна быть больше 0' },
        { status: 400 }
      )
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Описание обязательно' },
        { status: 400 }
      )
    }

    // Генерируем уникальный ID для платежа
    const paymentId = `stl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Создаем запись о платеже
    const { data: payment, error: paymentError } = await supabase
      .from('payment_links')
      .insert({
        id: paymentId,
        user_id: user.id,
        amount: amount,
        currency: currency,
        description: description,
        return_url: return_url,
        webhook_url: webhook_url,
        status: 'pending',
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment link creation error:', paymentError)
      return NextResponse.json(
        { error: 'Ошибка создания платежной ссылки' },
        { status: 500 }
      )
    }

    // Генерируем ссылку для оплаты
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tgwallet-ei8z.vercel.app'
    const paymentUrl = `${baseUrl}/pay/${paymentId}`

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      payment_url: paymentUrl,
      amount: amount,
      currency: currency,
      description: description,
      expires_at: payment.expires_at,
      status: 'pending'
    })

  } catch (error) {
    console.error('Create payment link error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
