'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Wallet, History, Settings, Star, Shield, Zap } from 'lucide-react';
import VirtualCard from '@/components/VirtualCard';
import CardCreationForm from '@/components/CardCreationForm';
import TopUpModal from '@/components/TopUpModal';
import { Card, CardCreationData, TopUpData, User } from '@/types';
import { createCard, generateId } from '@/lib/cardUtils';
import { 
  initTelegramWebApp, 
  setupTelegramTheme, 
  getTelegramUser, 
  showNotification,
  hapticFeedback 
} from '@/lib/telegramUtils';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'history' | 'settings'>('cards');

  // Инициализация при загрузке
  useEffect(() => {
    initTelegramWebApp();
    setupTelegramTheme();
    
    // Получаем данные пользователя из Telegram
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      const newUser: User = {
        id: generateId(),
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        cards: [],
        totalSpent: 0,
        createdAt: new Date()
      };
      setUser(newUser);
    }

    // Загружаем карты из localStorage (в реальном приложении - с сервера)
    const savedCards = localStorage.getItem('userCards');
    if (savedCards) {
      setCards(JSON.parse(savedCards));
    }
  }, []);

  // Сохраняем карты в localStorage при изменении
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('userCards', JSON.stringify(cards));
    }
  }, [cards]);

  const handleCreateCard = async (data: CardCreationData) => {
    setIsLoading(true);
    hapticFeedback('medium');

    try {
      // Симуляция создания карты
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newCard: Card = {
        id: generateId(),
        ...createCard(data.type, data.holderName),
        createdAt: new Date()
      };

      setCards(prev => [...prev, newCard]);
      setShowCreateForm(false);
      showNotification('Карта успешно создана!', 'success');
    } catch {
      showNotification('Ошибка при создании карты', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async (data: TopUpData) => {
    setIsLoading(true);
    hapticFeedback('medium');

    try {
      // Симуляция пополнения
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCards(prev => prev.map(card => 
        card.id === data.cardId 
          ? { ...card, balance: card.balance + data.amount }
          : card
      ));

      setShowTopUpModal(false);
      setSelectedCard(null);
      showNotification('Карта успешно пополнена!', 'success');
    } catch {
      showNotification('Ошибка при пополнении карты', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleCardAction = (card: Card, action: string) => {
  //   hapticFeedback('light');
  //   
  //   switch (action) {
  //     case 'topup':
  //       setSelectedCard(card);
  //       setShowTopUpModal(true);
  //       break;
  //     case 'history':
  //       // Переход к истории операций
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const activeCards = cards.filter(card => card.status === 'active');

  return (
    <div className="min-h-screen gradient-bg-dark text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 glass-dark border-b border-white/10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-bold text-gradient text-glow">Виртуальные карты</h1>
              <p className="text-white/70 text-sm mt-1">
                {user ? `Привет, ${user.firstName}! 👋` : 'Загрузка...'}
              </p>
            </div>
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <div className="text-right">
                <div className="text-white/60 text-sm font-medium">Общий баланс</div>
                <div className="text-2xl font-bold text-gradient text-glow">
                  {totalBalance.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div className="p-3 glass rounded-2xl glow-blue">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-4 gap-2">
          {[
            { id: 'cards', label: 'Карты', icon: CreditCard },
            { id: 'history', label: 'История', icon: History },
            { id: 'settings', label: 'Настройки', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'cards' | 'history' | 'settings')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'glass glow-blue text-white scale-105'
                  : 'glass-dark text-white/60 hover:text-white hover:scale-105'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.div 
                  className="modern-card p-6 glow-blue"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 gradient-accent rounded-2xl flex items-center justify-center shadow-modern">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{activeCards.length}</div>
                      <div className="text-white/70 text-sm font-medium">Активных карт</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="modern-card p-6 glow-purple"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-modern">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {Math.ceil(totalBalance / 10)}
                      </div>
                      <div className="text-white/70 text-sm font-medium">Telegram Stars</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Create Card Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(true)}
                className="w-full btn-modern text-lg font-bold flex items-center justify-center space-x-4 shadow-modern-lg relative overflow-hidden"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span>Выпустить новую карту</span>
                  <div className="glass rounded-full px-4 py-2 text-sm font-semibold">
                    1 999 ₽
                  </div>
                </div>
              </motion.button>

              {/* Cards List */}
              {cards.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-6 glow-blue animate-float">
                    <CreditCard className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 text-gradient">У вас пока нет карт</h3>
                  <p className="text-white/70 mb-8 text-lg">
                    Создайте свою первую виртуальную карту
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateForm(true)}
                    className="btn-modern px-8 py-4 text-lg font-bold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Создать карту
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <VirtualCard
                        card={card}
                        onCopy={(text) => {
                          navigator.clipboard.writeText(text);
                          showNotification('Скопировано в буфер обмена');
                        }}
                        onToggleVisibility={() => hapticFeedback('light')}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mt-12">
                <motion.div 
                  className="modern-card p-6 text-center glow-blue"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-modern">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-bold mb-2 text-lg">Безопасно</div>
                  <div className="text-white/70 text-sm">256-bit шифрование</div>
                </motion.div>
                <motion.div 
                  className="modern-card p-6 text-center glow-purple"
                  whileHover={{ scale: 1.05, rotateY: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-modern">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-bold mb-2 text-lg">Мгновенно</div>
                  <div className="text-white/70 text-sm">Выпуск за секунды</div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">История операций</h3>
                <p className="text-gray-400">
                  Здесь будет отображаться история ваших операций
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Настройки</h3>
                <p className="text-gray-400">
                  Здесь будут настройки приложения
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardCreationForm
                onSubmit={handleCreateCard}
                onCancel={() => setShowCreateForm(false)}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
        )}

        {showTopUpModal && selectedCard && (
          <TopUpModal
            card={selectedCard}
            onTopUp={handleTopUp}
            onClose={() => {
              setShowTopUpModal(false);
              setSelectedCard(null);
            }}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}