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
    const { user_id, holder_name, api_key } = body

    console.log('Card creation request:', { user_id, holder_name, api_key })

    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!user_id || !holder_name) {
      return NextResponse.json({ error: 'user_id and holder_name required' }, { status: 400 })
    }

    // Проверяем, настроен ли Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')) {
      console.log('Supabase not configured, creating mock card')
      
      // Создаем mock карту для тестирования
      const mockCard = {
        id: generateId(),
        user_id: user_id,
        card_number: generateCardNumber(),
        holder_name: holder_name.toUpperCase(),
        expiry_date: generateExpiryDate(),
        cvv: generateCVV(),
        balance: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json(mockCard)
    }

    // Проверяем лимит карт (максимум 3)
    const { data: existingCards, error: cardsCountError } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', user_id)

    console.log('Cards count check:', { existingCards, cardsCountError })

    if (cardsCountError) {
      console.error('Cards count error:', cardsCountError)
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
        user_id: user_id,
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
      console.error('Card creation error:', cardError)
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }

    // Создаем транзакцию
    await supabase
      .from('transactions')
      .insert({
        card_id: card.id,
        user_id: user_id,
        type: 'card_creation',
        amount: 0,
        description: 'Card created',
        status: 'completed'
      })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Card creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Вспомогательные функции
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function generateCardNumber(): string {
  let cardNumber = '666' // Stellex Bank prefix
  for (let i = 0; i < 13; i++) {
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
