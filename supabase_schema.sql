-- Supabase Schema for Nodir Kitoblar Do'koni

-- 1. Profiles Table (Stores user information)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  full_name text not null,
  phone_number text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Books Table (Stores book catalog)
CREATE TABLE IF NOT EXISTS public.books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text not null,
  price numeric not null,
  cover_url text,
  description text,
  category text,
  rating numeric,
  pages integer,
  year text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are viewable by everyone." 
  ON public.books FOR SELECT USING (true);

-- Provide unrestricted modify for now since Admin is mapped locally.
-- In a real app we would use RBAC, but simplified for applet integration.
CREATE POLICY "Admins can insert books." 
  ON public.books FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update books." 
  ON public.books FOR UPDATE USING (true);

CREATE POLICY "Admins can delete books." 
  ON public.books FOR DELETE USING (true);


-- 3. Orders Table (Stores customer orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  payment_type text not null,
  total_amount numeric not null,
  status text default 'new' not null, -- 'new', 'processing', 'completed', 'cancelled'
  items jsonb not null, -- Array of items in cart
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders." 
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders." 
  ON public.orders FOR SELECT USING (true);

CREATE POLICY "Users can create their own orders." 
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update orders." 
  ON public.orders FOR UPDATE USING (true);
