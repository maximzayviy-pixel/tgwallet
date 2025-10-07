# Интеграция с Telegram Stars

## 🎯 Реализованная функциональность

### ✅ Пополнение через Telegram Stars
- **Курс**: 2 ⭐ = 1 ₽ (как в вашем примере)
- **Реальная интеграция**: Использует Telegram WebApp API
- **Безопасность**: API ключи для всех операций
- **Webhook**: Обработка успешных платежей

### 🔧 API Endpoints

#### 1. `/api/stars-invoice-bot` - Создание инвойса
```typescript
POST /api/stars-invoice-bot
{
  "amount_stars": 200,
  "tg_id": 123456789,
  "business_connection_id": "optional"
}
```

**Ответ:**
```json
{
  "ok": true,
  "link": "https://t.me/your_bot?start=pay_uuid",
  "invoice_id": "uuid",
  "amount": 200,
  "currency": "XTR"
}
```

#### 2. `/api/telegram-webhook` - Webhook для бота
```typescript
POST /api/telegram-webhook
// Обрабатывает:
// - Callback queries (кнопки подтверждения)
// - Successful payments (успешные платежи)
// - Pre-checkout queries
```

### 🗄️ База данных

#### Таблица `payment_requests`
```sql
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  card_id UUID REFERENCES cards(id),
  tg_id BIGINT NOT NULL,
  amount_rub DECIMAL(10,2) NOT NULL,
  amount_stars INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_amount_rub DECIMAL(10,2),
  paid_at TIMESTAMP,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🔄 Процесс пополнения

1. **Пользователь** выбирает количество звезд
2. **Приложение** создает запрос через `/api/stars-invoice-bot`
3. **Бот** получает ссылку и открывает чат с ботом
4. **Бот** создает инвойс в Telegram
5. **Пользователь** оплачивает звездами
6. **Webhook** получает уведомление об успешной оплате
7. **База данных** обновляется с транзакцией
8. **Баланс карты** автоматически пополняется

### 🛡️ Безопасность

- **API ключи**: Все endpoints защищены
- **Валидация**: Проверка всех входящих данных
- **RLS**: Row Level Security в Supabase
- **Webhook secret**: Опциональная проверка webhook

### 📱 Пользовательский интерфейс

#### TelegramStarsModal
- **Курс**: 2 ⭐ = 1 ₽
- **Пресеты**: 100, 200, 500, 1000 звезд
- **Валидация**: Проверка ввода
- **Уведомления**: Статус операций
- **Мобильная оптимизация**: Responsive design

### 🔧 Настройка

#### Переменные окружения
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Security
API_KEY=your_api_key

# Webhook (опционально)
TG_WEBHOOK_SECRET=your_webhook_secret
```

#### Настройка бота
1. Создайте бота через @BotFather
2. Получите токен и username
3. Настройте webhook: `https://yourdomain.com/api/telegram-webhook`
4. Добавьте команды:
   - `/start` - Приветствие
   - `/pay` - Обработка платежей

### 🚀 Развертывание

1. **Загрузите код** на сервер
2. **Установите зависимости**: `npm install`
3. **Настройте переменные** окружения
4. **Создайте таблицы** в Supabase (см. `database_schema.sql`)
5. **Настройте webhook** бота
6. **Запустите**: `npm run build && npm start`

### 📊 Мониторинг

#### Логи
- Все операции логируются в консоль
- Webhook запросы отслеживаются
- Ошибки записываются с деталями

#### Метрики
- Количество пополнений
- Суммы транзакций
- Статусы платежей
- Ошибки API

### 🔍 Отладка

#### Проверка webhook
```bash
curl -X POST https://yourdomain.com/api/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{"ok": true}'
```

#### Проверка API
```bash
curl -X POST https://yourdomain.com/api/stars-invoice-bot \
  -H "Content-Type: application/json" \
  -d '{"amount_stars": 100, "tg_id": 123456789}'
```

### 🎉 Готово!

Теперь у вас есть полноценная интеграция с Telegram Stars:
- ✅ Реальные платежи через Telegram
- ✅ Автоматическое пополнение баланса
- ✅ Безопасность и валидация
- ✅ Красивый интерфейс
- ✅ Мобильная оптимизация

**Курс**: 2 ⭐ = 1 ₽ (как в вашем примере)
**Безопасность**: API ключи для всех операций
**Интеграция**: Полная интеграция с Telegram WebApp
