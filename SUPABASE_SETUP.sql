-- ==========================================
-- SUPABASE DATABASE SETUP
-- ==========================================
-- Run these SQL commands in Supabase Dashboard > SQL Editor
-- Create Users Table with Password field
CREATE TABLE
    IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create Expenses Table
CREATE TABLE
    IF NOT EXISTS public.expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        description VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses (user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

-- Optional: Add RLS (Row Level Security) policies for security
-- Uncomment if needed:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;