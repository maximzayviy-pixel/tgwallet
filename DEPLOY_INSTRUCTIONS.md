# 🚀 Инструкция по деплою Stellex Bank на Vercel

## ✅ Проект готов к деплою!

### 📋 Шаги для деплоя:

#### 1. Загрузите код в GitHub
```bash
# Если еще не загружено
git add .
git commit -m "Stellex Bank - Complete App with API and Supabase"
git push origin main
```

#### 2. Настройте Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Выберите ваш GitHub репозиторий
4. Vercel автоматически определит Next.js

#### 3. Настройте переменные окружения в Vercel
В настройках проекта добавьте:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
API_KEY=your-api-key-here
TELEGRAM_BOT_TOKEN=your-bot-token-here
```

#### 4. Настройте Supabase
1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL из файла `supabase-schema.sql`
3. Получите URL и ключ из настроек проекта

#### 5. Деплой
Vercel автоматически задеплоит приложение после настройки переменных.

## 🔧 Если возникают проблемы:

### Проблема: "Cannot find module"
**Решение:** Очистите кэш Vercel:
1. В настройках проекта Vercel
2. Перейдите в "Functions" → "Clear Cache"
3. Перезапустите деплой

### Проблема: "Build failed"
**Решение:** Проверьте:
1. Все файлы загружены в GitHub
2. Переменные окружения настроены
3. Supabase проект создан

### Проблема: "API not working"
**Решение:** Проверьте:
1. Переменные Supabase корректны
2. База данных настроена
3. API ключи правильные

## 📱 После деплоя:

### 1. Настройте Telegram бота
1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Нажмите "Bot Settings" → "Menu Button"
4. Введите URL вашего приложения

### 2. Протестируйте API
```bash
# Создать карту
curl -X POST "https://your-app.vercel.app/api/cards" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"telegram_id": 123456789, "holder_name": "TEST USER"}'

# Пополнить карту
curl -X POST "https://your-app.vercel.app/api/cards/{card_id}/topup" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"amount": 1000, "external_id": "test_123"}'
```

## 🎯 Результат:
После деплоя у вас будет:
- ✅ Полноценное приложение Stellex Bank
- ✅ API для разработчиков
- ✅ База данных Supabase
- ✅ Telegram Mini App
- ✅ Бесплатный выпуск карт

## 📞 Поддержка:
Если возникли проблемы:
1. Проверьте логи в Vercel
2. Проверьте настройки Supabase
3. Убедитесь, что все файлы загружены

Удачи с деплоем! 🚀✨
