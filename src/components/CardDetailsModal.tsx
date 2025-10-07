'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Copy, CreditCard, ArrowUpRight, Star, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/types';

interface CardDetailsModalProps {
  card: Card;
  onClose: () => void;
  onCopy?: (text: string) => void;
  onTopUp?: () => void;
  onTransfer?: () => void;
  onStarsTopUp?: () => void;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  card,
  onClose,
  onCopy,
  onTopUp,
  onTransfer,
  onStarsTopUp
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onCopy?.(text);
  };

  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <CreditCard className="mr-2 text-purple-600" /> Детали карты
        </h2>

        {/* Card Display */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-xl p-4 mb-6 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
          </div>
          
          {/* Card Header */}
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="text-white font-bold text-lg tracking-wider">
              STELLEX
            </div>
            <div className="text-white/60 text-sm">
              {card.status === 'active' ? 'Активна' : 
               card.status === 'blocked' ? 'Заблокирована' : 
               card.status === 'awaiting_activation' ? 'Ожидает активации' : 'Ожидает активации'}
            </div>
          </div>

          {/* Card Number */}
          <div className="mb-4 relative z-10">
            <div className="text-white text-xl font-bold tracking-wider">
              {formatCardNumber(card.card_number, isDetailsVisible)}
            </div>
          </div>

          {/* Card Details */}
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="text-white/70 text-sm">
              {isDetailsVisible ? card.holder_name : '•••• ••••'}
            </div>
            <div className="text-white/70 text-sm">
              {formatExpiryDate(card.expiry_date, isDetailsVisible)}
            </div>
          </div>

          {/* Balance */}
          <div className="relative z-10">
            <div className="text-white/60 text-sm">Баланс</div>
            <div className="text-white text-2xl font-bold">
              {card.balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Toggle Details Button */}
          <button
            onClick={toggleDetails}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
          >
            {isDetailsVisible ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Card Information */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Тип карты</p>
              <p className="font-semibold">Stellex Virtual</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Создана</p>
              <p className="font-semibold">
                {new Date(card.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
          
          {isDetailsVisible && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">CVV</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono font-semibold text-gray-900">{card.cvv}</p>
                  <button
                    onClick={() => handleCopy(card.cvv)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Полный номер</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono font-semibold text-sm text-gray-900">{card.card_number}</p>
                  <button
                    onClick={() => handleCopy(card.card_number)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {card.status === 'awaiting_activation' ? (
          <div className="text-center">
            <div className="text-gray-600 text-sm mb-4">
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
              className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Пополнить</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTransfer}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold flex items-center justify-center space-x-2"
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
      </motion.div>
    </motion.div>
  );
};

export default CardDetailsModal;
