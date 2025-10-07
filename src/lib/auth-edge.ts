// Edge-compatible auth utilities
// This version doesn't use Node.js specific modules

export interface AuthUser {
  id: string
  email?: string
  telegram_id?: number
  first_name: string
  last_name?: string
  username?: string
}

// Simple token generation for Edge Runtime
export function generateSimpleToken(user: AuthUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    telegram_id: user.telegram_id,
    first_name: user.first_name,
    last_name: user.last_name,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  }
  
  // Simple base64 encoding (not secure for production, but works for Edge)
  return btoa(JSON.stringify(payload))
}

// Simple token verification for Edge Runtime
export function verifySimpleToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token))
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return {
      id: payload.id,
      email: payload.email,
      telegram_id: payload.telegram_id,
      first_name: payload.first_name,
      last_name: payload.last_name
    }
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}
