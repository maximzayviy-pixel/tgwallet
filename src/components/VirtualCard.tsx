'use client';

import React from 'react';
import { Card } from '@/types';
import { CreditCard, Eye, EyeOff, Copy, MoreVertical, Star, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface VirtualCardProps {
  card: Card;
  onCopy?: (text: string) => void;
  onToggleVisibility?: () => void;
  showDetails?: boolean;
  className?: string;
  compact?: boolean;
  onExpand?: () => void;
  onTopUp?: () => void;
  onTransfer?: () => void;
  onStarsTopUp?: () => void;
}

const VirtualCard: React.FC<VirtualCardProps> = ({
  card,
  onCopy,
  onToggleVisibility,
  showDetails = true,
  className = '',
  compact = false,
  onExpand,
  onTopUp,
  onTransfer,
  onStarsTopUp
}) => {
  const [isDetailsVisible, setIsDetailsVisible] = React.useState(false);

  const formatCardNumber = (number: string, visible: boolean) => {
    if (!visible) return '•••• •••• •••• ••••';
    if (compact) {
      // Показываем только последние 4 цифры в компактном режиме
      return `•••• •••• •••• ${number.slice(-4)}`;
    }
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (date: string, visible: boolean) => {
    if (!visible) return '••/••';
    return date;
  };

  const getCardGradient = (type: string) => {
    switch (type) {
      case 'stellex':
        return 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800';
      default:
        return 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800';
    }
  };

  const getCardLogo = (type: string) => {
    switch (type) {
      case 'stellex':
        return (
          <div className="text-white font-bold text-xl tracking-wider">
            STELLEX
          </div>
        );
      default:
        return (
          <div className="text-white font-bold text-xl tracking-wider">
            STELLEX
          </div>
        );
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onCopy?.(text);
  };

  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible);
    onToggleVisibility?.();
  };

  // Compact version of the card
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative ${className}`}
        onClick={onExpand}
      >
        <div className={`${getCardGradient('stellex')} rounded-xl p-3 shadow-lg relative overflow-hidden cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 min-h-[120px]`}>
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
          </div>
          
          {/* Card Header - компактный */}
          <div className="flex justify-between items-center mb-2 relative z-10">
            <div className="text-white font-bold text-sm tracking-wider">
              STELLEX
            </div>
            <div className="text-white/60 text-xs">
              {card.status === 'active' ? 'Активна' : 
               card.status === 'blocked' ? 'Заблокирована' : 
               card.status === 'awaiting_activation' ? 'Ожидает активации' : 'Ожидает активации'}
            </div>
          </div>

          {/* Card Number - только последние 4 цифры */}
          <div className="mb-3 relative z-10">
            <div className="text-white text-lg font-bold tracking-wider">
              •••• •••• •••• {card.card_number.slice(-4)}
            </div>
          </div>

          {/* Card Details - компактные */}
          <div className="flex justify-between items-center mb-2 relative z-10">
            <div className="text-white/70 text-xs truncate max-w-[60%]">
              {card.holder_name}
            </div>
            <div className="text-white/70 text-xs">
              {formatExpiryDate(card.expiry_date, true)}
            </div>
          </div>

          {/* Balance - компактный */}
          <div className="relative z-10">
            <div className="text-white/60 text-xs">Баланс</div>
            <div className="text-white text-lg font-bold">
              {card.balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Индикатор клика */}
          <div className="absolute top-2 right-2 text-white/40">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Full version of the card (expanded view)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
    >
      <div className={`${getCardGradient('stellex')} rounded-2xl p-6 shadow-xl relative overflow-hidden`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        {/* Card Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              {getCardLogo('stellex')}
            </div>
            <div>
              <div className="text-white/90 text-lg font-bold">
                STELLEX
              </div>
              <div className="text-white/70 text-sm font-medium">
                {card.status === 'active' ? 'Активна' : 
                 card.status === 'blocked' ? 'Заблокирована' : 
                 card.status === 'awaiting_activation' ? 'Ожидает активации' : 'Ожидает активации'}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDetails}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
          >
            {isDetailsVisible ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
          </motion.button>
        </div>

        {/* Card Number */}
        <div className="mb-6 relative z-10">
          <div className="text-white/70 text-sm mb-2 font-medium">Номер карты</div>
          <div className="flex items-center justify-between">
            <div className="text-white text-xl font-bold tracking-wider">
              {formatCardNumber(card.card_number, isDetailsVisible)}
            </div>
            {isDetailsVisible && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCopy(card.card_number)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <Copy className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Card Details */}
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div className="flex-1">
            <div className="text-white/70 text-sm mb-1 font-medium">Владелец</div>
            <div className="text-white font-bold text-lg">
              {isDetailsVisible ? card.holder_name : '•••• ••••'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-sm mb-1 font-medium">Срок действия</div>
            <div className="text-white font-bold text-lg">
              {formatExpiryDate(card.expiry_date, isDetailsVisible)}
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-6 pt-4 border-t border-white/20 relative z-10">
          <div className="flex justify-between items-center">
            <div className="text-white/70 text-sm font-medium">Баланс</div>
            <div className="text-white text-2xl font-bold">
              {card.balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Card Actions */}
        {showDetails && (
          <div className="relative z-10">
            {card.status === 'awaiting_activation' ? (
              <div className="text-center">
                <div className="text-white/70 text-sm mb-4">
                  Карта создана! Нажмите для активации
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/cards/activate', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          card_id: card.id,
                          telegram_user_id: 123456789,
                          api_key: 'test_key'
                        })
                      });

                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Error activating card:', error);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold"
                >
                  Активировать карту
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTopUp}
                  className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold backdrop-blur-sm flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Пополнить</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTransfer}
                  className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold backdrop-blur-sm flex items-center justify-center space-x-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Перевести</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStarsTopUp}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold flex items-center justify-center space-x-2 col-span-2"
                >
                  <Star className="w-4 h-4" />
                  <span>Пополнить звездами</span>
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VirtualCard;