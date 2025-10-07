'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Copy, ExternalLink, CreditCard, Settings, Zap } from 'lucide-react'

export default function DeveloperDocsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Скопировано в буфер обмена!')
  }

  const codeExamples = {
    createPayment: `// Создание платежной ссылки
const response = await fetch('https://tgwallet-ei8z.vercel.app/api/payments/create-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    amount: 1000,
    description: 'Оплата за товар',
    return_url: 'https://yoursite.com/success',
    webhook_url: 'https://yoursite.com/webhook',
    currency: 'RUB',
    expires_in: 3600
  })
})

const data = await response.json()
console.log(data.payment_url) // Ссылка для оплаты`,

    embedButton: `<!-- HTML код для встраивания кнопки -->
<div id="stellex-pay-button">
  <button 
    onclick="window.open('PAYMENT_URL', '_blank')"
    style="
      width: 100%;
      padding: 16px 24px;
      background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    "
  >
    <div style="width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">S</div>
    <span>ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY</span>
    <span style="font-size: 14px; opacity: 0.8;">1 000 ₽</span>
  </button>
</div>`,

    webhook: `// Webhook для получения уведомлений о платежах
app.post('/webhook', (req, res) => {
  const { payment_id, status, amount, description } = req.body
  
  if (status === 'completed') {
    // Обработка успешного платежа
    console.log('Платеж выполнен:', payment_id, amount)
    // Обновить статус заказа в вашей БД
  }
  
  res.json({ success: true })
})`,

    react: `import StellexPayButton from 'stellex-pay-button'

function MyComponent() {
  return (
    <StellexPayButton
      paymentUrl="https://tgwallet-ei8z.vercel.app/pay/stl_1234567890"
      amount={1000}
      currency="RUB"
      description="Оплата за товар"
      style="primary"
      size="lg"
    />
  )
}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Stellex Pay API</h1>
          <p className="text-xl text-white/70 mb-6">
            Интегрируйте платежи в ваши приложения
          </p>
          <div className="flex items-center justify-center space-x-4 text-white/60">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Быстрая интеграция</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Безопасные платежи</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Гибкие настройки</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-xl p-1">
          {[
            { id: 'overview', label: 'Обзор', icon: ExternalLink },
            { id: 'api', label: 'API', icon: Code },
            { id: 'integration', label: 'Интеграция', icon: Settings },
            { id: 'examples', label: 'Примеры', icon: Copy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-dark rounded-2xl p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Что такое Stellex Pay?</h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Stellex Pay — это современная платежная система, которая позволяет разработчикам 
                  легко интегрировать прием платежей в свои приложения. Создавайте платежные ссылки, 
                  встраивайте кнопки оплаты и получайте уведомления о статусе платежей.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-3">🚀 Быстрый старт</h3>
                  <p className="text-white/70">
                    Создайте платежную ссылку за несколько минут и начните принимать платежи
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-3">🔒 Безопасность</h3>
                  <p className="text-white/70">
                    Все платежи защищены современными методами шифрования и аутентификации
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-3">⚡ Производительность</h3>
                  <p className="text-white/70">
                    Быстрая обработка платежей и мгновенные уведомления
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-3">🛠️ Гибкость</h3>
                  <p className="text-white/70">
                    Настраиваемые кнопки, webhook&apos;и и интеграции с любыми платформами
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">API Endpoints</h2>
                <p className="text-white/80 mb-6">
                  Полный список доступных API методов для интеграции с Stellex Pay
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">POST /api/payments/create-link</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      Создание
                    </span>
                  </div>
                  <p className="text-white/70 mb-4">
                    Создает новую платежную ссылку для приема платежей
                  </p>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <pre className="text-white/80 text-sm">
{`Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "amount": 1000,
  "description": "Оплата за товар",
  "return_url": "https://yoursite.com/success",
  "webhook_url": "https://yoursite.com/webhook",
  "currency": "RUB",
  "expires_in": 3600
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">GET /api/payments/my-links</h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      Получение
                    </span>
                  </div>
                  <p className="text-white/70 mb-4">
                    Получает список всех платежных ссылок пользователя
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">GET /api/payments/[id]</h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      Получение
                    </span>
                  </div>
                  <p className="text-white/70 mb-4">
                    Получает информацию о конкретной платежной ссылке
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integration' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Способы интеграции</h2>
                <p className="text-white/80 mb-6">
                  Выберите подходящий способ интеграции Stellex Pay в ваше приложение
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">1. Прямая ссылка</h3>
                  <p className="text-white/70 mb-4">
                    Самый простой способ — перенаправление пользователя на страницу оплаты
                  </p>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <pre className="text-white/80 text-sm">
{`// Создайте ссылку и перенаправьте пользователя
const paymentUrl = "https://tgwallet-ei8z.vercel.app/pay/stl_1234567890"
window.location.href = paymentUrl`}
                    </pre>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">2. Встраиваемая кнопка</h3>
                  <p className="text-white/70 mb-4">
                    Добавьте готовую кнопку оплаты на вашу страницу
                  </p>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <pre className="text-white/80 text-sm">
{`<!-- HTML код для встраивания -->
<button onclick="window.open('PAYMENT_URL', '_blank')">
  ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY
</button>`}
                    </pre>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">3. React компонент</h3>
                  <p className="text-white/70 mb-4">
                    Используйте готовый React компонент для интеграции
                  </p>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <pre className="text-white/80 text-sm">
{`import StellexPayButton from 'stellex-pay-button'

<StellexPayButton
  paymentUrl={paymentUrl}
  amount={1000}
  currency="RUB"
  style="primary"
  size="lg"
/>`}
                    </pre>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">4. Webhook уведомления</h3>
                  <p className="text-white/70 mb-4">
                    Получайте уведомления о статусе платежей в реальном времени
                  </p>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <pre className="text-white/80 text-sm">
{`// Настройте webhook URL при создании платежа
{
  "webhook_url": "https://yoursite.com/webhook",
  "amount": 1000,
  "description": "Оплата за товар"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Примеры кода</h2>
                <p className="text-white/80 mb-6">
                  Готовые примеры для быстрого старта с Stellex Pay
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(codeExamples).map(([key, code]) => (
                  <div key={key} className="bg-white/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Копировать</span>
                      </button>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-white/80 text-sm whitespace-pre-wrap">{code}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
