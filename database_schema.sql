-- Создание таблиц для системы пополнения через Telegram Stars

-- Таблица пользователей (если еще не создана)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  language_code VARCHAR(10),
  is_premium BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица карт (если еще не создана)
CREATE TABLE IF NOT EXISTS cards (
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

-- Таблица транзакций (если еще не создана)
CREATE TABLE IF NOT EXISTS transactions (
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

-- Таблица запросов на пополнение
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  tg_id BIGINT NOT NULL,
  amount_rub DECIMAL(10,2) NOT NULL,
  amount_stars INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
  paid_amount_rub DECIMAL(10,2),
  paid_at TIMESTAMP WITH TIME ZONE,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_payment_requests_tg_id ON payment_requests(tg_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS политики (если нужно)
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политика для payment_requests - пользователи могут видеть только свои запросы
DROP POLICY IF EXISTS "Users can view own payment requests" ON payment_requests;
CREATE POLICY "Users can view own payment requests" ON payment_requests
  FOR SELECT USING (tg_id = (current_setting('request.jwt.claims', true)::json->>'tg_id')::bigint);

-- Политика для transactions - пользователи могут видеть только свои транзакции
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);

-- Политика для cards - пользователи могут видеть только свои карты
DROP POLICY IF EXISTS "Users can view own cards" ON cards;
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);

-- Политика для users - пользователи могут видеть только свои данные
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'tg_id')::bigint);

-- Создаем таблицу для платежных ссылок разработчиков
CREATE TABLE IF NOT EXISTS payment_links (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    description TEXT NOT NULL,
    return_url TEXT,
    webhook_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для payment_links
CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(status);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_at ON payment_links(created_at);

-- RLS для payment_links
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Политика для payment_links - пользователи могут видеть только свои ссылки
DROP POLICY IF EXISTS "Users can view own payment links" ON payment_links;
CREATE POLICY "Users can view own payment links" ON payment_links
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid);

-- Политика для создания payment_links
DROP POLICY IF EXISTS "Users can create payment links" ON payment_links;
CREATE POLICY "Users can create payment links" ON payment_links
  FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid);

-- Политика для обновления payment_links
DROP POLICY IF EXISTS "Users can update own payment links" ON payment_links;
CREATE POLICY "Users can update own payment links" ON payment_links
  FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid);
