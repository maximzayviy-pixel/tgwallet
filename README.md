# 🏦 Stellex Bank - Telegram Mini App

Современное приложение для выпуска и управления виртуальными картами в Telegram с полноценным API для разработчиков.

## ✨ Особенности

- 🆓 **Бесплатный выпуск карт** - создание карт Stellex Bank без комиссий
- 🎨 **Современный дизайн** - Glass Morphism эффекты и анимации
- 🔗 **API для разработчиков** - полная интеграция с внешними сервисами
- 🗄️ **База данных Supabase** - надежное хранение данных
- 📱 **Telegram Mini App** - нативная интеграция с Telegram
- 🔒 **Безопасность** - Row Level Security и шифрование

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/telegram-cards-app.git
cd telegram-cards-app
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Скопируйте `env.example` в `.env.local`:
```bash
cp env.example .env.local
```

Заполните переменные:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
API_KEY=your_api_key_here

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 4. Настройка базы данных
1. Создайте проект в [Supabase](https://supabase.com)
2. Выполните SQL скрипт из `supabase-schema.sql`
3. Получите URL и ключ из настроек проекта

### 5. Запуск приложения
```bash
# Разработка
npm run dev

# Продакшн
npm run build
npm start
```

## 📚 API Документация

### Аутентификация
Все запросы требуют API ключ:
```
X-API-Key: your_api_key_here
```

### Endpoints

#### Получить карты пользователя
```http
GET /api/cards?telegram_id=123456789
```

#### Создать карту
```http
POST /api/cards
Content-Type: application/json

{
  "telegram_id": 123456789,
  "holder_name": "IVAN IVANOV",
  "api_key": "your_api_key"
}
```

#### Пополнить карту
```http
POST /api/cards/{card_id}/topup
Content-Type: application/json

{
  "amount": 1000,
  "api_key": "your_api_key",
  "external_id": "payment_123"
}
```

#### Вывести средства
```http
POST /api/cards/{card_id}/withdraw
Content-Type: application/json

{
  "amount": 500,
  "api_key": "your_api_key",
  "external_id": "withdrawal_123"
}
```

#### История транзакций
```http
GET /api/transactions?telegram_id=123456789&card_id=card_uuid
```

Подробная документация в [API_DOCS.md](./API_DOCS.md)

## 🏗️ Архитектура

### Frontend
- **Next.js 15** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Framer Motion** - анимации
- **Lucide React** - иконки

### Backend
- **Next.js API Routes** - серверная логика
- **Supabase** - база данных и аутентификация
- **PostgreSQL** - реляционная БД

### База данных
- **users** - пользователи Telegram
- **cards** - виртуальные карты
- **transactions** - история операций

## 🔧 Разработка

### Структура проекта
```
src/
├── app/
│   ├── api/           # API endpoints
│   ├── globals.css    # Глобальные стили
│   ├── layout.tsx     # Корневой layout
│   └── page.tsx       # Главная страница
├── components/        # React компоненты
├── lib/              # Утилиты и конфигурация
└── types/            # TypeScript типы
```

### Команды
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшна
npm run start        # Запуск продакшн версии
npm run lint         # Проверка кода
```

## 🚀 Деплой

### Vercel (рекомендуется)
1. Подключите GitHub репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой произойдет автоматически

### Другие платформы
Приложение совместимо с любыми платформами, поддерживающими Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS

## 🔒 Безопасность

- **Row Level Security** - изоляция данных пользователей
- **API ключи** - аутентификация запросов
- **Валидация** - проверка всех входных данных
- **HTTPS** - шифрование трафика

## 📱 Telegram Bot

### Настройка бота
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Настройте Menu Button с URL вашего приложения

### Webhook (опционально)
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.vercel.app/api/webhook"}'
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](https://github.com/your-username/telegram-cards-app/issues)
2. Создайте новый Issue с подробным описанием
3. Свяжитесь с нами через Telegram

## 🎯 Roadmap

- [ ] Мобильное приложение
- [ ] Интеграция с криптовалютами
- [ ] Многоязычность
- [ ] Расширенная аналитика
- [ ] Партнерская программа

---

**Stellex Bank** - Цифровой банк будущего 🚀