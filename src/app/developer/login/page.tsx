'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, AlertCircle, Code, ArrowLeft } from 'lucide-react'

export default function DeveloperLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login-edge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка входа')
        return
      }

      // Сохраняем токен
      localStorage.setItem('auth_token', data.token)
      
      // Перенаправляем в панель разработчика
      router.push('/developer')

    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark p-8 rounded-2xl shadow-modern-lg w-full max-w-md border border-purple-700/50"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient text-glow mb-2">
            Stellex Pay
          </h1>
          <p className="text-white/70">Панель разработчика</p>
        </div>

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться в банк</span>
        </motion.button>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white font-bold mb-2 text-sm">
              Email разработчика
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full modern-input pl-10 bg-white/10 border-white/20 text-white placeholder-white/70"
                placeholder="developer@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-white font-bold mb-2 text-sm">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full modern-input pl-10 bg-white/10 border-white/20 text-white placeholder-white/70"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-400 bg-red-900/30 p-3 rounded-lg"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Войти в панель разработчика</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <h3 className="text-white font-bold mb-2">Нет аккаунта разработчика?</h3>
          <p className="text-white/70 text-sm mb-3">
            Обратитесь к администратору для создания аккаунта разработчика.
          </p>
          <div className="text-white/60 text-xs">
            <p>• Создание платежных ссылок</p>
            <p>• Управление API ключами</p>
            <p>• Аналитика платежей</p>
            <p>• Конструктор кнопок</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
