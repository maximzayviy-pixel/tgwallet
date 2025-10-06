'use client';

import React, { useState } from 'react';
import { Card, TopUpData } from '@/types';
import { CreditCard, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopUpModalProps {
  card: Card;
  onTopUp: (data: TopUpData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const TopUpModal: React.FC<TopUpModalProps> = ({
  card,
  onTopUp,
  onClose,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<TopUpData>({
    cardId: card.id,
    amount: 1000,
    paymentMethod: 'telegram'
  });

  const [errors, setErrors] = useState<{ amount?: string }>({});

  const predefinedAmounts = [500, 1000, 2000, 5000, 10000];

  const validateForm = (): boolean => {
    const newErrors: { amount?: string } = {};

    if (formData.amount < 100) {
      newErrors.amount = 'Минимальная сумма пополнения 100 ₽';
    } else if (formData.amount > 100000) {
      newErrors.amount = 'Максимальная сумма пополнения 100 000 ₽';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onTopUp(formData);
    }
  };

  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  const handleInputChange = (field: keyof TopUpData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'amount' && errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Пополнение карты</h2>
          <p className="text-gray-400">Выберите сумму для пополнения</p>
        </div>

        {/* Card Info */}
        <div className="bg-gray-600/10 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <div className="flex-1">
              <div className="text-white font-medium">
                {card.type.toUpperCase()} •••• {card.number.slice(-4)}
              </div>
              <div className="text-gray-400 text-sm">
                Текущий баланс: {card.balance.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-white font-medium mb-3">Сумма пополнения</label>
            
            {/* Predefined amounts */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {predefinedAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAmountChange(amount)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.amount === amount
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-telegram-secondary bg-gray-600/5 hover:border-blue-500/50'
                  }`}
                >
                  <div className="text-white font-medium">{amount.toLocaleString('ru-RU')} ₽</div>
                </motion.button>
              ))}
            </div>

            {/* Custom amount input */}
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                placeholder="Введите сумму"
                min="100"
                max="100000"
                step="100"
                className={`w-full p-4 rounded-xl bg-gray-600/20 border-2 transition-colors text-white placeholder-telegram-muted focus:outline-none focus:border-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-telegram-secondary'
                }`}
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                ₽
              </div>
            </div>
            {errors.amount && (
              <div className="flex items-center space-x-2 mt-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.amount}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-white font-medium mb-3">Способ оплаты</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-4 rounded-xl bg-gray-600/10 hover:bg-gray-600/20 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="telegram"
                  checked={formData.paymentMethod === 'telegram'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-4 h-4 text-blue-400"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Telegram Stars</div>
                  <div className="text-gray-400 text-sm">Оплата через Telegram</div>
                </div>
                <div className="text-blue-400 font-bold">
                  {Math.ceil(formData.amount / 10)} ⭐
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-600/10 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Сумма пополнения</span>
              <span className="text-white font-medium">{formData.amount.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Комиссия</span>
              <span className="text-white font-medium">0 ₽</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-telegram-secondary/20">
              <span className="text-white">К списанию</span>
              <span className="text-blue-400">{formData.amount.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-xl bg-gray-600/20 text-white font-medium hover:bg-gray-600/30 transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 px-6 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Пополнение...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Пополнить</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TopUpModal;
