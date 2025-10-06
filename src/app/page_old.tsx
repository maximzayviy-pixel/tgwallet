'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Wallet, History, Settings, Star, Shield, Zap } from 'lucide-react';
import VirtualCard from '@/components/VirtualCard';
import CardCreationForm from '@/components/CardCreationForm';
import TopUpModal from '@/components/TopUpModal';
import TransferModal from '@/components/TransferModal';
import TelegramStarsModal from '@/components/TelegramStarsModal';
import BottomNavigation from '@/components/BottomNavigation';
import SpaceLoader from '@/components/SpaceLoader';
import AccountCard from '@/components/AccountCard';
import QuickTransfer from '@/components/QuickTransfer';
import CustomizeScreen from '@/components/CustomizeScreen';
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
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTelegramStarsModal, setShowTelegramStarsModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'history' | 'settings'>('cards');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  
  // Mock data for accounts
  const accounts = [
    { id: '1', name: 'Текущий счёт', number: '--3109', balance: 16456, type: 'current' as const },
    { id: '2', name: 'Stellex-Счёт', number: '--1238', balance: 64000, type: 'savings' as const },
  ];
  
  // Mock data for contacts
  const contacts = [
    { id: '1', name: 'Вячеслав', phone: '+7 999 123-45-67' },
    { id: '2', name: 'Татьяна', phone: '+7 999 234-56-78' },
    { id: '3', name: 'Павел', phone: '+7 999 345-67-89' },
  ];

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

    // Завершаем загрузку приложения
    setTimeout(() => {
      setIsAppLoading(false);
    }, 3000);
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

  const handleTransfer = async (data: {
    fromCardId: string;
    toCardNumber: string;
    amount: number;
    description: string;
  }) => {
    setIsLoading(true);
    hapticFeedback('medium');

    try {
      // Симуляция перевода
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCards(prev => prev.map(card => 
        card.id === data.fromCardId 
          ? { ...card, balance: card.balance - data.amount }
          : card
      ));

      setShowTransferModal(false);
      showNotification('Перевод выполнен успешно!', 'success');
    } catch {
      showNotification('Ошибка при выполнении перевода', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTelegramStarsTopUp = async (data: {
    cardId: string;
    starsAmount: number;
  }) => {
    setIsLoading(true);
    hapticFeedback('medium');

    try {
      // Симуляция пополнения через Telegram Stars
      await new Promise(resolve => setTimeout(resolve, 1500));

      const rubAmount = data.starsAmount * 10; // 1 звезда = 10 рублей
      setCards(prev => prev.map(card => 
        card.id === data.cardId 
          ? { ...card, balance: card.balance + rubAmount }
          : card
      ));

      setShowTelegramStarsModal(false);
      showNotification('Пополнение через Telegram Stars выполнено!', 'success');
    } catch {
      showNotification('Ошибка при пополнении через Telegram Stars', 'error');
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
    <>
      {/* Space Loader */}
      <SpaceLoader 
        isLoading={isAppLoading} 
        onComplete={() => setIsAppLoading(false)} 
      />

      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {user ? user.firstName : 'Иван'}
                </div>
                <div className="text-sm text-gray-500">Stellex Bank</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 pb-20 space-y-6">
        {/* Accounts Section */}
        <div className="space-y-3">
          {accounts.map((account, index) => (
            <AccountCard
              key={account.id}
              id={account.id}
              name={account.name}
              number={account.number}
              balance={account.balance}
              type={account.type}
              isExpanded={expandedAccount === account.id}
              onToggle={() => setExpandedAccount(
                expandedAccount === account.id ? null : account.id
              )}
            />
          ))}
          
          <button className="w-full bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-left">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Все мои продукты</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Customize Screen */}
        <CustomizeScreen />

        {/* Quick Transfers */}
        <QuickTransfer
          contacts={contacts}
          onContactClick={(contact) => {
            console.log('Transfer to:', contact);
            setShowTransferModal(true);
          }}
          onAddNew={() => {
            console.log('Add new contact');
          }}
        />

        {/* Tab Content */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            {/* Cards Section */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Мои карты</h3>
              {cards.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">У вас пока нет карт</h4>
                  <p className="text-gray-500 text-sm mb-4">Создайте свою первую виртуальную карту</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    Создать карту
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card, index) => (
                    <VirtualCard
                      key={card.id}
                      card={card}
                      onCopy={(text) => {
                        navigator.clipboard.writeText(text);
                        showNotification('Скопировано в буфер обмена');
                      }}
                      onToggleVisibility={() => hapticFeedback('light')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">История операций</h3>
              <div className="text-center py-8">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">История пуста</h4>
                <p className="text-gray-500 text-sm">Здесь будут отображаться ваши операции</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Настройки</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-700">Уведомления</span>
                  <div className="w-12 h-6 bg-purple-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-700">Биометрия</span>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-700">Темная тема</span>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

              {/* Create Card Button */}
                  {cards.length < 3 ? (
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
                          БЕСПЛАТНО
                        </div>
                      </div>
                    </motion.button>
                  ) : (
                    <div className="w-full p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30 text-center">
                      <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-lg">Лимит карт достигнут</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Максимум 3 карты на пользователя
                      </p>
                    </div>
                  )}

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

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTransferModal(true)}
                      className="p-4 glass rounded-2xl text-center hover:glow-blue transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white font-bold text-sm">Перевод</div>
                      <div className="text-white/70 text-xs">Между картами</div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTelegramStarsModal(true)}
                      className="p-4 glass rounded-2xl text-center hover:glow-purple transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white font-bold text-sm">Telegram Stars</div>
                      <div className="text-white/70 text-xs">Пополнение</div>
                    </motion.button>
                  </div>
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
              </div>
            </div>
          </div>
        )}

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

        {/* Transfer Modal */}
        {showTransferModal && (
          <TransferModal
            cards={cards}
            onTransfer={handleTransfer}
            onClose={() => setShowTransferModal(false)}
            isLoading={isLoading}
            showNotification={(message) => showNotification(message, 'success')}
          />
        )}

        {/* Telegram Stars Modal */}
        {showTelegramStarsModal && (
          <TelegramStarsModal
            cards={cards}
            onTopUp={handleTelegramStarsTopUp}
            onClose={() => setShowTelegramStarsModal(false)}
            isLoading={isLoading}
            showNotification={(message) => showNotification(message, 'success')}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      </div>
    </>
  );
}