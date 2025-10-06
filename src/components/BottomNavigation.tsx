import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, History, Settings } from 'lucide-react'

interface BottomNavigationProps {
  activeTab: 'cards' | 'history' | 'settings'
  onTabChange: (tab: 'cards' | 'history' | 'settings') => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'cards' as const,
      label: 'Карты',
      icon: CreditCard
    },
    {
      id: 'history' as const,
      label: 'История',
      icon: History
    },
    {
      id: 'settings' as const,
      label: 'Настройки',
      icon: Settings
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-6 h-6 flex items-center justify-center mb-1 ${
                isActive ? 'text-white' : 'text-white/60'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${
                isActive ? 'text-white' : 'text-white/60'
              }`}>
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation
