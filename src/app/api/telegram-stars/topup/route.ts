import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/telegram-stars/topup - Пополнение через Telegram Stars
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_id, stars_amount, api_key, telegram_user_id } = body

    // Проверяем API ключ (если не передан, используем дефолтный)
    const expectedApiKey = process.env.API_KEY || 'test_key'
    if (api_key && api_key !== expectedApiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    if (!card_id || !stars_amount || stars_amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Конвертируем Telegram Stars в рубли (1 звезда = 1 рубль)
    const rubAmount = stars_amount * 1

    // Проверяем, настроен ли Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      console.log('Supabase not configured, creating mock transaction')
      
      // Создаем mock транзакцию
      const mockTransaction = {
        id: `stars_${Date.now()}`,
        card_id: card_id,
        user_id: 'mock_user_id',
        type: 'telegram_stars_topup',
        amount: rubAmount,
        description: `Top-up via Telegram Stars (${stars_amount} ⭐)`,
        status: 'completed',
        external_id: `stars_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json({ 
        success: true, 
        transaction_id: mockTransaction.id,
        stars_amount: stars_amount,
        rub_amount: rubAmount,
        new_balance: rubAmount // Mock баланс
      })
    }

    // Получаем карту
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*, users!inner(telegram_id)')
      .eq('id', card_id)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.status !== 'active') {
      return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
    }

    // Проверяем, что карта принадлежит пользователю
    if (telegram_user_id && card.users.telegram_id !== telegram_user_id) {
      return NextResponse.json({ error: 'Card does not belong to user' }, { status: 403 })
    }

    // Создаем транзакцию
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        card_id: card_id,
        user_id: card.user_id,
        type: 'telegram_stars_topup',
        amount: rubAmount,
        description: `Top-up via Telegram Stars (${stars_amount} ⭐)`,
        status: 'pending',
        external_id: `stars_${Date.now()}`
      })
      .select('*')
      .single()

    if (transactionError) {
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // Обновляем баланс карты
    const { error: updateError } = await supabase
      .from('cards')
      .update({ 
        balance: card.balance + rubAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', card_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    // Обновляем статус транзакции
    await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id)

    return NextResponse.json({ 
      success: true, 
      transaction_id: transaction.id,
      stars_amount: stars_amount,
      rub_amount: rubAmount,
      new_balance: card.balance + rubAmount
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
