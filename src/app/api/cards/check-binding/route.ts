import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/cards/check-binding - Проверка привязки карты к сервису
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { binding_token, api_key } = body

    if (!api_key) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    if (!binding_token) {
      return NextResponse.json({ error: 'Binding token required' }, { status: 400 })
    }

    // Проверяем привязку карты
    const { data: binding, error: bindingError } = await supabase
      .from('card_service_bindings')
      .select('*, cards!inner(*, users!inner(*))')
      .eq('binding_token', binding_token)
      .eq('status', 'active')
      .single()

    if (bindingError || !binding) {
      return NextResponse.json({ error: 'Invalid or expired binding token' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      card_data: {
        id: binding.cards.id,
        number: binding.cards.card_number,
        holder_name: binding.cards.holder_name,
        expiry_date: binding.cards.expiry_date,
        balance: binding.cards.balance,
        status: binding.cards.status
      },
      user_data: {
        telegram_id: binding.cards.users.telegram_id,
        first_name: binding.cards.users.first_name
      },
      service_data: {
        name: binding.service_name,
        url: binding.service_url,
        bound_at: binding.created_at
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
