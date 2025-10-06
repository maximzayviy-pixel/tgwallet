'use client';

import React from 'react';
import { Card } from '@/types';
import { CreditCard, Eye, EyeOff, Copy, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface VirtualCardProps {
  card: Card;
  onCopy?: (text: string) => void;
  onToggleVisibility?: () => void;
  showDetails?: boolean;
  className?: string;
}

const VirtualCard: React.FC<VirtualCardProps> = ({
  card,
  onCopy,
  onToggleVisibility,
  showDetails = true,
  className = ''
}) => {
  const [isDetailsVisible, setIsDetailsVisible] = React.useState(false);

  const formatCardNumber = (number: string, visible: boolean) => {
    if (!visible) return '•••• •••• •••• ••••';
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (date: string, visible: boolean) => {
    if (!visible) return '••/••';
    return date;
  };

  const getCardGradient = (type: string) => {
    switch (type) {
      case 'stellex':
        return 'gradient-card-stellex';
      default:
        return 'gradient-card-stellex';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
    >
      <div className={`${getCardGradient(card.type)} rounded-3xl p-8 shadow-modern-lg modern-card glow-blue relative overflow-hidden`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              {getCardLogo(card.type)}
            </div>
            <div>
              <div className="text-white/90 text-lg font-bold">
                {card.type.toUpperCase()}
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
            className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
          >
            {isDetailsVisible ? <EyeOff className="w-6 h-6 text-white" /> : <Eye className="w-6 h-6 text-white" />}
          </motion.button>
        </div>

        {/* Card Number */}
        <div className="mb-8 relative z-10">
          <div className="text-white/70 text-sm mb-3 font-medium">Номер карты</div>
          <div className="flex items-center justify-between">
            <div className="card-number text-white text-2xl font-bold">
              {formatCardNumber(card.number, isDetailsVisible)}
            </div>
            {isDetailsVisible && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCopy(card.number)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <Copy className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Card Details */}
        <div className="flex justify-between items-end mb-8 relative z-10">
          <div className="flex-1">
            <div className="text-white/70 text-sm mb-2 font-medium">Владелец</div>
            <div className="text-white font-bold text-lg">
              {isDetailsVisible ? card.holderName : '•••• ••••'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-sm mb-2 font-medium">Срок действия</div>
            <div className="text-white font-bold text-lg">
              {formatExpiryDate(card.expiryDate, isDetailsVisible)}
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="mt-8 pt-6 border-t border-white/20 relative z-10">
          <div className="flex justify-between items-center">
            <div className="text-white/70 text-sm font-medium">Баланс</div>
            <div className="text-white text-2xl font-bold text-gradient">
              {card.balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Card Actions */}
        {showDetails && (
          <div className="mt-8 relative z-10">
            {card.status === 'awaiting_activation' ? (
              <div className="text-center">
                <div className="text-white/70 text-sm mb-4">
                  Карта создана! Проверьте Telegram для активации
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-2xl transition-all duration-300 text-sm font-semibold"
                >
                  Активировать карту
                </motion.button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-2xl transition-all duration-300 text-sm font-semibold backdrop-blur-sm"
                >
                  Пополнить
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-2xl transition-all duration-300 text-sm font-semibold backdrop-blur-sm"
                >
                  История
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all duration-300 backdrop-blur-sm"
                >
                  <MoreVertical className="w-5 h-5" />
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
