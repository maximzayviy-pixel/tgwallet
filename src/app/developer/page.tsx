'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Code, BarChart3, Settings, Plus, ExternalLink, Zap, Shield, Star } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { verifySimpleToken } from '@/lib/auth-edge'
import DeveloperNavigation from '@/components/DeveloperNavigation'

export default function DeveloperPage() {
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
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/payments/my-links', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        const links = data.payment_links
        setStats({
          totalPayments: links.length,
          totalAmount: links.reduce((sum: number, link: { amount: number }) => sum + link.amount, 0),
          activeLinks: links.filter((link: { status: string }) => link.status === 'pending').length,
          completedPayments: links.filter((link: { status: string }) => link.status === 'completed').length
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Проверка авторизации...</p>
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
              Добро пожаловать, {user.first_name}!
            </h1>
            <p className="text-white/70 text-lg">
              Панель разработчика Stellex Pay
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark p-6 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.totalPayments}</span>
              </div>
              <h3 className="text-white/70 font-medium">Всего платежей</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark p-6 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {stats.totalAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <h3 className="text-white/70 font-medium">Общая сумма</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-dark p-6 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.activeLinks}</span>
              </div>
              <h3 className="text-white/70 font-medium">Активные ссылки</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-dark p-6 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.completedPayments}</span>
              </div>
              <h3 className="text-white/70 font-medium">Завершенные</h3>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark p-8 rounded-2xl shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Быстрые действия</h2>
              <div className="space-y-4">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/developer/payments"
                  className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Plus className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Создать платежную ссылку</h3>
                    <p className="text-white/70 text-sm">Создайте новую ссылку для приема платежей</p>
                  </div>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/developer/docs"
                  className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Code className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Документация API</h3>
                    <p className="text-white/70 text-sm">Изучите возможности интеграции</p>
                  </div>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/developer/analytics"
                  className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Аналитика</h3>
                    <p className="text-white/70 text-sm">Просмотрите статистику платежей</p>
                  </div>
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark p-8 rounded-2xl shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Возможности</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-white font-bold">Безопасность</h3>
                    <p className="text-white/70 text-sm">Все платежи защищены современными методами шифрования</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="text-white font-bold">Быстрая интеграция</h3>
                    <p className="text-white/70 text-sm">Начните принимать платежи за несколько минут</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ExternalLink className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-white font-bold">Webhook уведомления</h3>
                    <p className="text-white/70 text-sm">Получайте уведомления о статусе платежей в реальном времени</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Code className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-white font-bold">Гибкая настройка</h3>
                    <p className="text-white/70 text-sm">Настраивайте кнопки и интеграции под ваши нужды</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-dark p-8 rounded-2xl shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Последняя активность</h2>
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Пока нет активности</h3>
              <p className="text-white/70 mb-6">Создайте первую платежную ссылку, чтобы увидеть активность здесь</p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/developer/payments"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Создать ссылку</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}