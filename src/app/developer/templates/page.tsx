'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Eye, Star, Zap, Shield, Heart, Sparkles } from 'lucide-react'
import DeveloperNavigation from '@/components/DeveloperNavigation'

interface Template {
  id: string
  name: string
  description: string
  category: string
  config: Record<string, unknown>
  preview: string
  icon: React.ComponentType<{ className?: string }>
}

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const templates: Template[] = [
    {
      id: 'modern-gradient',
      name: 'Современный градиент',
      description: 'Стильная кнопка с градиентным фоном и эффектами',
      category: 'Современные',
      icon: Sparkles,
      config: {
        style: 'gradient',
        size: 'lg',
        color: '#ffffff',
        backgroundColor: '#8B5CF6',
        borderRadius: 16,
        padding: 20,
        fontSize: 18,
        fontWeight: 'bold',
        shadow: true,
        hover: true,
        icon: true,
        width: 'full',
        alignment: 'center'
      },
      preview: 'ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY 1 000 ₽'
    },
    {
      id: 'minimal-clean',
      name: 'Минималистичная',
      description: 'Чистый дизайн без лишних элементов',
      category: 'Минималистичные',
      icon: Heart,
      config: {
        style: 'minimal',
        size: 'md',
        color: '#8B5CF6',
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        fontWeight: 'bold',
        shadow: false,
        hover: true,
        icon: false,
        width: 'auto',
        alignment: 'center'
      },
      preview: 'ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY 1 000 ₽'
    },
    {
      id: 'corporate-solid',
      name: 'Корпоративная',
      description: 'Строгий дизайн для бизнес-приложений',
      category: 'Корпоративные',
      icon: Shield,
      config: {
        style: 'primary',
        size: 'md',
        color: '#ffffff',
        backgroundColor: '#1F2937',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        fontWeight: 'bold',
        shadow: true,
        hover: true,
        icon: true,
        width: 'full',
        alignment: 'center'
      },
      preview: 'ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY 1 000 ₽'
    },
    {
      id: 'vibrant-orange',
      name: 'Яркая оранжевая',
      description: 'Энергичная кнопка с оранжевым градиентом',
      category: 'Яркие',
      icon: Zap,
      config: {
        style: 'gradient',
        size: 'lg',
        color: '#ffffff',
        backgroundColor: '#F97316',
        borderRadius: 20,
        padding: 20,
        fontSize: 18,
        fontWeight: 'extrabold',
        shadow: true,
        hover: true,
        icon: true,
        width: 'full',
        alignment: 'center'
      },
      preview: 'ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY 1 000 ₽'
    },
    {
      id: 'elegant-border',
      name: 'Элегантная с рамкой',
      description: 'Изящная кнопка с красивой рамкой',
      category: 'Элегантные',
      icon: Star,
      config: {
        style: 'secondary',
        size: 'md',
        color: '#8B5CF6',
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontWeight: 'bold',
        shadow: false,
        hover: true,
        icon: true,
        width: 'full',
        alignment: 'center'
      },
      preview: 'ОПЛАТИЬ С ПОМОЩЬЮ STELLEX PAY 1 000 ₽'
    },
    {
      id: 'compact-small',
      name: 'Компактная',
      description: 'Маленькая кнопка для ограниченного пространства',
      category: 'Компактные',
      icon: Zap,
      config: {
        style: 'primary',
        size: 'sm',
        color: '#ffffff',
        backgroundColor: '#10B981',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        fontWeight: 'bold',
        shadow: true,
        hover: true,
        icon: true,
        width: 'auto',
        alignment: 'center'
      },
      preview: 'ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY 1 000 ₽'
    }
  ]

  const categories = [...new Set(templates.map(t => t.category))]

  const generateCode = (template: Template) => {
    const { config } = template
    
    const buttonStyles = {
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

    const sizeStyles = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' },
      xl: { padding: '20px 40px', fontSize: '20px' }
    }

    const currentStyle = buttonStyles[config.style as keyof typeof buttonStyles]
    const currentSize = sizeStyles[config.size as keyof typeof sizeStyles]

    const baseStyles = {
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

    const hoverStyles = config.hover ? {
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

    const htmlCode = `
<!-- Stellex Pay Button - ${template.name} -->
<div id="stellex-pay-button" style="max-width: 400px; margin: 0 auto;">
  <button 
    onclick="window.open('YOUR_PAYMENT_URL', '_blank')"
    style="${Object.entries(baseStyles).map(([key, value]) => `${key}: ${value}`).join('; ')}"
    onmouseover="${config.hover ? `this.style.transform='${hoverStyles.transform}'; this.style.boxShadow='${hoverStyles.boxShadow}';` : ''}"
    onmouseout="${config.hover ? `this.style.transform='translateY(0)'; this.style.boxShadow='${baseStyles.boxShadow}';` : ''}"
  >
    ${iconHtml}
    <span>ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY</span>
    <span style="font-size: ${parseInt(currentSize.fontSize) - 2}px; opacity: 0.8;">
      1 000 ₽
    </span>
  </button>
</div>
<!-- End Stellex Pay Button -->
    `.trim()

    return htmlCode
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Код скопирован в буфер обмена!')
  }

  const downloadCode = (code: string, name: string) => {
    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stellex-pay-${name.toLowerCase().replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <DeveloperNavigation />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Шаблоны кнопок Stellex Pay
            </h1>
            <p className="text-white/70 text-lg">
              Готовые дизайны кнопок для быстрого старта
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTemplate(null)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                !selectedTemplate
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Все шаблоны
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl font-medium transition-all bg-white/10 text-white/70 hover:bg-white/20"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-dark p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                {/* Template Preview */}
                <div className="mb-6">
                  <div className="bg-white/5 p-6 rounded-xl mb-4">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: generateCode(template).replace('YOUR_PAYMENT_URL', '#') 
                      }}
                      className="pointer-events-none"
                    />
                  </div>
                </div>

                {/* Template Info */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <template.icon className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">{template.name}</h3>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{template.description}</p>
                  <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                    {template.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="flex-1 py-2 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Предпросмотр</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(generateCode(template))}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Копировать</span>
                  </button>
                  <button
                    onClick={() => downloadCode(generateCode(template), template.name)}
                    className="py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected Template Modal */}
          {selectedTemplate && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedTemplate.name}
                  </h2>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Preview */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Предварительный просмотр</h3>
                    <div className="bg-white/5 p-6 rounded-xl">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: generateCode(selectedTemplate).replace('YOUR_PAYMENT_URL', '#') 
                        }}
                        className="pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Code */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Код для встраивания</h3>
                    <div className="bg-black/20 p-4 rounded-xl overflow-x-auto">
                      <pre className="text-white/80 text-sm whitespace-pre-wrap">
                        {generateCode(selectedTemplate)}
                      </pre>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => copyToClipboard(generateCode(selectedTemplate))}
                        className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Копировать код</span>
                      </button>
                      <button
                        onClick={() => downloadCode(generateCode(selectedTemplate), selectedTemplate.name)}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Скачать</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
