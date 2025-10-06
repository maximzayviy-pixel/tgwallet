import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/transactions - Получить историю транзакций
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegram_id')
    const cardId = searchParams.get('card_id')
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!telegramId) {
      return NextResponse.json({ error: 'telegram_id required' }, { status: 400 })
    }

    // Получаем пользователя
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Строим запрос
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (cardId) {
      query = query.eq('card_id', cardId)
    }

    const { data: transactions, error: transactionsError } = await query

    if (transactionsError) {
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
