import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySimpleToken } from '@/lib/auth-edge'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Проверяем, если это страница разработчика
  if (pathname.startsWith('/developer') && pathname !== '/developer/login') {
    // Проверяем токен в заголовках или localStorage
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      // Перенаправляем на страницу входа
      return NextResponse.redirect(new URL('/developer/login', request.url))
    }

    // Проверяем токен
    const user = verifySimpleToken(token)
    if (!user) {
      return NextResponse.redirect(new URL('/developer/login', request.url))
    }
  }

  // Проверяем, если это страница админа
  if (pathname.startsWith('/admin')) {
    // Для админа пока оставляем проверку ключа
    // Можно добавить JWT проверку позже
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/developer/:path*',
    '/admin/:path*'
  ]
}
