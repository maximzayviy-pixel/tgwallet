-- Stellex Bank Database Schema for Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_number VARCHAR(16) UNIQUE NOT NULL,
  holder_name VARCHAR(255) NOT NULL,
  expiry_date VARCHAR(5) NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('topup', 'payment', 'card_creation', 'withdrawal', 'transfer_out', 'transfer_in', 'telegram_stars_topup')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  external_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card verifications table
CREATE TABLE IF NOT EXISTS card_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_code VARCHAR(6) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  service_url VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card service bindings table
CREATE TABLE IF NOT EXISTS card_service_bindings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  service_url VARCHAR(500),
  binding_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_number ON cards(card_number);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_card_verifications_code ON card_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_card_verifications_card_id ON card_verifications(card_id);
CREATE INDEX IF NOT EXISTS idx_card_verifications_expires_at ON card_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_card_service_bindings_token ON card_service_bindings(binding_token);
CREATE INDEX IF NOT EXISTS idx_card_service_bindings_card_id ON card_service_bindings(card_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_service_bindings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Create RLS policies for cards table
CREATE POLICY "Users can view their own cards" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own cards" ON cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own cards" ON cards
  FOR UPDATE USING (true);

-- Create RLS policies for transactions table
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (true);

-- Create RLS policies for card_verifications table
CREATE POLICY "Users can view their own verifications" ON card_verifications
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own verifications" ON card_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own verifications" ON card_verifications
  FOR UPDATE USING (true);

-- Create RLS policies for card_service_bindings table
CREATE POLICY "Users can view their own bindings" ON card_service_bindings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own bindings" ON card_service_bindings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bindings" ON card_service_bindings
  FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO users (telegram_id, username, first_name, last_name) VALUES
  (123456789, 'testuser', 'Test', 'User')
ON CONFLICT (telegram_id) DO NOTHING;

-- Create a sample card for testing
INSERT INTO cards (user_id, card_number, holder_name, expiry_date, cvv, balance, status)
SELECT 
  u.id,
  '4000000000000000',
  'TEST USER',
  '12/27',
  '123',
  1000.00,
  'active'
FROM users u
WHERE u.telegram_id = 123456789
ON CONFLICT (card_number) DO NOTHING;
