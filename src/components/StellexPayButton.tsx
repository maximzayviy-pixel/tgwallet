'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface StellexPayButtonProps {
  paymentUrl: string
  amount: number
  currency?: string
  description?: string
  className?: string
  style?: 'primary' | 'secondary' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

export default function StellexPayButton({
  paymentUrl,
  amount,
  currency = 'RUB',
  description,
  className = '',
  style = 'primary',
  size = 'md',
  disabled = false,
  onClick
}: StellexPayButtonProps) {
  
  const handleClick = () => {
    if (disabled) return
    
    if (onClick) {
      onClick()
    }
    
    // Открываем страницу оплаты
    window.open(paymentUrl, '_blank')
  }

  const getStyleClasses = () => {
    const baseClasses = 'font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2'
    
    switch (style) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl`
      case 'secondary':
        return `${baseClasses} bg-white/10 text-white border border-white/20 hover:bg-white/20`
      case 'minimal':
        return `${baseClasses} text-purple-400 hover:text-purple-300 underline`
      default:
        return baseClasses
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'md':
        return 'px-6 py-3 text-base'
      case 'lg':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-6 py-3 text-base'
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${getStyleClasses()}
        ${getSizeClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold">S</span>
      </div>
      <span>
        ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY
      </span>
      <span className="text-sm opacity-80">
        {formatAmount(amount, currency)}
      </span>
    </motion.button>
  )
}

// Компонент для встраивания в iframe
export function StellexPayEmbed({ paymentUrl, amount, currency = 'RUB' }: {
  paymentUrl: string
  amount: number
  currency?: string
}) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <StellexPayButton
        paymentUrl={paymentUrl}
        amount={amount}
        currency={currency}
        style="primary"
        size="lg"
        className="w-full"
      />
    </div>
  )
}

// HTML код для встраивания
export function generateEmbedCode(paymentUrl: string, amount: number, currency = 'RUB') {
  return `
<!-- Stellex Pay Button -->
<div id="stellex-pay-button" style="max-width: 400px; margin: 0 auto;">
  <button 
    onclick="window.open('${paymentUrl}', '_blank')"
    style="
      width: 100%;
      padding: 16px 24px;
      background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    "
    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(139, 92, 246, 0.4)'"
    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(139, 92, 246, 0.3)'"
  >
    <div style="
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    ">S</div>
    <span>ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY</span>
    <span style="font-size: 14px; opacity: 0.8;">
      ${new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)}
    </span>
  </button>
</div>
<!-- End Stellex Pay Button -->
  `.trim()
}
