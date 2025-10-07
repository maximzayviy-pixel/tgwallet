import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Star, CreditCard, AlertCircle } from 'lucide-react'
import { Card } from '@/types'

interface TelegramStarsModalProps {
  cards: Card[]
  onTopUp: (data: {
    cardId: string
    starsAmount: number
  }) => Promise<void>
  onClose: () => void
  isLoading?: boolean
  showNotification: (message: string) => void
}

const TelegramStarsModal: React.FC<TelegramStarsModalProps> = ({
  cards,
  onTopUp,
  onClose,
  isLoading = false,
  showNotification
}) => {
  const [formData, setFormData] = useState({
    cardId: '',
    starsAmount: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.cardId) {
      newErrors.cardId = 'Выберите карту для пополнения'
    }

    if (!formData.starsAmount) {
      newErrors.starsAmount = 'Введите количество звезд'
    } else {
      const amount = parseInt(formData.starsAmount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.starsAmount = 'Количество звезд должно быть больше 0'
      } else if (amount > 10000) {
        newErrors.starsAmount = 'Максимум 10 000 звезд за раз'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const starsAmount = parseInt(formData.starsAmount)
      const rubAmount = starsAmount / 2 // 2 звезды = 1 рубль (как в вашем коде)

      const tg = window.Telegram?.WebApp
      const tgId = tg?.initDataUnsafe?.user?.id
      const bcId = (tg?.initDataUnsafe as any)?.business_connection_id || (tg?.initDataUnsafe as any)?.business?.id

      if (!tgId) {
        showNotification('Telegram ID не найден')
        return
      }

      // Показываем индикатор загрузки
      const overlay = document.createElement("div")
      overlay.className = "fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      overlay.innerHTML = '<div class="bg-white rounded-2xl px-6 py-4 text-center shadow animate-pulse">Готовим оплату…</div>'
      document.body.appendChild(overlay)

      try {
        // Создаем инвойс напрямую через Telegram WebApp API
        const invoiceData = {
          title: `Stellex: пополнение`,
          description: `Пополнение баланса на ${starsAmount} ⭐`,
          payload: JSON.stringify({
            amount_stars: starsAmount,
            amount_rub: rubAmount,
            user_id: tgId
          }),
          provider_token: '', // Для Telegram Stars не нужен provider token
          currency: 'XTR', // Telegram Stars currency
          prices: [
            {
              label: 'XTR',
              amount: starsAmount // Telegram Stars - без умножения на 100
            }
          ],
          start_parameter: `topup_${Date.now()}`,
          is_flexible: false,
          need_name: false,
          need_phone_number: false,
          need_email: false,
          need_shipping_address: false,
          send_phone_number_to_provider: false,
          send_email_to_provider: false
        }

        console.log('Creating invoice with data:', invoiceData)

        // Используем Telegram WebApp API для создания инвойса
        console.log('Telegram WebApp available:', {
          tg: !!tg,
          sendInvoice: !!tg?.sendInvoice,
          openInvoice: !!tg?.openInvoice
        })

        if (tg?.sendInvoice) {
          tg.sendInvoice({ invoice: invoiceData }, (status) => {
            console.log('Payment status:', status)
            if (status === 'paid') {
              showNotification('✅ Оплата прошла успешно!')
              onClose()
            } else if (status === 'cancelled') {
              showNotification('Оплата отменена')
            } else if (status === 'failed') {
              showNotification('Ошибка оплаты')
            }
          })
        } else if (tg?.openInvoice) {
          // Fallback на openInvoice если sendInvoice недоступен
          tg.openInvoice(JSON.stringify(invoiceData), (status) => {
            console.log('Payment status:', status)
            if (status === 'paid') {
              showNotification('✅ Оплата прошла успешно!')
              onClose()
            } else if (status === 'cancelled') {
              showNotification('Оплата отменена')
            } else if (status === 'failed') {
              showNotification('Ошибка оплаты')
            }
          })
        } else {
          // Fallback - создаем инвойс через бота
          console.log('Using bot fallback for invoice creation')
          const response = await fetch('/api/stars-invoice-bot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-init-data': tg?.initData || '',
            },
            body: JSON.stringify({
              amount_stars: starsAmount,
              tg_id: tgId,
              business_connection_id: bcId,
            }),
          })

          const data = await response.json()
          
          if (!response.ok || !data?.ok || !data?.link) {
            throw new Error(data?.error || 'INVOICE_FAILED')
          }

          // Открываем ссылку на бота
          if (tg?.openTelegramLink) {
            tg.openTelegramLink(data.link)
          } else {
            window.open(data.link, '_blank')
          }

          // Показываем уведомление
          const toast = document.createElement("div")
          toast.className = "fixed left-1/2 -translate-x-1/2 bottom-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl"
          toast.textContent = "Открой чат с ботом для оплаты"
          document.body.appendChild(toast)
          setTimeout(() => toast.remove(), 2000)

          onClose()
        }

      } catch (error) {
        console.error('Invoice creation error:', error)
        showNotification(error instanceof Error ? error.message : 'Ошибка формирования инвойса')
      } finally {
        overlay.remove()
      }

    } catch (error) {
      console.error('Top-up error:', error)
      showNotification('Ошибка при создании инвойса')
    }
  }

  const handlePaymentSuccess = async (cardId: string, starsAmount: number, rubAmount: number) => {
    try {
      // Отправляем данные об успешной оплате
      const response = await fetch('/api/telegram-stars/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: cardId,
          stars_amount: starsAmount,
          rub_amount: rubAmount,
          user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id
        }),
      })

      if (response.ok) {
        showNotification(`Карта пополнена на ${rubAmount} ₽!`)
        setFormData({ cardId: '', starsAmount: '' })
        setErrors({})
        onClose()
      } else {
        throw new Error('Failed to process payment')
      }
    } catch (error) {
      console.error('Payment success error:', error)
      showNotification('Ошибка при обработке платежа')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const activeCards = cards.filter(card => card.status === 'active')
  const rubAmount = formData.starsAmount ? parseInt(formData.starsAmount) / 2 : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-dark p-4 rounded-2xl shadow-modern-lg w-full max-w-sm my-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gradient text-glow">Пополнение через Telegram Stars</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Карта */}
          <div>
            <label className="block text-white font-bold mb-2 text-sm">Карта для пополнения</label>
            <select
              value={formData.cardId}
              onChange={(e) => handleInputChange('cardId', e.target.value)}
              className={`w-full modern-input ${errors.cardId ? 'border-red-500' : ''}`}
              disabled={isLoading}
            >
              <option value="">Выберите карту</option>
              {activeCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.card_number.slice(-4)} - {card.balance.toLocaleString('ru-RU')} ₽
                </option>
              ))}
            </select>
            {errors.cardId && (
              <div className="flex items-center space-x-2 mt-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.cardId}</span>
              </div>
            )}
          </div>

          {/* Количество звезд */}
          <div>
            <label className="block text-white font-bold mb-3">Количество звезд</label>
            <input
              type="number"
              value={formData.starsAmount}
              onChange={(e) => handleInputChange('starsAmount', e.target.value)}
              placeholder="100"
              className={`w-full modern-input ${errors.starsAmount ? 'border-red-500' : ''}`}
              disabled={isLoading}
              min="1"
              max="10000"
            />
            {errors.starsAmount && (
              <div className="flex items-center space-x-2 mt-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.starsAmount}</span>
              </div>
            )}
          </div>

          {/* Конвертация */}
          {rubAmount > 0 && (
            <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold">{formData.starsAmount} ⭐</div>
                    <div className="text-white/70 text-sm">Telegram Stars</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{rubAmount.toLocaleString('ru-RU')} ₽</div>
                  <div className="text-white/70 text-sm">К зачислению</div>
                </div>
              </div>
            </div>
          )}

          {/* Информация о курсе */}
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <div className="text-white/80 text-sm text-center">
              Курс: 2 ⭐ = 1 ₽
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-4 px-6 rounded-2xl glass-dark text-white font-bold hover:glass transition-all duration-300"
              disabled={isLoading}
            >
              Отмена
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 btn-modern font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Пополнение...</span>
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  <span>Пополнить</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default TelegramStarsModal
