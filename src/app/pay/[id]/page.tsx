'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Clock, CheckCircle, XCircle, Star } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface PaymentData {
  payment_id: string
  amount: number
  currency: string
  description: string
  status: string
  expires_at: string
  created_at: string
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  const { user, isWebMode } = useAuth()
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadPaymentData()
  }, [params.id])

  const loadPaymentData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/payments/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setPayment(data)
      } else {
        setError(data.error || 'Ошибка загрузки платежа')
      }
    } catch (error) {
      setError('Ошибка соединения')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!user) {
      // Перенаправляем на логин
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.href)}`
      return
    }

    setIsProcessing(true)
    
    try {
      // Здесь можно добавить логику обработки платежа
      // Например, списание с карты пользователя
      
      // Показываем успех
      setPayment(prev => prev ? { ...prev, status: 'completed' } : null)
      
      // Перенаправляем на return_url если есть
      if (payment?.return_url) {
        setTimeout(() => {
          window.location.href = payment.return_url
        }, 2000)
      }
    } catch (error) {
      setError('Ошибка обработки платежа')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Загрузка платежа...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Ошибка</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!payment) return null

  const isExpired = new Date(payment.expires_at) < new Date()
  const isCompleted = payment.status === 'completed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Stellex Pay</h1>
          <p className="text-white/70">Безопасная оплата</p>
        </div>

        {/* Payment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark p-6 rounded-2xl shadow-2xl mb-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              {payment.description}
            </h2>
            <div className="text-3xl font-bold text-white mb-2">
              {payment.amount.toLocaleString('ru-RU')} {payment.currency}
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/70">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Истекает: {new Date(payment.expires_at).toLocaleString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Status */}
          {isExpired && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 text-center mb-6">
              <XCircle className="w-6 h-6 mx-auto mb-2" />
              Платеж истек
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-300 text-center mb-6">
              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
              Платеж успешно выполнен!
            </div>
          )}

          {/* Payment Button */}
          {!isExpired && !isCompleted && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={isProcessing || !user}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Обработка...
                </div>
              ) : !user ? (
                'Войти для оплаты'
              ) : (
                'ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY'
              )}
            </motion.button>
          )}

          {/* User Info */}
          {user && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                  </span>
                </div>
                <div>
                  <div className="text-white font-bold">
                    {user.first_name} {user.last_name || ''}
                  </div>
                  <div className="text-white/70 text-sm">
                    {user.email || `ID: ${user.telegram_id}`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center text-white/50 text-sm">
          <p>Защищено Stellex Pay</p>
          <p>ID платежа: {payment.payment_id}</p>
        </div>
      </div>
    </div>
  )
}
