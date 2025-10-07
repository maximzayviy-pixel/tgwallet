'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff
} from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';
import AuthGuard from '@/components/AuthGuard';

interface Developer {
  id: string;
  name: string;
  email: string;
  login: string;
  password: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  apiKeysCount: number;
}

export default function DevelopersManagement() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeveloper, setNewDeveloper] = useState({
    name: '',
    email: '',
    permissions: [] as string[]
  });
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const permissions = [
    { id: 'cards_read', name: 'Чтение карт' },
    { id: 'cards_create', name: 'Создание карт' },
    { id: 'cards_update', name: 'Обновление карт' },
    { id: 'transactions_read', name: 'Чтение транзакций' },
    { id: 'transactions_create', name: 'Создание транзакций' },
    { id: 'transfers_create', name: 'Переводы' },
    { id: 'topup_create', name: 'Пополнения' },
    { id: 'withdraw_create', name: 'Списания' }
  ];

  useEffect(() => {
    // Загружаем разработчиков
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    // Симуляция загрузки данных
    setTimeout(() => {
      setDevelopers([
        {
          id: '1',
          name: 'Иван Петров',
          email: 'ivan@example.com',
          login: 'ivan_dev',
          password: 'dev_pass_123',
          permissions: ['cards_read', 'transactions_read', 'transfers_create'],
          isActive: true,
          createdAt: '2024-01-15',
          lastLogin: '2024-01-20',
          apiKeysCount: 2
        },
        {
          id: '2',
          name: 'Мария Сидорова',
          email: 'maria@example.com',
          login: 'maria_dev',
          password: 'dev_pass_456',
          permissions: ['cards_read', 'cards_create', 'transactions_read'],
          isActive: true,
          createdAt: '2024-01-10',
          lastLogin: '2024-01-19',
          apiKeysCount: 1
        },
        {
          id: '3',
          name: 'Алексей Козлов',
          email: 'alex@example.com',
          login: 'alex_dev',
          password: 'dev_pass_789',
          permissions: ['cards_read', 'transactions_read'],
          isActive: false,
          createdAt: '2024-01-05',
          lastLogin: '2024-01-15',
          apiKeysCount: 0
        }
      ]);
    }, 1000);
  };

  const generateLogin = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '_') + '_dev';
  };

  const generatePassword = () => {
    return 'dev_pass_' + Math.random().toString(36).substring(2, 8);
  };

  const handleAddDeveloper = async () => {
    if (!newDeveloper.name || !newDeveloper.email) return;

    try {
      // Создаем пароль
      const password = generatePassword();
      
      // Отправляем запрос на создание разработчика
      const response = await fetch('/api/admin/create-developer-edge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || 'la0fEUlxBU80DFMzlZZc'}`
        },
        body: JSON.stringify({
          email: newDeveloper.email,
          password: password,
          first_name: newDeveloper.name.split(' ')[0],
          last_name: newDeveloper.name.split(' ').slice(1).join(' '),
          username: generateLogin(newDeveloper.name)
        })
      });

      const data = await response.json();

      if (data.success) {
        const developer: Developer = {
          id: data.developer.id,
          name: `${data.developer.first_name} ${data.developer.last_name}`,
          email: data.developer.email,
          login: data.developer.username,
          password: password,
          permissions: newDeveloper.permissions,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
          apiKeysCount: 0
        };

        setDevelopers(prev => [...prev, developer]);
        setNewDeveloper({ name: '', email: '', permissions: [] });
        setShowAddForm(false);
        
        alert('Разработчик успешно создан!');
      } else {
        alert(data.error || 'Ошибка создания разработчика');
      }
    } catch (error) {
      console.error('Error creating developer:', error);
      alert('Ошибка создания разработчика');
    }
  };

  const handleDeleteDeveloper = (id: string) => {
    setDevelopers(prev => prev.filter(dev => dev.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setDevelopers(prev => prev.map(dev => 
      dev.id === id ? { ...dev, isActive: !dev.isActive } : dev
    ));
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AuthGuard 
      requiredKey="la0fEUlxBU80DFMzlZZc"
      onAuthSuccess={() => {}}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Управление разработчиками</h1>
                  <p className="text-sm text-gray-500">Создание и управление доступом для разработчиков</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить разработчика</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <AdminNavigation />

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Список разработчиков</h3>
              
              <div className="space-y-4">
                {developers.map((developer, index) => (
                  <motion.div
                    key={developer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${developer.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{developer.name}</h4>
                          <p className="text-sm text-gray-500">{developer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(developer.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            developer.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {developer.isActive ? 'Активен' : 'Неактивен'}
                        </button>
                        <button
                          onClick={() => handleDeleteDeveloper(developer.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                            {developer.login}
                          </code>
                          <button
                            onClick={() => copyToClipboard(developer.login)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                            {visiblePasswords.has(developer.id) ? developer.password : '••••••••••••'}
                          </code>
                          <button
                            onClick={() => togglePasswordVisibility(developer.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            {visiblePasswords.has(developer.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(developer.password)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Разрешения</label>
                      <div className="flex flex-wrap gap-2">
                        {developer.permissions.map(permission => (
                          <span
                            key={permission}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {permissions.find(p => p.id === permission)?.name || permission}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Создан: {developer.createdAt} • 
                      {developer.lastLogin && ` Последний вход: ${developer.lastLogin}`} • 
                      API ключей: {developer.apiKeysCount}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Developer Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить разработчика</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  <input
                    type="text"
                    value={newDeveloper.name}
                    onChange={(e) => setNewDeveloper(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Имя разработчика"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newDeveloper.email}
                    onChange={(e) => setNewDeveloper(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Разрешения</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {permissions.map(permission => (
                      <label key={permission.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={newDeveloper.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewDeveloper(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.id]
                              }));
                            } else {
                              setNewDeveloper(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission.id)
                              }));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddDeveloper}
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
