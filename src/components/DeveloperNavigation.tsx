import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CreditCard, 
  Code, 
  Settings, 
  BarChart3, 
  Home,
  ExternalLink,
  Palette,
  Layout,
  LogOut
} from 'lucide-react';

const DeveloperNavigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/developer', label: 'Главная', icon: Home },
    { href: '/developer/payments', label: 'Платежи', icon: CreditCard },
    { href: '/developer/button-builder', label: 'Конструктор кнопок', icon: Palette },
    { href: '/developer/templates', label: 'Шаблоны', icon: Layout },
    { href: '/developer/docs', label: 'Документация', icon: Code },
    { href: '/developer/analytics', label: 'Аналитика', icon: BarChart3 },
    { href: '/developer/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-sm border-b border-purple-600/30">
      <div className="px-6 py-4">
        <nav className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          <div className="ml-auto flex space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">Вернуться в банк</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token')
                window.location.href = '/developer/login'
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Выйти</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DeveloperNavigation;
