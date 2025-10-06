# 🔧 Stellex Bank - API для разработчиков

Полноценная платежная система для интеграции в ваши приложения.

## 🚀 Быстрый старт

### 1. Получение API ключа
Обратитесь к администратору для получения API ключа.

### 2. Базовый URL
```
https://your-app.vercel.app/api
```

### 3. Аутентификация
Все запросы требуют API ключ в заголовке:
```
X-API-Key: your_api_key_here
```

## 💳 Управление картами

### Создание карты
```http
POST /api/cards
Content-Type: application/json
X-API-Key: your_api_key

{
  "telegram_id": 123456789,
  "holder_name": "IVAN IVANOV"
}
```

**Ответ:**
```json
{
  "id": "card_uuid",
  "card_number": "6666123456789012",
  "holder_name": "IVAN IVANOV",
  "expiry_date": "12/27",
  "cvv": "123",
  "balance": 0,
  "status": "active"
}
```

### Получение карт пользователя
```http
GET /api/cards?telegram_id=123456789
X-API-Key: your_api_key
```

## 💰 Операции с картами

### Пополнение карты
```http
POST /api/cards/{card_id}/topup
Content-Type: application/json
X-API-Key: your_api_key

{
  "amount": 1000,
  "external_id": "payment_123"
}
```

### Вывод средств
```http
POST /api/cards/{card_id}/withdraw
Content-Type: application/json
X-API-Key: your_api_key

{
  "amount": 500,
  "external_id": "withdrawal_123"
}
```

### Переводы между картами
```http
POST /api/transfer
Content-Type: application/json
X-API-Key: your_api_key

{
  "from_card_id": "card_uuid",
  "to_card_number": "6666123456789012",
  "amount": 1000,
  "description": "Перевод за услуги"
}
```

### Пополнение через Telegram Stars
```http
POST /api/telegram-stars/topup
Content-Type: application/json
X-API-Key: your_api_key

{
  "card_id": "card_uuid",
  "stars_amount": 100,
  "telegram_user_id": 123456789
}
```

## 🔐 Верификация карт для привязки

### 1. Запрос кода верификации
```http
POST /api/cards/verify
Content-Type: application/json
X-API-Key: your_api_key

{
  "card_number": "6666123456789012",
  "holder_name": "IVAN IVANOV",
  "expiry_date": "12/27",
  "cvv": "123",
  "service_name": "MyApp",
  "service_url": "https://myapp.com"
}
```

**Ответ:**
```json
{
  "success": true,
  "verification_id": "verification_uuid",
  "expires_at": "2024-01-01T12:05:00Z"
}
```

**Что происходит:**
- Пользователь получает код верификации в Telegram
- Код действителен 5 минут
- Пользователь вводит код в вашем приложении

### 2. Подтверждение кода
```http
POST /api/cards/confirm
Content-Type: application/json
X-API-Key: your_api_key

{
  "verification_id": "verification_uuid",
  "verification_code": "123456"
}
```

**Ответ:**
```json
{
  "success": true,
  "binding_token": "bind_1234567890_abc123",
  "card_data": {
    "id": "card_uuid",
    "number": "6666123456789012",
    "holder_name": "IVAN IVANOV",
    "expiry_date": "12/27",
    "balance": 1000
  },
  "user_data": {
    "telegram_id": 123456789,
    "first_name": "Ivan"
  }
}
```

### 3. Проверка привязки карты
```http
POST /api/cards/check-binding
Content-Type: application/json
X-API-Key: your_api_key

{
  "binding_token": "bind_1234567890_abc123"
}
```

## 📊 История транзакций

### Получение транзакций
```http
GET /api/transactions?telegram_id=123456789&card_id=card_uuid
X-API-Key: your_api_key
```

**Ответ:**
```json
[
  {
    "id": "transaction_uuid",
    "card_id": "card_uuid",
    "type": "topup",
    "amount": 1000,
    "description": "Пополнение карты",
    "status": "completed",
    "created_at": "2024-01-01T12:00:00Z"
  }
]
```

## 🔒 Безопасность

### Лимиты
- **Карты:** максимум 3 на пользователя
- **Коды верификации:** 5 минут жизни
- **Пополнения:** максимум 100,000 ₽ за раз
- **Переводы:** максимум 50,000 ₽ за раз

### Валидация
- Все суммы проверяются на положительность
- Проверка достаточности средств перед операциями
- Валидация номеров карт по алгоритму Луна
- Проверка статуса карт (только активные)

## 📱 Интеграция в приложение

### Пример интеграции (JavaScript)

```javascript
class StellexBankAPI {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Создание карты
  async createCard(telegramId, holderName) {
    return this.request('/api/cards', {
      method: 'POST',
      body: JSON.stringify({
        telegram_id: telegramId,
        holder_name: holderName
      })
    });
  }

  // Пополнение карты
  async topUpCard(cardId, amount, externalId) {
    return this.request(`/api/cards/${cardId}/topup`, {
      method: 'POST',
      body: JSON.stringify({
        amount: amount,
        external_id: externalId
      })
    });
  }

  // Верификация карты
  async verifyCard(cardData, serviceName) {
    return this.request('/api/cards/verify', {
      method: 'POST',
      body: JSON.stringify({
        ...cardData,
        service_name: serviceName
      })
    });
  }

  // Подтверждение кода
  async confirmVerification(verificationId, code) {
    return this.request('/api/cards/confirm', {
      method: 'POST',
      body: JSON.stringify({
        verification_id: verificationId,
        verification_code: code
      })
    });
  }
}

// Использование
const api = new StellexBankAPI('your_api_key', 'https://your-app.vercel.app');

// Создание карты
const card = await api.createCard(123456789, 'IVAN IVANOV');

// Пополнение
await api.topUpCard(card.id, 1000, 'payment_123');
```

## 🎯 Сценарии использования

### 1. Платежи в приложении
```javascript
// Пользователь выбирает карту для оплаты
const verification = await api.verifyCard({
  card_number: '6666123456789012',
  holder_name: 'IVAN IVANOV',
  expiry_date: '12/27',
  cvv: '123'
}, 'MyApp');

// Пользователь вводит код из Telegram
const binding = await api.confirmVerification(
  verification.verification_id, 
  '123456'
);

// Теперь можно списывать средства
await api.withdrawCard(binding.card_data.id, 100, 'payment_123');
```

### 2. Выплаты пользователям
```javascript
// Получение карт пользователя
const cards = await api.getUserCards(123456789);

// Выплата на карту
await api.topUpCard(cards[0].id, 500, 'payout_123');
```

### 3. Переводы между пользователями
```javascript
// Перевод с карты на карту
await api.transfer({
  from_card_id: 'card_uuid_1',
  to_card_number: '6666123456789012',
  amount: 1000,
  description: 'Перевод за услуги'
});
```

## 📞 Поддержка

- **Документация:** [API_DOCS.md](./API_DOCS.md)
- **Примеры:** [examples/](./examples/)
- **Telegram:** @stellex_support

---

**Stellex Bank** - Надежная платежная система для ваших приложений! 🚀
