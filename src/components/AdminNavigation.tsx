import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Code, 
  Settings, 
  BarChart3, 
  Users, 
  CreditCard,
  Home
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Главная', icon: Home },
    { href: '/admin/users', label: 'Пользователи', icon: Users },
    { href: '/admin/cards', label: 'Карты', icon: CreditCard },
    { href: '/admin/transactions', label: 'Транзакции', icon: BarChart3 },
    { href: '/admin/developers', label: 'Разработчики', icon: Code },
    { href: '/admin/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <nav className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminNavigation;
