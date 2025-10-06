'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Shield, 
  BarChart3,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  pendingCards: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCards: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingCards: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки данных
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        totalCards: 3200,
        totalTransactions: 15600,
        totalRevenue: 125000,
        activeUsers: 890,
        pendingCards: 45
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Пользователи',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Карты',
      value: stats.totalCards.toLocaleString(),
      change: '+8%',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Транзакции',
      value: stats.totalTransactions.toLocaleString(),
      change: '+25%',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Доход',
      value: `${stats.totalRevenue.toLocaleString()} ₽`,
      change: '+18%',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'card_created', user: 'Иван Петров', amount: 0, time: '2 мин назад' },
    { id: 2, type: 'topup', user: 'Мария Сидорова', amount: 5000, time: '5 мин назад' },
    { id: 3, type: 'transfer', user: 'Алексей Козлов', amount: 2500, time: '8 мин назад' },
    { id: 4, type: 'card_created', user: 'Елена Волкова', amount: 0, time: '12 мин назад' },
    { id: 5, type: 'withdrawal', user: 'Дмитрий Новиков', amount: 10000, time: '15 мин назад' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'card_created':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'topup':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'transfer':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'withdrawal':
        return <DollarSign className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (type: string, amount: number) => {
    switch (type) {
      case 'card_created':
        return 'Создал новую карту';
      case 'topup':
        return `Пополнил на ${amount.toLocaleString()} ₽`;
      case 'transfer':
        return `Перевел ${amount.toLocaleString()} ₽`;
      case 'withdrawal':
        return `Вывел ${amount.toLocaleString()} ₽`;
      default:
        return 'Неизвестное действие';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Загрузка админ-панели...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
                <p className="text-sm text-gray-500">Stellex Bank Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
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
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Активные пользователи</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-sm text-gray-600">за последние 24 часа</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ожидают активации</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingCards}</p>
                <p className="text-sm text-gray-600">карт требуют внимания</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус системы</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-green-600">Все системы работают</p>
                <p className="text-sm text-gray-600">99.9% uptime</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Последняя активность</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">
                      {getActivityText(activity.type, activity.amount)}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
