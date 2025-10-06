import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/transfer - Перевод между пользователями
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from_card_id, to_card_number, amount, api_key, description } = body

    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!from_card_id || !to_card_number || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transfer parameters' }, { status: 400 })
    }

    // Получаем карту отправителя
    const { data: fromCard, error: fromCardError } = await supabase
      .from('cards')
      .select('*, users!inner(telegram_id)')
      .eq('id', from_card_id)
      .single()

    if (fromCardError || !fromCard) {
      return NextResponse.json({ error: 'Sender card not found' }, { status: 404 })
    }

    if (fromCard.balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
    }

    if (fromCard.status !== 'active') {
      return NextResponse.json({ error: 'Sender card is not active' }, { status: 400 })
    }

    // Получаем карту получателя
    const { data: toCard, error: toCardError } = await supabase
      .from('cards')
      .select('*, users!inner(telegram_id)')
      .eq('card_number', to_card_number)
      .single()

    if (toCardError || !toCard) {
      return NextResponse.json({ error: 'Recipient card not found' }, { status: 404 })
    }

    if (toCard.status !== 'active') {
      return NextResponse.json({ error: 'Recipient card is not active' }, { status: 400 })
    }

    if (fromCard.id === toCard.id) {
      return NextResponse.json({ error: 'Cannot transfer to the same card' }, { status: 400 })
    }

    // Создаем транзакции
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Транзакция списания
    const { data: debitTransaction, error: debitError } = await supabase
      .from('transactions')
      .insert({
        card_id: fromCard.id,
        user_id: fromCard.user_id,
        type: 'transfer_out',
        amount: -amount,
        description: `Transfer to ${toCard.card_number.slice(-4)}${description ? `: ${description}` : ''}`,
        status: 'pending',
        external_id: transferId
      })
      .select('*')
      .single()

    if (debitError) {
      return NextResponse.json({ error: 'Failed to create debit transaction' }, { status: 500 })
    }

    // Транзакция зачисления
    const { data: creditTransaction, error: creditError } = await supabase
      .from('transactions')
      .insert({
        card_id: toCard.id,
        user_id: toCard.user_id,
        type: 'transfer_in',
        amount: amount,
        description: `Transfer from ${fromCard.card_number.slice(-4)}${description ? `: ${description}` : ''}`,
        status: 'pending',
        external_id: transferId
      })
      .select('*')
      .single()

    if (creditError) {
      return NextResponse.json({ error: 'Failed to create credit transaction' }, { status: 500 })
    }

    // Обновляем балансы
    const { error: updateFromError } = await supabase
      .from('cards')
      .update({ 
        balance: fromCard.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', fromCard.id)

    if (updateFromError) {
      return NextResponse.json({ error: 'Failed to update sender balance' }, { status: 500 })
    }

    const { error: updateToError } = await supabase
      .from('cards')
      .update({ 
        balance: toCard.balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', toCard.id)

    if (updateToError) {
      return NextResponse.json({ error: 'Failed to update recipient balance' }, { status: 500 })
    }

    // Обновляем статусы транзакций
    await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', debitTransaction.id)

    await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', creditTransaction.id)

    return NextResponse.json({ 
      success: true, 
      transfer_id: transferId,
      from_balance: fromCard.balance - amount,
      to_balance: toCard.balance + amount
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
