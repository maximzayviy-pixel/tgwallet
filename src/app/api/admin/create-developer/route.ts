import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, generateToken } from '@/lib/auth'
import { generateId } from '@/lib/cardUtils'

export async function POST(request: NextRequest) {
  try {
    // Проверяем, что это админ
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 401 }
      )
    }

    // Здесь можно добавить проверку, что пользователь - админ
    // Пока пропускаем эту проверку

    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      username 
    } = await request.json()

    if (!email || !password || !first_name) {
      return NextResponse.json(
        { error: 'Email, пароль и имя обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, что email не занят
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError)
      return NextResponse.json(
        { error: 'Ошибка проверки пользователя' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      )
    }

    // Создаем нового разработчика
    const hashedPassword = await hashPassword(password)
    const userId = generateId()

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        username,
        email_verified: true, // Разработчики сразу верифицированы
        telegram_id: null, // У разработчиков нет Telegram ID
        is_premium: true, // Разработчики имеют премиум доступ
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating developer:', userError)
      return NextResponse.json(
        { error: 'Ошибка создания разработчика' },
        { status: 500 }
      )
    }

    // Генерируем токен для разработчика
    const developerToken = generateToken({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      telegram_id: user.telegram_id
    })

    return NextResponse.json({
      success: true,
      message: 'Разработчик успешно создан',
      developer: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      },
      token: developerToken
    })

  } catch (error) {
    console.error('Create developer error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
