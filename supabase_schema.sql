-- Supabase Schema for Nodir Kitoblar Do'koni

-- 1. Users Table (Custom Auth for simplicity)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  password text not null,
  full_name text not null,
  phone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users are viewable by everyone." 
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile." 
  ON public.users FOR UPDATE USING (true);

-- 2. Books Table (Stores book catalog)
CREATE TABLE IF NOT EXISTS public.books (
  id text primary key,
  title text not null,
  author text not null,
  price numeric not null,
  "coverUrl" text,
  description text,
  category text,
  rating numeric,
  pages integer,
  year text,
  "isArchived" boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are viewable by everyone." 
  ON public.books FOR SELECT USING (true);

CREATE POLICY "Admins can insert books." 
  ON public.books FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update books." 
  ON public.books FOR UPDATE USING (true);

CREATE POLICY "Admins can delete books." 
  ON public.books FOR DELETE USING (true);

-- 3. Orders Table (Stores customer orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id text primary key,
  "userId" text,
  "customerName" text not null,
  "customerPhone" text not null,
  "customerAddress" text not null,
  "paymentType" text not null,
  "totalAmount" numeric not null,
  status text default 'new' not null,
  items jsonb not null,
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders are viewable by everyone." 
  ON public.orders FOR SELECT USING (true);

CREATE POLICY "Users can create their own orders." 
  ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders." 
  ON public.orders FOR UPDATE USING (true);

