# 🚀 Stellex Pay - Руководство для разработчиков

## Обзор

Stellex Pay — это современная платежная система, которая позволяет разработчикам легко интегрировать прием платежей в свои приложения. Создавайте платежные ссылки, встраивайте кнопки оплаты и получайте уведомления о статусе платежей.

## 🎯 Основные возможности

- ✅ **Быстрая интеграция** - Начните принимать платежи за несколько минут
- ✅ **Безопасность** - Все платежи защищены современными методами шифрования
- ✅ **Webhook уведомления** - Получайте уведомления о статусе платежей в реальном времени
- ✅ **Гибкая настройка** - Настраивайте кнопки и интеграции под ваши нужды
- ✅ **Простой API** - Интуитивно понятный REST API
- ✅ **Документация** - Подробная документация с примерами кода

## 🚀 Быстрый старт

### 1. Регистрация разработчика

1. Зайдите в [панель разработчика](https://tgwallet-ei8z.vercel.app/developer)
2. Создайте аккаунт или войдите через Telegram
3. Получите JWT токен для API

### 2. Создание первой платежной ссылки

```javascript
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
console.log(data.payment_url) // Ссылка для оплаты
```

### 3. Интеграция кнопки оплаты

```html
<!-- HTML код для встраивания кнопки -->
<button onclick="window.open('PAYMENT_URL', '_blank')">
  ОПЛАТИТЬ С ПОМОЩЬЮ STELLEX PAY
</button>
```

## 📚 API Документация

### Создание платежной ссылки

**POST** `/api/payments/create-link`

Создает новую платежную ссылку для приема платежей.

#### Заголовки
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### Тело запроса
```json
{
  "amount": 1000,
  "description": "Оплата за товар",
  "return_url": "https://yoursite.com/success",
  "webhook_url": "https://yoursite.com/webhook",
  "currency": "RUB",
  "expires_in": 3600
}
```

#### Ответ
```json
{
  "success": true,
  "payment_id": "stl_1234567890_abc123",
  "payment_url": "https://tgwallet-ei8z.vercel.app/pay/stl_1234567890_abc123",
  "amount": 1000,
  "currency": "RUB",
  "description": "Оплата за товар",
  "expires_at": "2024-01-01T12:00:00Z",
  "status": "pending"
}
```

### Получение списка платежных ссылок

**GET** `/api/payments/my-links`

Получает список всех платежных ссылок пользователя.

#### Заголовки
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Ответ
```json
{
  "success": true,
  "payment_links": [
    {
      "id": "stl_1234567890_abc123",
      "amount": 1000,
      "currency": "RUB",
      "description": "Оплата за товар",
      "status": "completed",
      "payment_url": "https://tgwallet-ei8z.vercel.app/pay/stl_1234567890_abc123",
      "created_at": "2024-01-01T10:00:00Z",
      "expires_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Получение информации о платеже

**GET** `/api/payments/[id]`

Получает информацию о конкретной платежной ссылке.

#### Ответ
```json
{
  "success": true,
  "payment_id": "stl_1234567890_abc123",
  "amount": 1000,
  "currency": "RUB",
  "description": "Оплата за товар",
  "status": "completed",
  "expires_at": "2024-01-01T12:00:00Z",
  "created_at": "2024-01-01T10:00:00Z"
}
```

## 🔗 Способы интеграции

### 1. Прямая ссылка

Самый простой способ — перенаправление пользователя на страницу оплаты:

```javascript
const paymentUrl = "https://tgwallet-ei8z.vercel.app/pay/stl_1234567890_abc123"
window.location.href = paymentUrl
```

### 2. Встраиваемая кнопка

Добавьте готовую кнопку оплаты на вашу страницу:

```html
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
```

### 3. React компонент

Используйте готовый React компонент:

```jsx
import StellexPayButton from 'stellex-pay-button'

function MyComponent() {
  return (
    <StellexPayButton
      paymentUrl="https://tgwallet-ei8z.vercel.app/pay/stl_1234567890_abc123"
      amount={1000}
      currency="RUB"
      description="Оплата за товар"
      style="primary"
      size="lg"
    />
  )
}
```

### 4. Webhook уведомления

Настройте webhook URL при создании платежа для получения уведомлений:

```javascript
// Настройте webhook URL при создании платежа
{
  "webhook_url": "https://yoursite.com/webhook",
  "amount": 1000,
  "description": "Оплата за товар"
}

// Обработка webhook на вашем сервере
app.post('/webhook', (req, res) => {
  const { payment_id, status, amount, description } = req.body
  
  if (status === 'completed') {
    // Обработка успешного платежа
    console.log('Платеж выполнен:', payment_id, amount)
    // Обновить статус заказа в вашей БД
  }
  
  res.json({ success: true })
})
```

## 🔒 Безопасность

- Все API запросы требуют JWT токен авторизации
- Платежи обрабатываются через защищенные каналы
- Webhook уведомления содержат только необходимую информацию
- Все данные шифруются при передаче

## 📊 Статусы платежей

- `pending` - Ожидает оплаты
- `completed` - Успешно оплачен
- `expired` - Истек срок действия
- `cancelled` - Отменен

## 🛠️ Поддержка

Если у вас возникли вопросы или проблемы:

1. Изучите [документацию](https://tgwallet-ei8z.vercel.app/developer/docs)
2. Проверьте [примеры кода](https://tgwallet-ei8z.vercel.app/developer/docs)
3. Обратитесь в поддержку

## 📈 Примеры использования

### Интернет-магазин
```javascript
// Создание платежа при оформлении заказа
const order = { id: 12345, total: 2500, items: [...] }

const payment = await createPaymentLink({
  amount: order.total,
  description: `Заказ #${order.id}`,
  return_url: `https://shop.com/order/${order.id}/success`,
  webhook_url: 'https://shop.com/api/payments/webhook'
})

// Перенаправление на оплату
window.location.href = payment.payment_url
```

### Подписка на сервис
```javascript
// Создание платежа за подписку
const subscription = { plan: 'premium', price: 999, duration: 'month' }

const payment = await createPaymentLink({
  amount: subscription.price,
  description: `Подписка ${subscription.plan} на ${subscription.duration}`,
  return_url: 'https://app.com/subscription/success',
  webhook_url: 'https://app.com/api/subscription/webhook'
})
```

### Цифровые товары
```javascript
// Создание платежа за цифровой товар
const product = { name: 'Курс программирования', price: 5000 }

const payment = await createPaymentLink({
  amount: product.price,
  description: product.name,
  return_url: 'https://course.com/purchase/success',
  webhook_url: 'https://course.com/api/purchase/webhook'
})
```

---

**Stellex Pay** - Современные платежи для ваших приложений 🚀
