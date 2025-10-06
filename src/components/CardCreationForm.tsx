'use client';

import React, { useState } from 'react';
import { CardType, CardCreationData } from '@/types';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardCreationFormProps {
  onSubmit: (data: CardCreationData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CardCreationForm: React.FC<CardCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CardCreationData>({
    type: 'stellex',
    holderName: '',
    paymentMethod: 'free'
  });

  const [errors, setErrors] = useState<Partial<CardCreationData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CardCreationData> = {};

    if (!formData.holderName.trim()) {
      newErrors.holderName = 'Введите имя владельца карты';
    } else if (formData.holderName.trim().length < 2) {
      newErrors.holderName = 'Имя должно содержать минимум 2 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CardCreationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const cardTypes: { type: CardType; name: string; icon: React.ReactNode; description: string }[] = [
    {
      type: 'stellex',
      name: 'STELLEX',
      icon: <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">S</div>,
      description: 'Цифровой банк будущего'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-dark p-8 rounded-3xl shadow-modern-lg"
    >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gradient text-glow mb-3">Выпуск виртуальной карты</h2>
            <p className="text-white/70 text-lg">Создайте свою виртуальную карту Stellex Bank бесплатно</p>
          </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Type Selection */}
        <div>
          <label className="block text-white font-bold mb-4 text-lg">Тип карты</label>
          <div className="grid grid-cols-2 gap-4">
            {cardTypes.map((cardType) => (
              <motion.button
                key={cardType.type}
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleInputChange('type', cardType.type)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  formData.type === cardType.type
                    ? 'border-blue-500 glass glow-blue'
                    : 'border-white/20 glass-dark hover:border-blue-500/50 hover:scale-105'
                }`}
              >
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {cardType.icon}
                  </div>
                  <span className="text-white font-bold text-lg">{cardType.name}</span>
                </div>
                <p className="text-white/70 text-sm text-left mb-3">{cardType.description}</p>
                {formData.type === cardType.type && (
                  <div className="flex justify-end">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Holder Name */}
        <div>
          <label className="block text-white font-bold mb-3 text-lg">Имя владельца карты</label>
          <input
            type="text"
            value={formData.holderName}
            onChange={(e) => handleInputChange('holderName', e.target.value)}
            placeholder="IVAN IVANOV"
            className={`w-full modern-input ${
              errors.holderName ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.holderName && (
            <div className="flex items-center space-x-2 mt-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{errors.holderName}</span>
            </div>
          )}
        </div>

        {/* Free Card Notice */}
        <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold">Бесплатный выпуск карты</div>
              <div className="text-white/70 text-sm">Карта Stellex Bank создается мгновенно и бесплатно</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-4 px-6 rounded-2xl glass-dark text-white font-bold hover:glass transition-all duration-300"
            disabled={isLoading}
          >
            Отмена
          </motion.button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 btn-modern font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Создание...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                <span>Создать карту</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CardCreationForm;
