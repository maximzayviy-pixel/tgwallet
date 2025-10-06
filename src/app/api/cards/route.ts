import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/cards - Получить карты пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegram_id')
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

    // Получаем карты пользователя
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (cardsError) {
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    return NextResponse.json({ cards })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cards - Создать новую карту
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegram_id, holder_name, api_key } = body

    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!telegram_id || !holder_name) {
      return NextResponse.json({ error: 'telegram_id and holder_name required' }, { status: 400 })
    }

    // Получаем или создаем пользователя
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegram_id)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // Пользователь не найден, создаем нового
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          telegram_id,
          first_name: holder_name.split(' ')[0] || 'User',
          last_name: holder_name.split(' ').slice(1).join(' ') || null
        })
        .select('id')
        .single()

      if (createUserError || !newUser) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      user = newUser
    } else if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем лимит карт (максимум 3)
    const { data: existingCards, error: cardsCountError } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', user.id)

    if (cardsCountError) {
      return NextResponse.json({ error: 'Failed to check card limit' }, { status: 500 })
    }

    if (existingCards && existingCards.length >= 3) {
      return NextResponse.json({ error: 'Maximum 3 cards allowed per user' }, { status: 400 })
    }

    // Генерируем данные карты
    const cardNumber = generateCardNumber()
    const expiryDate = generateExpiryDate()
    const cvv = generateCVV()

    // Создаем карту
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        user_id: user.id,
        card_number: cardNumber,
        holder_name: holder_name.toUpperCase(),
        expiry_date: expiryDate,
        cvv,
        balance: 0,
        status: 'active'
      })
      .select('*')
      .single()

    if (cardError) {
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }

    // Создаем транзакцию
    await supabase
      .from('transactions')
      .insert({
        card_id: card.id,
        user_id: user.id,
        type: 'card_creation',
        amount: 0,
        description: 'Card created',
        status: 'completed'
      })

    return NextResponse.json({ card })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Вспомогательные функции
function generateCardNumber(): string {
  let cardNumber = '4' // Stellex Bank prefix
  for (let i = 0; i < 15; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString()
  }
  return cardNumber
}

function generateExpiryDate(): string {
  const now = new Date()
  const year = now.getFullYear() + 3
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${month}/${year.toString().slice(-2)}`
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString()
}
