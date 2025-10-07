import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/cards/[id]/topup - Пополнить карту
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { amount, api_key, external_id } = body
    const { id: cardId } = await params

    // Проверяем API ключ - только реальные ключи
    const expectedApiKey = process.env.API_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const isValidKey = api_key && (api_key === expectedApiKey || api_key === supabaseAnonKey)
    
    if (!isValidKey) {
      console.log('Invalid or missing API key')
      return NextResponse.json({ error: 'Valid API key required' }, { status: 401 })
    }
    
    console.log('API key accepted')

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    }

    // Проверяем, настроен ли Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      console.log('Supabase not configured, creating mock topup')
      
      // Создаем mock пополнение
      const mockTransaction = {
        id: `topup_${Date.now()}`,
        card_id: cardId,
        user_id: 'mock_user_id',
        type: 'topup',
        amount: amount,
        description: `Top-up via API${external_id ? ` (${external_id})` : ''}`,
        status: 'completed',
        external_id: external_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json({ 
        success: true, 
        transaction_id: mockTransaction.id,
        new_balance: amount // Mock баланс
      })
    }

    // Получаем карту
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*, users!inner(telegram_id)')
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Создаем транзакцию
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        card_id: cardId,
        user_id: card.user_id,
        type: 'topup',
        amount,
        description: `Top-up via API${external_id ? ` (${external_id})` : ''}`,
        status: 'pending',
        external_id
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
        balance: card.balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)

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
      new_balance: card.balance + amount
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
