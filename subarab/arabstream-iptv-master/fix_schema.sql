-- هذه الأكواد ستقوم بتنظيف أي بقايا من المحاولات السابقة وبناء الجداول بشكل سليم 100%
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS iptv_accounts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

DROP TYPE IF EXISTS account_status CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS delivery_status_enum CASCADE;

-- 1. Create Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  country_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create IPTV Accounts Table (Inventory)
CREATE TYPE account_status AS ENUM ('available', 'used', 'revoked');

CREATE TABLE iptv_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  status account_status DEFAULT 'available',
  assigned_to UUID REFERENCES customers(id) DEFAULT NULL,
  plan_duration INTEGER NOT NULL, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 3. Create Orders Table
CREATE TYPE payment_status_enum AS ENUM ('completed', 'failed', 'refunded');
CREATE TYPE delivery_status_enum AS ENUM ('pending', 'retrying', 'delivered', 'failed');

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paddle_transaction_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  iptv_account_id UUID REFERENCES iptv_accounts(id) DEFAULT NULL,
  plan TEXT NOT NULL,
  amount_paid DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  payment_status payment_status_enum DEFAULT 'completed',
  delivery_status delivery_status_enum DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Reload schema cache if needed
NOTIFY pgrst, 'reload schema';
