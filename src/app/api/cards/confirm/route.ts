import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/cards/confirm - Подтверждение кода верификации
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { verification_id, verification_code, api_key } = body

    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!verification_id || !verification_code) {
      return NextResponse.json({ error: 'Missing verification data' }, { status: 400 })
    }

    // Проверяем код верификации
    const { data: verification, error: verificationError } = await supabase
      .from('card_verifications')
      .select('*, cards!inner(*, users!inner(*))')
      .eq('id', verification_id)
      .eq('verification_code', verification_code)
      .eq('status', 'pending')
      .single()

    if (verificationError || !verification) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Проверяем, не истек ли код
    const now = new Date()
    const expiresAt = new Date(verification.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    // Обновляем статус верификации
    const { error: updateError } = await supabase
      .from('card_verifications')
      .update({ 
        status: 'confirmed',
        confirmed_at: now.toISOString()
      })
      .eq('id', verification_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to confirm verification' }, { status: 500 })
    }

    // Создаем привязку карты к сервису
    const { data: binding, error: bindingError } = await supabase
      .from('card_service_bindings')
      .insert({
        card_id: verification.card_id,
        user_id: verification.user_id,
        service_name: verification.service_name,
        service_url: verification.service_url,
        binding_token: `bind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active'
      })
      .select('*')
      .single()

    if (bindingError) {
      return NextResponse.json({ error: 'Failed to create card binding' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      binding_token: binding.binding_token,
      card_data: {
        id: verification.cards.id,
        number: verification.cards.card_number,
        holder_name: verification.cards.holder_name,
        expiry_date: verification.cards.expiry_date,
        balance: verification.cards.balance
      },
      user_data: {
        telegram_id: verification.cards.users.telegram_id,
        first_name: verification.cards.users.first_name
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
