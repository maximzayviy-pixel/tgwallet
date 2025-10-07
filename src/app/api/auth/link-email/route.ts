import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, telegram_id } = await request.json()

    // Валидация
    if (!email || !password || !telegram_id) {
      return NextResponse.json(
        { error: 'Email, пароль и telegram_id обязательны' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь с таким email
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Находим пользователя по telegram_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    if (user.email) {
      return NextResponse.json(
        { error: 'Email уже привязан к этому аккаунту' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const password_hash = await hashPassword(password)

    // Обновляем пользователя
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email,
        password_hash,
        email_verified: false
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('User update error:', updateError)
      return NextResponse.json(
        { error: 'Ошибка обновления пользователя' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email успешно привязан к аккаунту',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        telegram_id: updatedUser.telegram_id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email_verified: updatedUser.email_verified
      }
    })

  } catch (error) {
    console.error('Link email error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
