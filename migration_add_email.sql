-- Миграция для добавления email и пароля к существующей таблице users

-- Добавляем новые колонки
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS language_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Создаем индекс для email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Обновляем RLS политики для поддержки email входа
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own cards" ON cards;
DROP POLICY IF EXISTS "Users can view own payment requests" ON payment_requests;

-- Политика для просмотра данных пользователя
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (
    telegram_id = (current_setting('request.jwt.claims', true)::json->>'tg_id')::bigint OR
    id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid
  );

-- Политика для обновления данных пользователя
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    telegram_id = (current_setting('request.jwt.claims', true)::json->>'tg_id')::bigint OR
    id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid
  );

-- Политика для транзакций
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid OR
    user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid
  );

-- Политика для карт
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (
    user_id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid OR
    user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid
  );

-- Политика для запросов на пополнение
CREATE POLICY "Users can view own payment requests" ON payment_requests
  FOR SELECT USING (
    tg_id = (current_setting('request.jwt.claims', true)::json->>'tg_id')::bigint OR
    user_id = (current_setting('request.jwt.claims', true)::json->>'id')::uuid
  );
