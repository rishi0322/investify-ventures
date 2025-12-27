-- Add valuation column to startups for equity calculation
ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS valuation bigint DEFAULT 10000000;
ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS total_shares bigint DEFAULT 1000000;

-- Add equity tracking to investments
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS shares_acquired numeric DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS equity_percentage numeric DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS purchase_price_per_share numeric DEFAULT 0;

-- Add PIN and TPIN to user_wallets
ALTER TABLE public.user_wallets ADD COLUMN IF NOT EXISTS wallet_pin text;
ALTER TABLE public.user_wallets ADD COLUMN IF NOT EXISTS tpin text;
ALTER TABLE public.user_wallets ADD COLUMN IF NOT EXISTS pin_set boolean DEFAULT false;
ALTER TABLE public.user_wallets ADD COLUMN IF NOT EXISTS tpin_set boolean DEFAULT false;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars (drop first if they exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
END $$;

CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);