'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Wallet, History, Settings, Star, Shield, Zap, Eye, EyeOff } from 'lucide-react';
import VirtualCard from '@/components/VirtualCard';
import TopUpModal from '@/components/TopUpModal';
import TransferModal from '@/components/TransferModal';
import TelegramStarsModal from '@/components/TelegramStarsModal';
import CardDetailsModal from '@/components/CardDetailsModal';
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
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false);
  
  // Card details modal
  const [showCardDetailsModal, setShowCardDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'history' | 'settings'>('cards');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);

  // Инициализация при загрузке
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Инициализируем Telegram WebApp с ожиданием
        await initTelegramWebApp();
        setupTelegramTheme();
        
        // Загружаем данные пользователя
        await loadUserData();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsAppLoading(false);
      }
    };

    initializeApp();
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

      // Проверяем, настроен ли Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')) {
        console.log('Supabase not configured, using mock data');
        
        // Создаем mock пользователя
        const mockUser: User = {
          id: generateId(),
          telegram_id: userData.id,
          username: userData.username || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(mockUser);
        setCards([]); // Пустой массив карт для начала
        setIsAppLoading(false);
        return;
      }

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map((card) => (
                      <VirtualCard
                        key={card.id}
                        card={card}
                        compact={true}
                        onCopy={(text) => showNotification(`Скопировано: ${text}`)}
                        onExpand={() => {
                          // Открываем модальное окно с полной информацией о карте
                          setSelectedCard(card);
                          setShowCardDetailsModal(true);
                        }}
                        onTopUp={() => {
                          setSelectedCard(card);
                          setShowTopUpModal(true);
                        }}
                        onTransfer={() => {
                          setSelectedCard(card);
                          setShowTransferModal(true);
                        }}
                        onStarsTopUp={() => {
                          setSelectedCard(card);
                          setShowTelegramStarsModal(true);
                        }}
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
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">Уведомления</span>
                      <span className="text-gray-500 text-sm">Push-уведомления о транзакциях</span>
                    </div>
                    <button 
                      onClick={() => {
                        setNotificationsEnabled(!notificationsEnabled);
                        showNotification(notificationsEnabled ? 'Уведомления отключены' : 'Уведомления включены');
                      }}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        notificationsEnabled ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                        notificationsEnabled ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">Биометрия</span>
                      <span className="text-gray-500 text-sm">Вход по отпечатку пальца</span>
                    </div>
                    <button 
                      onClick={() => {
                        setBiometryEnabled(!biometryEnabled);
                        showNotification(biometryEnabled ? 'Биометрия отключена' : 'Биометрия включена');
                      }}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        biometryEnabled ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                        biometryEnabled ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">Темная тема</span>
                      <span className="text-gray-500 text-sm">Переключение темы интерфейса</span>
                    </div>
                    <button 
                      onClick={() => {
                        setDarkThemeEnabled(!darkThemeEnabled);
                        showNotification(darkThemeEnabled ? 'Светлая тема включена' : 'Темная тема включена');
                      }}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                        darkThemeEnabled ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                        darkThemeEnabled ? 'right-0.5' : 'left-0.5'
                      }`}></div>
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

          {/* Card Details Modal */}
          {showCardDetailsModal && selectedCard && (
            <CardDetailsModal
              card={selectedCard}
              onClose={() => {
                setShowCardDetailsModal(false);
                setSelectedCard(null);
              }}
              onCopy={(text) => showNotification(`Скопировано: ${text}`)}
              onTopUp={() => {
                setShowCardDetailsModal(false);
                setShowTopUpModal(true);
              }}
              onTransfer={() => {
                setShowCardDetailsModal(false);
                setShowTransferModal(true);
              }}
              onStarsTopUp={() => {
                setShowCardDetailsModal(false);
                setShowTelegramStarsModal(true);
              }}
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
