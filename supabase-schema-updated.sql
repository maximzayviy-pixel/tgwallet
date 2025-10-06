-- Stellex Bank Database Schema
-- Updated for production use

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  total_spent DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_number VARCHAR(16) UNIQUE NOT NULL,
  holder_name VARCHAR(255) NOT NULL,
  expiry_date VARCHAR(5) NOT NULL,
  cvv VARCHAR(3) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'awaiting_activation' CHECK (status IN ('active', 'blocked', 'pending', 'awaiting_activation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'topup', 'payment', 'card_creation', 'withdrawal', 
    'transfer_out', 'transfer_in', 'telegram_stars_topup',
    'card_activation', 'card_block', 'refund'
  )),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  external_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card verifications table
CREATE TABLE IF NOT EXISTS card_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_code VARCHAR(6) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  service_url VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired', 'failed')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card service bindings table
CREATE TABLE IF NOT EXISTS card_service_bindings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  service_url VARCHAR(500),
  binding_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create API keys table for external services
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_number ON cards(card_number);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_card_verifications_code ON card_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_card_verifications_card_id ON card_verifications(card_id);
CREATE INDEX IF NOT EXISTS idx_card_verifications_expires_at ON card_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_card_verifications_status ON card_verifications(status);
CREATE INDEX IF NOT EXISTS idx_card_service_bindings_token ON card_service_bindings(binding_token);
CREATE INDEX IF NOT EXISTS idx_card_service_bindings_card_id ON card_service_bindings(card_id);
CREATE INDEX IF NOT EXISTS idx_card_service_bindings_status ON card_service_bindings(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_service_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for api_keys table (admin only)
CREATE POLICY "Only admins can access api_keys" ON api_keys
  FOR ALL USING (false);

-- Create RLS policies for audit_logs table (admin only)
CREATE POLICY "Only admins can access audit_logs" ON audit_logs
  FOR ALL USING (false);

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

CREATE TRIGGER update_card_service_bindings_updated_at BEFORE UPDATE ON card_service_bindings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for fund transfers
CREATE OR REPLACE FUNCTION transfer_funds(
  p_from_card_id UUID,
  p_to_card_id UUID,
  p_amount DECIMAL(15,2),
  p_description TEXT,
  p_from_user_id UUID,
  p_to_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  from_balance DECIMAL(15,2);
  to_balance DECIMAL(15,2);
BEGIN
  -- Check if from card has sufficient balance
  SELECT balance INTO from_balance FROM cards WHERE id = p_from_card_id;
  
  IF from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance on source card';
  END IF;
  
  -- Start transaction
  BEGIN
    -- Debit from source card
    UPDATE cards 
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE id = p_from_card_id;
    
    -- Credit to destination card
    UPDATE cards 
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE id = p_to_card_id;
    
    -- Record outgoing transaction
    INSERT INTO transactions (
      card_id, user_id, type, amount, description, status
    ) VALUES (
      p_from_card_id, p_from_user_id, 'transfer_out', p_amount, 
      p_description, 'completed'
    );
    
    -- Record incoming transaction
    INSERT INTO transactions (
      card_id, user_id, type, amount, description, status
    ) VALUES (
      p_to_card_id, p_to_user_id, 'transfer_in', p_amount, 
      p_description, 'completed'
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Transfer failed: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired verifications
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS VOID AS $$
BEGIN
  UPDATE card_verifications 
  SET status = 'expired' 
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to generate card number with Luhn algorithm
CREATE OR REPLACE FUNCTION generate_card_number(prefix VARCHAR(3))
RETURNS VARCHAR(16) AS $$
DECLARE
  base_number VARCHAR(13);
  check_digit INTEGER;
  i INTEGER;
  sum INTEGER := 0;
  digit INTEGER;
BEGIN
  -- Generate 13 random digits
  base_number := prefix || lpad(floor(random() * 1000000000000)::TEXT, 13, '0');
  
  -- Calculate Luhn check digit
  FOR i IN 1..13 LOOP
    digit := substring(base_number, i, 1)::INTEGER;
    IF i % 2 = 0 THEN
      digit := digit * 2;
      IF digit > 9 THEN
        digit := digit - 9;
      END IF;
    END IF;
    sum := sum + digit;
  END LOOP;
  
  check_digit := (10 - (sum % 10)) % 10;
  
  RETURN base_number || check_digit::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate card number using Luhn algorithm
CREATE OR REPLACE FUNCTION validate_card_number(card_number VARCHAR(16))
RETURNS BOOLEAN AS $$
DECLARE
  sum INTEGER := 0;
  digit INTEGER;
  i INTEGER;
BEGIN
  -- Check if card number is 16 digits
  IF length(card_number) != 16 THEN
    RETURN FALSE;
  END IF;
  
  -- Apply Luhn algorithm
  FOR i IN 1..16 LOOP
    digit := substring(card_number, i, 1)::INTEGER;
    IF i % 2 = 0 THEN
      digit := digit * 2;
      IF digit > 9 THEN
        digit := digit - 9;
      END IF;
    END IF;
    sum := sum + digit;
  END LOOP;
  
  RETURN (sum % 10) = 0;
END;
$$ LANGUAGE plpgsql;

-- Insert sample API key (for development)
INSERT INTO api_keys (key_hash, service_name, permissions) 
VALUES (
  crypt('stellex_dev_key_2024', gen_salt('bf')),
  'Stellex Bank Development',
  '{"cards": ["read", "create", "update"], "transactions": ["read", "create"], "transfers": ["create"]}'
) ON CONFLICT (key_hash) DO NOTHING;

-- Insert sample data (optional)
INSERT INTO users (telegram_id, username, first_name, last_name) 
VALUES (123456789, 'testuser', 'Test', 'User')
ON CONFLICT (telegram_id) DO NOTHING;

-- Create a sample card for testing
INSERT INTO cards (user_id, card_number, holder_name, expiry_date, cvv, balance, status)
SELECT 
  u.id,
  '6666123456789012',
  'TEST USER',
  '12/27',
  '123',
  1000.00,
  'active'
FROM users u 
WHERE u.telegram_id = 123456789
ON CONFLICT (card_number) DO NOTHING;

-- Create sample transaction
INSERT INTO transactions (card_id, user_id, type, amount, description, status)
SELECT 
  c.id,
  c.user_id,
  'card_creation',
  0.00,
  'Выпуск новой карты Stellex Bank',
  'completed'
FROM cards c 
WHERE c.card_number = '6666123456789012'
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create a view for card statistics
CREATE OR REPLACE VIEW card_stats AS
SELECT 
  u.telegram_id,
  u.first_name,
  u.last_name,
  COUNT(c.id) as total_cards,
  COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_cards,
  COALESCE(SUM(c.balance), 0) as total_balance,
  COALESCE(SUM(t.amount), 0) as total_transactions
FROM users u
LEFT JOIN cards c ON u.id = c.user_id
LEFT JOIN transactions t ON c.id = t.card_id
GROUP BY u.id, u.telegram_id, u.first_name, u.last_name;

-- Grant access to the view
GRANT SELECT ON card_stats TO authenticated;
