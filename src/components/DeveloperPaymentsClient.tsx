'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Copy, ExternalLink, Code, Settings, CreditCard, X } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface PaymentLink {
  id: string
  amount: number
  currency: string
  description: string
  status: string
  created_at: string
  expires_at: string
  payment_url: string
}

export default function DeveloperPaymentsClient() {
  const { user } = useAuth()
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPayment, setNewPayment] = useState({
    amount: '',
    description: '',
    return_url: '',
    webhook_url: '',
    currency: 'RUB',
    expires_in: 3600
  })

  useEffect(() => {
    if (user) {
      loadPaymentLinks()
    }
  }, [user])

  const loadPaymentLinks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/payments/my-links')
      if (response.ok) {
        const data = await response.json()
        setPaymentLinks(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки ссылок:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPaymentLink = async () => {
    try {
      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPayment),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentLinks([...paymentLinks, data])
        setShowCreateModal(false)
        setNewPayment({
          amount: '',
          description: '',
          return_url: '',
          webhook_url: '',
          currency: 'RUB',
          expires_in: 3600
        })
      }
    } catch (error) {
      console.error('Ошибка создания ссылки:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Платежные ссылки</h1>
            <p className="text-gray-300">Создавайте и управляйте платежными ссылками</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Создать ссылку</span>
          </button>
        </div>

        {/* Payment Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentLinks.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-semibold">
                    {link.amount} {link.currency}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  link.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {link.status === 'active' ? 'Активна' : 'Неактивна'}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-4">{link.description}</p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={link.payment_url}
                    readOnly
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(link.payment_url)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 text-white" />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(link.payment_url, '_blank')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center space-x-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Открыть</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-400 text-xs">
                  Создана: {new Date(link.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-400 text-xs">
                  Истекает: {new Date(link.expires_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {paymentLinks.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет платежных ссылок</h3>
            <p className="text-gray-300 mb-6">Создайте свою первую платежную ссылку</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Создать ссылку
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Создать платежную ссылку</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Сумма
                </label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание
                </label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  placeholder="Оплата за товар"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL возврата
                </label>
                <input
                  type="url"
                  value={newPayment.return_url}
                  onChange={(e) => setNewPayment({ ...newPayment, return_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  placeholder="https://example.com/success"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={newPayment.webhook_url}
                  onChange={(e) => setNewPayment({ ...newPayment, webhook_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  placeholder="https://example.com/webhook"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={createPaymentLink}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Создать
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
