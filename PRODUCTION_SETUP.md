# Настройка для продакшена

## 🔑 Необходимые API ключи

Для работы приложения в продакшене необходимо настроить следующие переменные окружения в Vercel:

### 1. Supabase (обязательно)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. API ключ (обязательно)
```
API_KEY=your_secure_api_key
```

### 3. Telegram (опционально)
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## 🚀 Как получить ключи

### Supabase:
1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. В настройках проекта найдите "API"
4. Скопируйте:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### API ключ:
Создайте случайный секретный ключ (минимум 32 символа):
```bash
openssl rand -hex 32
```

### Telegram Bot:
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен → `TELEGRAM_BOT_TOKEN`

## 📊 База данных

Создайте следующие таблицы в Supabase:

### Таблица `users`:
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Таблица `cards`:
```sql
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_number TEXT UNIQUE NOT NULL,
  holder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Таблица `transactions`:
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Безопасность

1. **Никогда не коммитьте** `.env` файлы
2. **Используйте сильные API ключи** (минимум 32 символа)
3. **Настройте RLS** в Supabase для защиты данных
4. **Регулярно ротируйте** API ключи

## ✅ Проверка настройки

После настройки всех переменных:
1. Перезапустите приложение
2. Проверьте консоль - не должно быть ошибок API ключей
3. Попробуйте создать карту
4. Проверьте пополнение звездами

## 🆘 Поддержка

Если что-то не работает:
1. Проверьте логи в Vercel
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к Supabase
4. Убедитесь, что Telegram WebApp API доступен
