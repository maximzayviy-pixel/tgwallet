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
  showNotification,
  hapticFeedback,
  getTelegramUser
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

      const newCard = createCard('stellex', user?.id || '1', user?.firstName + ' ' + user?.lastName || 'Пользователь');
      setCards(prev => [...prev, newCard as Card]);
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

      const rubAmount = data.starsAmount * 1; // 1 звезда = 1 рубль
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
