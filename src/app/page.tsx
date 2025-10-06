'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Wallet, History, Settings, Star, Shield, Zap, Eye, EyeOff } from 'lucide-react';
import VirtualCard from '@/components/VirtualCard';
import TopUpModal from '@/components/TopUpModal';
import TransferModal from '@/components/TransferModal';
import TelegramStarsModal from '@/components/TelegramStarsModal';
import BottomNavigation from '@/components/BottomNavigation';
import SpaceLoader from '@/components/SpaceLoader';
import { Card, TopUpData, User } from '@/types';
import { createCard, generateId } from '@/lib/cardUtils';
import { supabase } from '@/lib/supabase';
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
  // Убираем форму создания карт - создаем автоматически
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTelegramStarsModal, setShowTelegramStarsModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'history' | 'settings'>('cards');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);

  // Инициализация при загрузке
  useEffect(() => {
    initTelegramWebApp();
    setupTelegramTheme();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Получаем данные пользователя из Telegram
      const telegramUser = getTelegramUser();
      console.log('Telegram user:', telegramUser);
      
      // Fallback данные для тестирования в браузере
      const fallbackUser = {
        id: 123456789,
        first_name: 'Иван',
        last_name: 'Петров',
        username: 'ivan_petrov',
        language_code: 'ru'
      };
      
      const userData = telegramUser || fallbackUser;
      console.log('Using user data:', userData);

      // Проверяем, есть ли пользователь в базе данных
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userData.id)
        .single();

      console.log('Existing user:', existingUser, 'Error:', userError);

      let currentUser: User;
      
      if (existingUser) {
        currentUser = existingUser;
        console.log('Using existing user:', currentUser);
      } else {
        // Создаем нового пользователя
        const newUser: User = {
          id: generateId(),
          telegram_id: userData.id,
          username: userData.username || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Creating new user:', newUser);

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          // Продолжаем работу даже если не удалось создать пользователя
          currentUser = newUser;
        } else {
          currentUser = createdUser;
          console.log('User created successfully:', currentUser);
        }
      }

      setUser(currentUser);

      // Загружаем карты пользователя
      const { data: userCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      console.log('Cards query result:', { userCards, cardsError });

      if (cardsError) {
        console.error('Error loading cards:', cardsError);
      } else {
        setCards(userCards || []);
        console.log('Cards loaded:', userCards);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsAppLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!user) {
      console.error('No user found for card creation');
      showNotification('Пользователь не найден', 'error');
      return;
    }
    
    console.log('Creating card for user:', user);
    setIsLoading(true);
    hapticFeedback('medium');

    try {
      const requestData = {
        user_id: user.id,
        holder_name: `${user.first_name} ${user.last_name}`.trim() || 'ПОЛЬЗОВАТЕЛЬ',
        api_key: process.env.NEXT_PUBLIC_API_KEY || 'test_key'
      };
      
      console.log('Sending card creation request:', requestData);

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Card creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Card creation failed:', errorText);
        throw new Error(`Failed to create card: ${errorText}`);
      }

      const newCard = await response.json();
      console.log('Card created successfully:', newCard);
      setCards(prev => [newCard, ...prev]);
      showNotification('Карта успешно создана!', 'success');
    } catch (error) {
      console.error('Error creating card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showNotification(`Ошибка при создании карты: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async (data: TopUpData) => {
    setIsLoading(true);
    hapticFeedback('medium');

    try {
      const response = await fetch(`/api/cards/${data.cardId}/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          api_key: process.env.NEXT_PUBLIC_API_KEY
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to top up card');
      }

      const result = await response.json();
      
      // Обновляем баланс карты
      setCards(prev => prev.map(card =>
        card.id === data.cardId
          ? { ...card, balance: result.new_balance }
          : card
      ));

      setShowTopUpModal(false);
      setSelectedCard(null);
      showNotification('Карта успешно пополнена!', 'success');
    } catch (error) {
      console.error('Error topping up card:', error);
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
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_card_id: data.fromCardId,
          to_card_number: data.toCardNumber,
          amount: data.amount,
          description: data.description,
          api_key: process.env.NEXT_PUBLIC_API_KEY
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transfer');
      }

      const result = await response.json();
      
      // Обновляем балансы карт
      setCards(prev => prev.map(card => {
        if (card.id === data.fromCardId) {
          return { ...card, balance: result.from_card_balance };
        }
        return card;
      }));

      setShowTransferModal(false);
      showNotification('Перевод выполнен успешно!', 'success');
    } catch (error) {
      console.error('Error transferring:', error);
      showNotification('Ошибка при выполнении перевода', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTelegramStarsTopUp = async (data: {
    cardId: string;
    starsAmount: number;
  }) => {
    if (!user) return;
    
    setIsLoading(true);
    hapticFeedback('medium');

    try {
      const response = await fetch('/api/telegram-stars/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: data.cardId,
          stars_amount: data.starsAmount,
          telegram_user_id: user.telegram_id,
          api_key: process.env.NEXT_PUBLIC_API_KEY
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to top up with Telegram Stars');
      }

      const result = await response.json();
      
      // Обновляем баланс карты
      setCards(prev => prev.map(card =>
        card.id === data.cardId
          ? { ...card, balance: result.new_balance }
          : card
      ));

      setShowTelegramStarsModal(false);
      showNotification('Пополнение через Telegram Stars выполнено!', 'success');
    } catch (error) {
      console.error('Error topping up with Telegram Stars:', error);
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                  {user && user.telegram_id ? (
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name}&backgroundColor=8b5cf6&textColor=ffffff`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">S</span>
                  )}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {user ? `${user.first_name} ${user.last_name}`.trim() : 'Пользователь'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user ? `ID: ${user.telegram_id}` : 'Stellex Bank'}
                  </div>
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
          {/* Total Balance */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Общий баланс</p>
                <p className="text-3xl font-bold">{totalBalance.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              {/* Cards Section */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Мои карты</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateCard}
                      disabled={isLoading || cards.length >= 3}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Создать карту</span>
                    </button>
                    <button
                      onClick={() => setShowTelegramStarsModal(true)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>Пополнить звездами</span>
                    </button>
                  </div>
                </div>
                
                {cards.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">У вас пока нет карт</h4>
                    <p className="text-gray-500 text-sm mb-4">Создайте свою первую виртуальную карту</p>
                    <button
                      onClick={handleCreateCard}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Создание...' : 'Создать карту'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer"
                        onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                      >
                        {/* Card Design */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-300">Stellex Card</p>
                              <p className="font-semibold">{card.holder_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{card.balance.toLocaleString('ru-RU')} ₽</p>
                            <p className="text-sm text-gray-300">
                              {card.status === 'active' ? 'Активна' : 'Ожидает активации'}
                            </p>
                          </div>
                        </div>

                        {/* Card Number */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-300 mb-1">Номер карты</p>
                          <p className="text-lg font-mono tracking-wider">
                            {card.card_number.replace(/(.{4})/g, '$1 ').trim()}
                          </p>
                        </div>

                        {/* Card Details */}
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-300">Срок действия</p>
                            <p className="font-mono">{card.expiry_date}</p>
                          </div>
                          <div>
                            <p className="text-gray-300">CVV</p>
                            <p className="font-mono">{card.cvv}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCard(card);
                                setShowTopUpModal(true);
                              }}
                              className="bg-white/20 px-3 py-1 rounded-lg text-xs"
                            >
                              Пополнить
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCard(card);
                                setShowTelegramStarsModal(true);
                              }}
                              className="bg-yellow-500/20 px-3 py-1 rounded-lg text-xs text-yellow-200"
                            >
                              ⭐ Звезды
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCard(card);
                                setShowTransferModal(true);
                              }}
                              className="bg-white/20 px-3 py-1 rounded-lg text-xs"
                            >
                              Перевести
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedCard === card.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t border-white/20"
                            >
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-300">Тип карты</p>
                                  <p className="font-semibold">Stellex Virtual</p>
                                </div>
                                <div>
                                  <p className="text-gray-300">Создана</p>
                                  <p className="font-semibold">
                                    {new Date(card.created_at).toLocaleDateString('ru-RU')}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
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
                    <button 
                      onClick={() => showNotification('Настройки уведомлений', 'success')}
                      className="w-12 h-6 bg-purple-500 rounded-full relative"
                    >
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-700">Биометрия</span>
                    <button 
                      onClick={() => showNotification('Биометрия недоступна', 'warning')}
                      className="w-12 h-6 bg-gray-300 rounded-full relative"
                    >
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-700">Темная тема</span>
                    <button 
                      onClick={() => showNotification('Темная тема в разработке', 'warning')}
                      className="w-12 h-6 bg-gray-300 rounded-full relative"
                    >
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Информация о пользователе */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Информация о пользователе</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Имя:</span>
                    <span className="font-medium">{user ? `${user.first_name} ${user.last_name}`.trim() : 'Не загружено'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telegram ID:</span>
                    <span className="font-medium">{user?.telegram_id || 'Не загружено'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">@{user?.username || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Карт создано:</span>
                    <span className="font-medium">{cards.length}/3</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
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
              cards={selectedCard ? [selectedCard] : cards}
              onTopUp={handleTelegramStarsTopUp}
              onClose={() => {
                setShowTelegramStarsModal(false);
                setSelectedCard(null);
              }}
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
