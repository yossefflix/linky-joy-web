
-- Streaming accounts pool (admin adds these manually)
CREATE TABLE public.streaming_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.streaming_accounts ENABLE ROW LEVEL SECURITY;

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL,
  paddle_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  streaming_account_id UUID REFERENCES public.streaming_accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS: Streaming accounts - users can see their assigned account
CREATE POLICY "Users can read own assigned account"
  ON public.streaming_accounts FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

-- RLS: Admin can manage streaming accounts (using has_role if exists, else service role)
-- For admin insert/update/delete we'll use service role in edge functions

-- Allow service role operations via edge functions (no additional policies needed as service role bypasses RLS)
