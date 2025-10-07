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

export default function DeveloperPaymentsPage() {
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
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/payments/my-links', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPaymentLinks(data.payment_links)
      }
    } catch (error) {
      console.error('Error loading payment links:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPayment)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPaymentLinks(prev => [data, ...prev])
        setShowCreateModal(false)
        setNewPayment({
          amount: '',
          description: '',
          return_url: '',
          webhook_url: '',
          currency: 'RUB',
          expires_in: 3600
        })
      } else {
        alert(data.error || 'Ошибка создания платежной ссылки')
      }
    } catch (error) {
      alert('Ошибка соединения')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Скопировано в буфер обмена!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'expired': return 'text-red-400'
      default: return 'text-white/70'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Оплачен'
      case 'pending': return 'Ожидает'
      case 'expired': return 'Истек'
      default: return status
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Загрузка...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Stellex Pay</h1>
            <p className="text-white/70">Управление платежными ссылками</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Создать ссылку
          </motion.button>
        </div>

        {/* Payment Links */}
        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">Загрузка платежных ссылок...</p>
            </div>
          ) : paymentLinks.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Нет платежных ссылок</h3>
              <p className="text-white/70 mb-6">Создайте первую ссылку для приема платежей</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                Создать ссылку
              </motion.button>
            </div>
          ) : (
            paymentLinks.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-dark p-6 rounded-2xl shadow-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {link.description}
                    </h3>
                    <div className="text-2xl font-bold text-white mb-2">
                      {link.amount.toLocaleString('ru-RU')} {link.currency}
                    </div>
                    <div className={`font-bold ${getStatusColor(link.status)}`}>
                      {getStatusText(link.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(link.payment_url)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      title="Копировать ссылку"
                    >
                      <Copy className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => window.open(link.payment_url, '_blank')}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      title="Открыть ссылку"
                    >
                      <ExternalLink className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">ID платежа</label>
                    <div className="text-white font-mono text-sm bg-white/10 rounded-lg p-2">
                      {link.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Ссылка для оплаты</label>
                    <div className="text-white font-mono text-sm bg-white/10 rounded-lg p-2 break-all">
                      {link.payment_url}
                    </div>
                  </div>
                </div>

                <div className="text-white/70 text-sm">
                  Создано: {new Date(link.created_at).toLocaleString('ru-RU')}
                  {link.expires_at && (
                    <span className="ml-4">
                      Истекает: {new Date(link.expires_at).toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-dark p-6 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Создать платежную ссылку</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div>
                  <label className="block text-white font-bold mb-2">Сумма</label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">Описание</label>
                  <input
                    type="text"
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Оплата за товар"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">URL возврата (необязательно)</label>
                  <input
                    type="url"
                    value={newPayment.return_url}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, return_url: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="https://yoursite.com/success"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">Webhook URL (необязательно)</label>
                  <input
                    type="url"
                    value={newPayment.webhook_url}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, webhook_url: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="https://yoursite.com/webhook"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Создать
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
