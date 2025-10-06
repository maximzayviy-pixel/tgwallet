# 🏦 Stellex Bank API Documentation

## 🔑 Аутентификация

Все запросы требуют API ключ в заголовке:
```
X-API-Key: your_api_key_here
```

## 📋 Endpoints

### 1. Получить карты пользователя
```http
GET /api/cards?telegram_id=123456789
```

**Параметры:**
- `telegram_id` (required) - ID пользователя в Telegram

**Ответ:**
```json
{
  "cards": [
    {
      "id": "card_uuid",
      "user_id": "user_uuid",
      "card_number": "4000000000000000",
      "holder_name": "IVAN IVANOV",
      "expiry_date": "12/27",
      "cvv": "123",
      "balance": 1000,
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Создать новую карту
```http
POST /api/cards
```

**Тело запроса:**
```json
{
  "telegram_id": 123456789,
  "holder_name": "IVAN IVANOV",
  "api_key": "your_api_key"
}
```

**Ответ:**
```json
{
  "card": {
    "id": "card_uuid",
    "user_id": "user_uuid",
    "card_number": "4000000000000000",
    "holder_name": "IVAN IVANOV",
    "expiry_date": "12/27",
    "cvv": "123",
    "balance": 0,
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Пополнить карту
```http
POST /api/cards/{card_id}/topup
```

**Тело запроса:**
```json
{
  "amount": 1000,
  "api_key": "your_api_key",
  "external_id": "payment_123" // опционально
}
```

**Ответ:**
```json
{
  "success": true,
  "transaction_id": "transaction_uuid",
  "new_balance": 1000
}
```

### 4. Вывести средства с карты
```http
POST /api/cards/{card_id}/withdraw
```

**Тело запроса:**
```json
{
  "amount": 500,
  "api_key": "your_api_key",
  "external_id": "withdrawal_123" // опционально
}
```

**Ответ:**
```json
{
  "success": true,
  "transaction_id": "transaction_uuid",
  "new_balance": 500
}
```

### 5. Получить историю транзакций
```http
GET /api/transactions?telegram_id=123456789&card_id=card_uuid
```

**Параметры:**
- `telegram_id` (required) - ID пользователя в Telegram
- `card_id` (optional) - ID конкретной карты

**Ответ:**
```json
{
  "transactions": [
    {
      "id": "transaction_uuid",
      "card_id": "card_uuid",
      "user_id": "user_uuid",
      "type": "topup",
      "amount": 1000,
      "description": "Top-up via API",
      "status": "completed",
      "external_id": "payment_123",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 📊 Типы транзакций

- `card_creation` - Создание карты
- `topup` - Пополнение
- `withdrawal` - Вывод средств
- `payment` - Платеж

## 📊 Статусы транзакций

- `pending` - В обработке
- `completed` - Завершена
- `failed` - Ошибка

## 📊 Статусы карт

- `active` - Активна
- `blocked` - Заблокирована
- `pending` - Ожидает активации

## 🔒 Коды ошибок

- `400` - Неверные параметры запроса
- `401` - Неверный API ключ
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## 💡 Примеры использования

### JavaScript/Node.js
```javascript
const API_KEY = 'your_api_key';
const BASE_URL = 'https://your-app.vercel.app';

// Создать карту
const createCard = async (telegramId, holderName) => {
  const response = await fetch(`${BASE_URL}/api/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      telegram_id: telegramId,
      holder_name: holderName
    })
  });
  return response.json();
};

// Пополнить карту
const topUpCard = async (cardId, amount) => {
  const response = await fetch(`${BASE_URL}/api/cards/${cardId}/topup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      amount: amount,
      external_id: `payment_${Date.now()}`
    })
  });
  return response.json();
};
```

### Python
```python
import requests

API_KEY = 'your_api_key'
BASE_URL = 'https://your-app.vercel.app'

# Создать карту
def create_card(telegram_id, holder_name):
    response = requests.post(
        f"{BASE_URL}/api/cards",
        headers={
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
        },
        json={
            'telegram_id': telegram_id,
            'holder_name': holder_name
        }
    )
    return response.json()

# Пополнить карту
def top_up_card(card_id, amount):
    response = requests.post(
        f"{BASE_URL}/api/cards/{card_id}/topup",
        headers={
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
        },
        json={
            'amount': amount,
            'external_id': f'payment_{int(time.time())}'
        }
    )
    return response.json()
```

## 🏦 О Stellex Bank

Stellex Bank - это современный цифровой банк, предоставляющий виртуальные карты для Telegram пользователей. Все карты привязаны к Telegram User ID и обеспечивают безопасные и быстрые транзакции.

### Особенности:
- ✅ Бесплатный выпуск карт
- ✅ Мгновенная активация
- ✅ Безопасные транзакции
- ✅ API для интеграции
- ✅ Поддержка Telegram Mini App
