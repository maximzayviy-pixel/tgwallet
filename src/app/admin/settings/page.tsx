'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RotateCcw,
  DollarSign,
  Percent,
  Star,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';

interface CommissionSettings {
  cardCreationFee: number;
  transferFee: number;
  withdrawalFee: number;
  topUpFee: number;
  telegramStarsRate: number;
  minTransferAmount: number;
  maxTransferAmount: number;
  dailyLimit: number;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<CommissionSettings>({
    cardCreationFee: 0,
    transferFee: 0.5,
    withdrawalFee: 1.0,
    topUpFee: 0,
    telegramStarsRate: 1,
    minTransferAmount: 1,
    maxTransferAmount: 100000,
    dailyLimit: 50000
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Загружаем настройки с сервера
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Симуляция загрузки настроек
      await new Promise(resolve => setTimeout(resolve, 1000));
      // В реальном приложении здесь будет запрос к API
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Симуляция сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // В реальном приложении здесь будет запрос к API
      console.log('Saving settings:', settings);
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      cardCreationFee: 0,
      transferFee: 0.5,
      withdrawalFee: 1.0,
      topUpFee: 0,
      telegramStarsRate: 1,
      minTransferAmount: 1,
      maxTransferAmount: 100000,
      dailyLimit: 50000
    });
  };

  const handleInputChange = (field: keyof CommissionSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const settingGroups = [
    {
      title: 'Комиссии',
      icon: Percent,
      color: 'from-blue-500 to-cyan-500',
      settings: [
        {
          key: 'cardCreationFee' as keyof CommissionSettings,
          label: 'Создание карты',
          value: settings.cardCreationFee,
          suffix: '₽',
          description: 'Комиссия за создание новой карты'
        },
        {
          key: 'transferFee' as keyof CommissionSettings,
          label: 'Переводы',
          value: settings.transferFee,
          suffix: '%',
          description: 'Процент с суммы перевода'
        },
        {
          key: 'withdrawalFee' as keyof CommissionSettings,
          label: 'Списания',
          value: settings.withdrawalFee,
          suffix: '%',
          description: 'Процент с суммы списания'
        },
        {
          key: 'topUpFee' as keyof CommissionSettings,
          label: 'Пополнения',
          value: settings.topUpFee,
          suffix: '%',
          description: 'Процент с суммы пополнения'
        }
      ]
    },
    {
      title: 'Курсы валют',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      settings: [
        {
          key: 'telegramStarsRate' as keyof CommissionSettings,
          label: 'Telegram Stars',
          value: settings.telegramStarsRate,
          suffix: '₽ за звезду',
          description: 'Курс обмена Telegram Stars в рубли'
        }
      ]
    },
    {
      title: 'Лимиты',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      settings: [
        {
          key: 'minTransferAmount' as keyof CommissionSettings,
          label: 'Минимальный перевод',
          value: settings.minTransferAmount,
          suffix: '₽',
          description: 'Минимальная сумма для перевода'
        },
        {
          key: 'maxTransferAmount' as keyof CommissionSettings,
          label: 'Максимальный перевод',
          value: settings.maxTransferAmount,
          suffix: '₽',
          description: 'Максимальная сумма для перевода'
        },
        {
          key: 'dailyLimit' as keyof CommissionSettings,
          label: 'Дневной лимит',
          value: settings.dailyLimit,
          suffix: '₽',
          description: 'Максимальная сумма операций в день'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
                <p className="text-sm text-gray-500">Управление комиссиями и лимитами</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Сбросить</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Сохранение...' : 'Сохранить'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <AdminNavigation />

      {/* Main Content */}
      <div className="p-6">
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800"
          >
            Настройки успешно сохранены!
          </motion.div>
        )}

        <div className="space-y-8">
          {settingGroups.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br ${group.color} rounded-xl flex items-center justify-center`}>
                  <group.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{group.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.settings.map((setting, index) => (
                  <div key={setting.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {setting.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleInputChange(setting.key, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {setting.suffix}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Прогноз доходов</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {((settings.transferFee / 100) * 10000).toFixed(2)}₽
              </div>
              <div className="text-sm text-gray-600">С 10,000₽ переводов</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {((settings.withdrawalFee / 100) * 5000).toFixed(2)}₽
              </div>
              <div className="text-sm text-gray-600">С 5,000₽ списаний</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {settings.cardCreationFee * 100}₽
              </div>
              <div className="text-sm text-gray-600">Со 100 новых карт</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
