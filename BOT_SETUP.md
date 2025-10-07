# Настройка Telegram бота @stellexbank_bot

## 🤖 Настройка бота

### 1. Получите токен бота
1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/mybots`
3. Выберите вашего бота `@stellexbank_bot`
4. Нажмите "API Token"
5. Скопируйте токен

### 2. Настройте переменные окружения

В Vercel или вашем хостинге добавьте:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=stellexbank_bot
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram-webhook

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Security
API_KEY=your-api-key
```

### 3. Настройте webhook

Отправьте POST запрос для настройки webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram-webhook",
    "allowed_updates": ["message", "callback_query", "pre_checkout_query"]
  }'
```

### 4. Настройте команды бота

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Запустить бота"},
      {"command": "pay", "description": "Обработать платеж"},
      {"command": "balance", "description": "Показать баланс"},
      {"command": "help", "description": "Помощь"}
    ]
  }'
```

## 🔄 Процесс пополнения

### 1. Пользователь нажимает "Пополнить звездами"
- Приложение создает запрос через `/api/stars-invoice-bot`
- Генерируется ссылка: `https://t.me/stellexbank_bot?start=pay_uuid`

### 2. Пользователь переходит по ссылке
- Открывается чат с ботом `@stellexbank_bot`
- Бот получает команду `/start pay_uuid`

### 3. Бот обрабатывает команду
- Извлекает UUID из параметра
- Создает инвойс в Telegram
- Пользователь оплачивает звездами

### 4. Webhook получает уведомление
- `/api/telegram-webhook` обрабатывает успешный платеж
- Обновляет баланс в базе данных
- Уведомляет пользователя

## 📱 Команды бота

### `/start pay_uuid`
Обрабатывает запрос на пополнение:
1. Находит запрос по UUID
2. Создает инвойс в Telegram
3. Отправляет пользователю для оплаты

### `/balance`
Показывает текущий баланс пользователя

### `/help`
Показывает список доступных команд

## 🛠️ Разработка

### Тестирование webhook локально
Используйте ngrok для тестирования:

```bash
# Установите ngrok
npm install -g ngrok

# Запустите туннель
ngrok http 3000

# Настройте webhook на ngrok URL
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-ngrok-url.ngrok.io/api/telegram-webhook"}'
```

### Логирование
Все операции логируются в консоль:
- Создание запросов на пополнение
- Обработка webhook
- Успешные платежи
- Ошибки

## 🚀 Готово!

После настройки:
1. ✅ Бот будет правильно обрабатывать ссылки
2. ✅ Webhook будет получать уведомления
3. ✅ Баланс будет обновляться автоматически
4. ✅ Пользователи смогут пополнять через звезды

**Ваш бот**: [@stellexbank_bot](https://t.me/stellexbank_bot)
