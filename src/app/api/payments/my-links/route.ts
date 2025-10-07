import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Получаем все платежные ссылки пользователя
    const { data: paymentLinks, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment links:', error)
      return NextResponse.json(
        { error: 'Ошибка получения платежных ссылок' },
        { status: 500 }
      )
    }

    // Добавляем URL для каждой ссылки
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tgwallet-ei8z.vercel.app'
    const linksWithUrls = paymentLinks.map(link => ({
      ...link,
      payment_url: `${baseUrl}/pay/${link.id}`
    }))

    return NextResponse.json({
      success: true,
      payment_links: linksWithUrls
    })

  } catch (error) {
    console.error('Get payment links error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
