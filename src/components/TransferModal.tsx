import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CreditCard, ArrowRight, AlertCircle } from 'lucide-react'

import { Card } from '@/types'

interface TransferModalProps {
  cards: Card[]
  onTransfer: (data: {
    fromCardId: string
    toCardNumber: string
    amount: number
    description: string
  }) => Promise<void>
  onClose: () => void
  isLoading?: boolean
  showNotification: (message: string) => void
}

const TransferModal: React.FC<TransferModalProps> = ({
  cards,
  onTransfer,
  onClose,
  isLoading = false,
  showNotification
}) => {
  const [formData, setFormData] = useState({
    fromCardId: '',
    toCardNumber: '',
    amount: '',
    description: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.fromCardId) {
      newErrors.fromCardId = 'Выберите карту для списания'
    }

    if (!formData.toCardNumber) {
      newErrors.toCardNumber = 'Введите номер карты получателя'
    } else if (!/^\d{16}$/.test(formData.toCardNumber.replace(/\s/g, ''))) {
      newErrors.toCardNumber = 'Неверный формат номера карты'
    }

    if (!formData.amount) {
      newErrors.amount = 'Введите сумму перевода'
    } else {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Сумма должна быть больше 0'
      } else if (amount > 100000) {
        newErrors.amount = 'Максимальная сумма перевода 100 000 ₽'
      } else {
        const selectedCard = cards.find(card => card.id === formData.fromCardId)
        if (selectedCard && amount > selectedCard.balance) {
          newErrors.amount = 'Недостаточно средств на карте'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onTransfer({
        fromCardId: formData.fromCardId,
        toCardNumber: formData.toCardNumber.replace(/\s/g, ''),
        amount: parseFloat(formData.amount),
        description: formData.description
      })
      
      showNotification('Перевод выполнен успешно')
      onClose()
    } catch (error) {
      showNotification('Ошибка при выполнении перевода')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(' ') : cleaned
  }

  const activeCards = cards.filter(card => card.status === 'active')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-dark p-8 rounded-3xl shadow-modern-lg w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gradient text-glow">Перевод средств</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Карта отправителя */}
          <div>
            <label className="block text-white font-bold mb-3">С карты</label>
            <select
              value={formData.fromCardId}
              onChange={(e) => handleInputChange('fromCardId', e.target.value)}
              className={`w-full modern-input ${errors.fromCardId ? 'border-red-500' : ''}`}
              disabled={isLoading}
            >
              <option value="">Выберите карту</option>
              {activeCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.card_number.slice(-4)} - {card.balance.toLocaleString('ru-RU')} ₽
                </option>
              ))}
            </select>
            {errors.fromCardId && (
              <div className="flex items-center space-x-2 mt-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.fromCardId}</span>
              </div>
            )}
          </div>

          {/* Стрелка */}
          <div className="flex justify-center">
            <div className="p-2 bg-white/20 rounded-full">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Карта получателя */}
          <div>
            <label className="block text-white font-bold mb-3">На карту</label>
            <input
              type="text"
              value={formData.toCardNumber}
              onChange={(e) => handleInputChange('toCardNumber', formatCardNumber(e.target.value))}
              placeholder="6666 1234 5678 9012"
              className={`w-full modern-input ${errors.toCardNumber ? 'border-red-500' : ''}`}
              disabled={isLoading}
              maxLength={19}
            />
            {errors.toCardNumber && (
              <div className="flex items-center space-x-2 mt-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.toCardNumber}</span>
              </div>
            )}
          </div>

          {/* Сумма */}
          <div>
            <label className="block text-white font-bold mb-3">Сумма</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="1000"
              className={`w-full modern-input ${errors.amount ? 'border-red-500' : ''}`}
              disabled={isLoading}
              min="1"
              max="100000"
            />
            {errors.amount && (
              <div className="flex items-center space-x-2 mt-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.amount}</span>
              </div>
            )}
          </div>

          {/* Описание */}
          <div>
            <label className="block text-white font-bold mb-3">Описание (необязательно)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="За что перевод"
              className="w-full modern-input"
              disabled={isLoading}
            />
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
                  <span>Перевод...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Перевести</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default TransferModal
