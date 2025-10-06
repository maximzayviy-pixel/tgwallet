'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Key, 
  BarChart3, 
  Settings, 
  Copy, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  DollarSign,
  Activity,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';
import AuthGuard from '@/components/AuthGuard';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  requestsCount: number;
}

interface DeveloperStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalRevenue: number;
  activeKeys: number;
  monthlyRequests: number;
}

export default function DeveloperDashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<DeveloperStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalRevenue: 0,
    activeKeys: 0,
    monthlyRequests: 0
  });
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const permissions = [
    { id: 'cards_read', name: 'Чтение карт', description: 'Просмотр информации о картах' },
    { id: 'cards_create', name: 'Создание карт', description: 'Создание новых карт' },
    { id: 'cards_update', name: 'Обновление карт', description: 'Изменение данных карт' },
    { id: 'transactions_read', name: 'Чтение транзакций', description: 'Просмотр истории операций' },
    { id: 'transactions_create', name: 'Создание транзакций', description: 'Выполнение операций' },
    { id: 'transfers_create', name: 'Переводы', description: 'Переводы между картами' },
    { id: 'topup_create', name: 'Пополнения', description: 'Пополнение карт' },
    { id: 'withdraw_create', name: 'Списания', description: 'Списание с карт' }
  ];

  useEffect(() => {
    // Симуляция загрузки данных
    setTimeout(() => {
      setApiKeys([
        {
          id: '1',
          name: 'Production API',
          key: 'sk_live_1234567890abcdef',
          permissions: ['cards_read', 'transactions_read', 'transfers_create'],
          isActive: true,
          createdAt: '2024-01-15',
          lastUsed: '2024-01-20',
          requestsCount: 15420
        },
        {
          id: '2',
          name: 'Test Environment',
          key: 'sk_test_abcdef1234567890',
          permissions: ['cards_read', 'cards_create', 'transactions_read'],
          isActive: true,
          createdAt: '2024-01-10',
          lastUsed: '2024-01-19',
          requestsCount: 3240
        },
        {
          id: '3',
          name: 'Legacy Integration',
          key: 'sk_legacy_9876543210fedcba',
          permissions: ['cards_read', 'transactions_read'],
          isActive: false,
          createdAt: '2023-12-01',
          lastUsed: '2024-01-05',
          requestsCount: 890
        }
      ]);

      setStats({
        totalRequests: 19550,
        successfulRequests: 19200,
        failedRequests: 350,
        totalRevenue: 125000,
        activeKeys: 2,
        monthlyRequests: 8500
      });
    }, 1000);
  }, []);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: selectedPermissions,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      requestsCount: 0
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setSelectedPermissions([]);
    setShowNewKeyForm(false);
  };

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getMaskedKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <AuthGuard 
      requiredKey="developer_access_2024"
      onAuthSuccess={() => {}}
    >
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Кабинет разработчика</h1>
                <p className="text-sm text-gray-500">Stellex Bank API</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setShowNewKeyForm(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Новый ключ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <AdminNavigation />

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Всего запросов</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {stats.activeKeys}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeKeys}</p>
              <p className="text-sm text-gray-600">Активных ключей</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                +8%
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} ₽</p>
              <p className="text-sm text-gray-600">Доход</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                +25%
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyRequests.toLocaleString()}</p>
              <p className="text-sm text-gray-600">За этот месяц</p>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">API Ключи</h3>
            <button 
              onClick={() => setShowNewKeyForm(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Добавить ключ
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${key.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <h4 className="font-medium text-gray-900">{key.name}</h4>
                    <span className="text-sm text-gray-500">• {key.requestsCount.toLocaleString()} запросов</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <code className="text-sm font-mono text-gray-800">
                    {visibleKeys.has(key.id) ? key.key : getMaskedKey(key.key)}
                  </code>
                </div>

                <div className="flex flex-wrap gap-2">
                  {key.permissions.map(permission => (
                    <span
                      key={permission}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {permissions.find(p => p.id === permission)?.name || permission}
                    </span>
                  ))}
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Создан: {key.createdAt} • 
                  {key.lastUsed && ` Последнее использование: ${key.lastUsed}`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Документация API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Основные эндпоинты</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono">POST /api/cards</span>
                  <span className="text-xs text-gray-500">Создание карты</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono">GET /api/cards</span>
                  <span className="text-xs text-gray-500">Список карт</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono">POST /api/transfer</span>
                  <span className="text-xs text-gray-500">Перевод средств</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono">POST /api/telegram-stars/topup</span>
                  <span className="text-xs text-gray-500">Пополнение Stars</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Быстрые ссылки</h4>
              <div className="space-y-2">
                <a href="/api/docs" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <span className="text-sm font-medium text-blue-900">Полная документация</span>
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </a>
                <a href="/api/sandbox" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <span className="text-sm font-medium text-green-900">Песочница</span>
                  <ExternalLink className="w-4 h-4 text-green-600" />
                </a>
                <a href="/api/examples" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <span className="text-sm font-medium text-purple-900">Примеры кода</span>
                  <ExternalLink className="w-4 h-4 text-purple-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Key Modal */}
      {showNewKeyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Создать новый API ключ</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Production API"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Разрешения</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {permissions.map(permission => (
                    <label key={permission.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions(prev => [...prev, permission.id]);
                          } else {
                            setSelectedPermissions(prev => prev.filter(p => p !== permission.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewKeyForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateKey}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600"
              >
                Создать
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
