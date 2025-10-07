'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Plus, Wallet, History, Settings, Star, LogOut, Mail } from 'lucide-react'
import VirtualCard from '@/components/VirtualCard'
import TopUpModal from '@/components/TopUpModal'
import TransferModal from '@/components/TransferModal'
import TelegramStarsModal from '@/components/TelegramStarsModal'
import CardDetailsModal from '@/components/CardDetailsModal'
import BottomNavigation from '@/components/BottomNavigation'
import EmailLinkModal from '@/components/EmailLinkModal'
import { Card, TopUpData, User } from '@/types'
import { createCard, generateId } from '@/lib/cardUtils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

export default function WebBankApp() {
  const { user, logout } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showTelegramStarsModal, setShowTelegramStarsModal] = useState(false)
  const [showEmailLinkModal, setShowEmailLinkModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [biometryEnabled, setBiometryEnabled] = useState(false)
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false)
  
  // Card details modal
  const [showCardDetailsModal, setShowCardDetailsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'cards' | 'history' | 'settings'>('cards')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Загружаем данные пользователя и карты
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Загружаем карты пользователя
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (cardsError) {
        console.error('Error loading cards:', cardsError)
      } else {
        setCards(cardsData || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCard = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          user_id: user.id,
          holder_name: `${user.first_name} ${user.last_name || ''}`.trim() || 'ПОЛЬЗОВАТЕЛЬ'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Обновляем список карт
        await loadUserData()
        showNotification('Карта успешно создана!')
      } else {
        showNotification(data.error || 'Ошибка создания карты')
      }
    } catch (error) {
      console.error('Error creating card:', error)
      showNotification('Ошибка создания карты')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopUp = (data: TopUpData) => {
    const card = cards.find(c => c.id === data.cardId)
    if (card) {
      setSelectedCard(card)
      setShowTopUpModal(true)
    }
  }

  const handleTransfer = async (data: { fromCardId: string; toCardNumber: string; amount: number }) => {
    // Здесь можно добавить логику обработки перевода
    console.log('Transfer:', data)
    showNotification('Перевод выполнен!')
  }

  const handleTelegramStarsTopUp = async (data: { cardId: string; starsAmount: number }) => {
    // Здесь можно добавить логику обработки пополнения звездами
    console.log('Telegram Stars TopUp:', data)
    showNotification('Пополнение звездами выполнено!')
  }

  const handleCardExpand = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (card) {
      setSelectedCard(card)
      setShowCardDetailsModal(true)
    }
  }

  const showNotification = (message: string) => {
    // Простое уведомление для веб-версии
    alert(message)
  }

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0)

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="p-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Stellex</h1>
            <p className="text-white/70">Веб-версия банка</p>
          </div>
          <div className="flex items-center space-x-3">
            {user.email && (
              <div className="flex items-center space-x-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
              </span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                {user.first_name} {user.last_name || ''}
              </h2>
              <p className="text-white/70 text-sm">
                {user.telegram_id ? `ID: ${user.telegram_id}` : 'Веб-пользователь'}
              </p>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 font-bold">Баланс</h3>
            <div className="flex items-center space-x-2 text-white/70">
              <Star className="w-4 h-4" />
              <span className="text-sm">Курс: 2 ⭐ = 1 ₽</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-4">
            {totalBalance.toLocaleString('ru-RU')} ₽
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateCard}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Создать карту
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTelegramStarsModal(true)}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300"
            >
              <Star className="w-5 h-5 inline mr-2" />
              Пополнить звездами
            </motion.button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 mb-6">
        <h3 className="text-white font-bold text-lg mb-4">Мои карты</h3>
        {cards.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 mb-4">У вас пока нет карт</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateCard}
              className="py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Создать первую карту
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <VirtualCard
                key={card.id}
                card={card}
                compact={true}
                onExpand={() => handleCardExpand(card.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <AnimatePresence>
        {showTopUpModal && selectedCard && (
          <TopUpModal
            card={selectedCard}
            onClose={() => {
              setShowTopUpModal(false)
              setSelectedCard(null)
            }}
            onTopUp={(data) => handleTopUp(data)}
          />
        )}

        {showTransferModal && selectedCard && (
          <TransferModal
            cards={cards}
            onClose={() => {
              setShowTransferModal(false)
              setSelectedCard(null)
            }}
            onTransfer={handleTransfer}
            showNotification={showNotification}
          />
        )}

        {showTelegramStarsModal && (
          <TelegramStarsModal
            cards={cards}
            onClose={() => {
              setShowTelegramStarsModal(false)
              setSelectedCard(null)
            }}
            onTopUp={handleTelegramStarsTopUp}
            showNotification={showNotification}
          />
        )}

        {showCardDetailsModal && selectedCard && (
          <CardDetailsModal
            card={selectedCard}
            onClose={() => {
              setShowCardDetailsModal(false)
              setSelectedCard(null)
            }}
            onTopUp={() => handleTopUp({ cardId: selectedCard.id, amount: 0, paymentMethod: 'card' })}
            onTransfer={() => setShowTransferModal(true)}
            onStarsTopUp={() => setShowTelegramStarsModal(true)}
          />
        )}

        {showEmailLinkModal && user.telegram_id && (
          <EmailLinkModal
            isOpen={showEmailLinkModal}
            onClose={() => setShowEmailLinkModal(false)}
            onSuccess={() => {
              showNotification('Email успешно привязан!')
              loadUserData()
            }}
            telegramId={user.telegram_id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
