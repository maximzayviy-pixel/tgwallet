'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  Copy, 
  Download, 
  Eye, 
  Code, 
  Settings, 
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import DeveloperNavigation from '@/components/DeveloperNavigation'

interface ButtonConfig {
  style: 'primary' | 'secondary' | 'minimal' | 'gradient'
  size: 'sm' | 'md' | 'lg' | 'xl'
  color: string
  backgroundColor: string
  borderRadius: number
  padding: number
  fontSize: number
  fontWeight: 'normal' | 'bold' | 'extrabold'
  shadow: boolean
  hover: boolean
  icon: boolean
  width: 'auto' | 'full'
  alignment: 'left' | 'center' | 'right'
}

export default function ButtonBuilderPage() {
  const [config, setConfig] = useState<ButtonConfig>({
    style: 'gradient',
    size: 'md',
    color: '#ffffff',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: 'bold',
    shadow: true,
    hover: true,
    icon: true,
    width: 'full',
    alignment: 'center'
  })

  const [previewUrl, setPreviewUrl] = useState('https://tgwallet-ei8z.vercel.app/pay/stl_example_123')
  const [amount, setAmount] = useState(1000)
  const [currency, setCurrency] = useState('RUB')
  const [generatedCode, setGeneratedCode] = useState('')

  const generateCode = useCallback(() => {
    const buttonStyles: Record<string, Record<string, string>> = {
      primary: {
        background: config.backgroundColor,
        color: config.color,
        border: 'none'
      },
      secondary: {
        background: 'transparent',
        color: config.color,
        border: `2px solid ${config.backgroundColor}`
      },
      minimal: {
        background: 'transparent',
        color: config.backgroundColor,
        border: 'none',
        textDecoration: 'underline'
      },
      gradient: {
        background: `linear-gradient(135deg, ${config.backgroundColor} 0%, #3B82F6 100%)`,
        color: config.color,
        border: 'none'
      }
    }

    const sizeStyles: Record<string, Record<string, string>> = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' },
      xl: { padding: '20px 40px', fontSize: '20px' }
    }

    const currentStyle = buttonStyles[config.style]
    const currentSize = sizeStyles[config.size]

    const baseStyles: Record<string, string> = {
      ...currentStyle,
      ...currentSize,
      borderRadius: `${config.borderRadius}px`,
      fontWeight: config.fontWeight,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      width: config.width === 'full' ? '100%' : 'auto',
      textAlign: config.alignment,
      boxShadow: config.shadow ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
    }

    const hoverStyles: Record<string, string> = config.hover ? {
      transform: 'translateY(-2px)',
      boxShadow: config.shadow ? '0 6px 20px rgba(139, 92, 246, 0.4)' : '0 6px 20px rgba(0, 0, 0, 0.1)'
    } : {}

    const iconHtml = config.icon ? `
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
    ` : ''

    const amountFormatted = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)

    const htmlCode = `
<!-- Stellex Pay Button -->
<div id="stellex-pay-button" style="max-width: 400px; margin: 0 auto;">
  <button 
    onclick="window.open('${previewUrl}', '_blank')"
    style="${Object.entries(baseStyles).map(([key, value]) => `${key}: ${value}`).join('; ')}"
    onmouseover="${config.hover ? `this.style.transform='${hoverStyles.transform}'; this.style.boxShadow='${hoverStyles.boxShadow}';` : ''}"
    onmouseout="${config.hover ? `this.style.transform='translateY(0)'; this.style.boxShadow='${baseStyles.boxShadow}';` : ''}"
  >
    ${iconHtml}
    <span>ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY</span>
    <span style="font-size: ${parseInt(currentSize.fontSize) - 2}px; opacity: 0.8;">
      ${amountFormatted}
    </span>
  </button>
</div>
<!-- End Stellex Pay Button -->
    `.trim()

    setGeneratedCode(htmlCode)
  }, [config, previewUrl, amount, currency])

  useEffect(() => {
    generateCode()
  }, [generateCode])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    alert('Код скопирован в буфер обмена!')
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stellex-pay-button.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetConfig = () => {
    setConfig({
      style: 'gradient',
      size: 'md',
      color: '#ffffff',
      backgroundColor: '#8B5CF6',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontWeight: 'bold',
      shadow: true,
      hover: true,
      icon: true,
      width: 'full',
      alignment: 'center'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <DeveloperNavigation />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Конструктор кнопок Stellex Pay
            </h1>
            <p className="text-white/70 text-lg">
              Создайте и настройте кнопку оплаты для вашего сайта
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Настройки */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-dark p-6 rounded-2xl shadow-2xl"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Settings className="w-6 h-6 mr-3" />
                  Настройки кнопки
                </h2>

                <div className="space-y-6">
                  {/* Стиль */}
                  <div>
                    <label className="block text-white font-bold mb-3">Стиль кнопки</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'primary', label: 'Основной', color: '#8B5CF6' },
                        { value: 'secondary', label: 'Вторичный', color: '#6B7280' },
                        { value: 'minimal', label: 'Минимальный', color: '#8B5CF6' },
                        { value: 'gradient', label: 'Градиент', color: '#8B5CF6' }
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setConfig(prev => ({ ...prev, style: style.value as any }))}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            config.style === style.value
                              ? 'border-purple-400 bg-purple-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div 
                            className="w-full h-8 rounded-lg mb-2"
                            style={{ backgroundColor: style.color }}
                          />
                          <span className="text-white text-sm font-medium">{style.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Размер */}
                  <div>
                    <label className="block text-white font-bold mb-3">Размер</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['sm', 'md', 'lg', 'xl'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setConfig(prev => ({ ...prev, size: size as any }))}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            config.size === size
                              ? 'border-purple-400 bg-purple-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <span className="text-white text-sm font-medium uppercase">{size}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Цвета */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Цвет текста</label>
                      <input
                        type="color"
                        value={config.color}
                        onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-12 rounded-xl border-2 border-white/20 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2">Цвет фона</label>
                      <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-full h-12 rounded-xl border-2 border-white/20 bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Скругление */}
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Скругление углов: {config.borderRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={config.borderRadius}
                      onChange={(e) => setConfig(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Размер шрифта */}
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Размер шрифта: {config.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={config.fontSize}
                      onChange={(e) => setConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Настройки */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Тень</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.shadow}
                          onChange={(e) => setConfig(prev => ({ ...prev, shadow: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Эффект при наведении</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.hover}
                          onChange={(e) => setConfig(prev => ({ ...prev, hover: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Иконка Stellex</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.icon}
                          onChange={(e) => setConfig(prev => ({ ...prev, icon: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Ширина */}
                  <div>
                    <label className="block text-white font-bold mb-3">Ширина</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['auto', 'full'].map((width) => (
                        <button
                          key={width}
                          onClick={() => setConfig(prev => ({ ...prev, width: width as any }))}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            config.width === width
                              ? 'border-purple-400 bg-purple-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <span className="text-white text-sm font-medium">
                            {width === 'auto' ? 'Авто' : 'На всю ширину'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Выравнивание */}
                  <div>
                    <label className="block text-white font-bold mb-3">Выравнивание</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['left', 'center', 'right'].map((alignment) => (
                        <button
                          key={alignment}
                          onClick={() => setConfig(prev => ({ ...prev, alignment: alignment as any }))}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            config.alignment === alignment
                              ? 'border-purple-400 bg-purple-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <span className="text-white text-sm font-medium">
                            {alignment === 'left' ? '←' : alignment === 'center' ? '↔' : '→'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <button
                    onClick={resetConfig}
                    className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    Сбросить настройки
                  </button>
                </div>
              </motion.div>

              {/* Настройки платежа */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-dark p-6 rounded-2xl shadow-2xl"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Zap className="w-6 h-6 mr-3" />
                  Настройки платежа
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-bold mb-2">URL платежа</label>
                    <input
                      type="url"
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                      placeholder="https://tgwallet-ei8z.vercel.app/pay/stl_example_123"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Сумма</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2">Валюта</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-colors"
                      >
                        <option value="RUB">RUB</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Предварительный просмотр и код */}
            <div className="space-y-6">
              {/* Предварительный просмотр */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-dark p-6 rounded-2xl shadow-2xl"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Eye className="w-6 h-6 mr-3" />
                  Предварительный просмотр
                </h2>

                <div className="bg-white/5 p-6 rounded-xl">
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatedCode }}
                    className="pointer-events-none"
                  />
                </div>
              </motion.div>

              {/* Сгенерированный код */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-dark p-6 rounded-2xl shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Code className="w-6 h-6 mr-3" />
                    Сгенерированный код
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Копировать</span>
                    </button>
                    <button
                      onClick={downloadCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Скачать</span>
                    </button>
                  </div>
                </div>

                <div className="bg-black/20 p-4 rounded-xl overflow-x-auto">
                  <pre className="text-white/80 text-sm whitespace-pre-wrap">{generatedCode}</pre>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
