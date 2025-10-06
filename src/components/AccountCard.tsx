import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, ChevronUp, ChevronDown } from 'lucide-react'

interface AccountCardProps {
  id: string
  name: string
  number: string
  balance: number
  type: 'current' | 'savings' | 'card'
  isExpanded?: boolean
  onToggle?: () => void
}

const AccountCard: React.FC<AccountCardProps> = ({
  id,
  name,
  number,
  balance,
  type,
  isExpanded = false,
  onToggle
}) => {
  const formatBalance = (amount: number) => {
    return amount.toLocaleString('ru-RU')
  }

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'current':
        return <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
      case 'savings':
        return <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
      case 'card':
        return <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
      default:
        return <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
    }
  }

  const getCardColor = (type: string) => {
    switch (type) {
      case 'current':
        return 'from-purple-500 to-pink-500'
      case 'savings':
        return 'from-green-500 to-emerald-500'
      case 'card':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getCardIcon(type)}
          <div>
            <div className="text-lg font-bold text-gray-900">{formatBalance(balance)}₽</div>
            <div className="text-sm text-gray-600">{name}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">{number}</div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-3 border-t border-gray-100"
        >
          <div className="flex space-x-2">
            <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium">
              Пополнить
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium">
              Перевести
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AccountCard
