-- Fix security vulnerabilities

-- 1. Add check constraint for positive investment amounts
ALTER TABLE public.investments 
ADD CONSTRAINT positive_investment_amount CHECK (amount > 0);

-- 2. Update investment insert policy to require investor role
DROP POLICY IF EXISTS "Investors can create investments" ON public.investments;
CREATE POLICY "Investors can create investments" ON public.investments 
FOR INSERT 
WITH CHECK (
  auth.uid() = investor_id AND 
  public.has_role(auth.uid(), 'investor')
);

-- 3. Add non-negative balance constraint for wallet
ALTER TABLE public.user_wallets 
ADD CONSTRAINT non_negative_balance CHECK (balance >= 0);

-- 4. Restrict profile visibility to reduce PII exposure
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Allow users to view own profile
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow viewing profiles of users they have messaged with
CREATE POLICY "Users can view profiles of message contacts" ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT sender_id FROM messages WHERE receiver_id = auth.uid()
    UNION
    SELECT receiver_id FROM messages WHERE sender_id = auth.uid()
  )
);

-- Allow viewing profiles of founders of startups
CREATE POLICY "Users can view founder profiles" ON public.profiles 
FOR SELECT 
USING (
  id IN (SELECT founder_id FROM startups WHERE verification_status = 'approved')
);

-- 5. Fix handle_new_user to prevent role privilege escalation - force investor role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Force investor role for all new signups - prevents privilege escalation
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'investor');
  
  RETURN NEW;
END;
$function$;