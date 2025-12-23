-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'investor', 'startup');

-- Create sector enum
CREATE TYPE public.startup_sector AS ENUM (
  'technology',
  'healthcare',
  'fintech',
  'edtech',
  'ecommerce',
  'green_energy',
  'real_estate',
  'consumer',
  'manufacturing',
  'agriculture',
  'logistics',
  'media_entertainment'
);

-- Create funding_stage enum
CREATE TYPE public.funding_stage AS ENUM (
  'pre_seed',
  'seed',
  'series_a',
  'series_b',
  'series_c'
);

-- Create verification_status enum
CREATE TYPE public.verification_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create startups table
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  sector startup_sector NOT NULL,
  funding_stage funding_stage NOT NULL DEFAULT 'seed',
  funding_goal BIGINT NOT NULL,
  amount_raised BIGINT NOT NULL DEFAULT 0,
  min_investment BIGINT NOT NULL DEFAULT 500,
  logo_url TEXT,
  pitch_video_url TEXT,
  pitch_deck_url TEXT,
  website_url TEXT,
  founded_year INTEGER,
  team_size INTEGER,
  location TEXT,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create investments table
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create watchlist table
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, startup_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own role on signup" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Startups policies
CREATE POLICY "Anyone can view approved startups" ON public.startups
  FOR SELECT USING (verification_status = 'approved');

CREATE POLICY "Founders can view own startups" ON public.startups
  FOR SELECT USING (auth.uid() = founder_id);

CREATE POLICY "Admins can view all startups" ON public.startups
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Founders can insert startups" ON public.startups
  FOR INSERT WITH CHECK (auth.uid() = founder_id AND public.has_role(auth.uid(), 'startup'));

CREATE POLICY "Founders can update own startups" ON public.startups
  FOR UPDATE USING (auth.uid() = founder_id);

CREATE POLICY "Admins can update any startup" ON public.startups
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Investments policies
CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (auth.uid() = investor_id);

CREATE POLICY "Founders can view investments in their startups" ON public.investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.startups 
      WHERE id = startup_id AND founder_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all investments" ON public.investments
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Investors can create investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Watchlist policies
CREATE POLICY "Users can view own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'investor')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update amount_raised when investment is made
CREATE OR REPLACE FUNCTION public.update_startup_raised()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.startups
  SET amount_raised = amount_raised + NEW.amount
  WHERE id = NEW.startup_id;
  RETURN NEW;
END;
$$;

-- Create trigger for investment
CREATE TRIGGER on_investment_created
  AFTER INSERT ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.update_startup_raised();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();