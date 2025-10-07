'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Code, BarChart3, Settings, Plus, ExternalLink, Zap, Shield, Star } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { verifySimpleToken } from '@/lib/auth-edge'
import DeveloperNavigation from '@/components/DeveloperNavigation'

export default function DeveloperPageClient() {
  const { user } = useAuth()
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; first_name: string; last_name?: string; username?: string } | null>(null)
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    activeLinks: 0,
    completedPayments: 0
  })

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('auth_token')
    if (!token) {
      window.location.href = '/developer/login'
      return
    }

    // Проверяем токен
    const user = verifySimpleToken(token)
    if (!user) {
      localStorage.removeItem('auth_token')
      window.location.href = '/developer/login'
      return
    }

    setCurrentUser(user)
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/developer/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <DeveloperNavigation />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Добро пожаловать, {currentUser.first_name}!
            </h1>
            <p className="text-gray-300">
              Управляйте своими платежными ссылками и отслеживайте статистику
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Всего платежей</p>
                  <p className="text-2xl font-bold text-white">{stats.totalPayments}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Общая сумма</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAmount} ₽</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Активные ссылки</p>
                  <p className="text-2xl font-bold text-white">{stats.activeLinks}</p>
                </div>
                <ExternalLink className="h-8 w-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Завершенные</p>
                  <p className="text-2xl font-bold text-white">{stats.completedPayments}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={() => window.location.href = '/developer/payments'}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Создать платеж</h3>
                  <p className="text-gray-300 text-sm">Новая платежная ссылка</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={() => window.location.href = '/developer/button-builder'}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Code className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Конструктор кнопок</h3>
                  <p className="text-gray-300 text-sm">Настройте дизайн кнопки</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={() => window.location.href = '/developer/docs'}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Settings className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Документация</h3>
                  <p className="text-gray-300 text-sm">API и интеграция</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
