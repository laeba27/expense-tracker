# ⚡ Quick Supabase Setup Guide

## The Error You're Seeing

```
❌ "Failed to create user"
   Reason: Could not find the 'password' column of 'users' in the schema cache
```

Your Supabase has the `users` table but it's **missing the password column**. This happened because we added password authentication after initial setup.

---

## ✅ Fix in 2 Minutes

### Step 1: Open Supabase SQL Editor
1. Go to [supabase.com](https://supabase.com)
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste the exact SQL below and click **Run** (or Cmd+Enter):

```sql
-- Add password column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT 'temp_password';

-- Remove the default constraint after adding the column
ALTER TABLE public.users 
ALTER COLUMN password DROP DEFAULT;
```

### Step 3: Verify Success
You should see ✅ **Success** message

---

## 🧪 Now Test Registration

Go to http://localhost:3000/auth/register and fill:

```
Name:     Shivam Goyat
Email:    laeba2704@gmail.com
Phone:    9717809918           ← NO leading 0! (exactly 10 digits)
Password: password123          ← Min 6 characters
```

### 🚨 Common Mistakes

❌ Phone: `09717809918` (11 digits with leading 0)
✅ Phone: `9717809918` (10 digits, no leading 0)

---

## 📊 What You Should See

**In Browser:**
- ✅ "Registration successful! Check your email to verify."

**In Terminal** (where `npm run dev` runs):
```
📝 [REGISTER] Received request: { name: 'Shivam Goyat', email: 'laeba2704@gmail.com', phone: '***' }
🔐 [REGISTER] Phone and password hashed
✅ [REGISTER] User created: { id: 'xxx-xxx-xxx', email: 'laeba2704@gmail.com', verified: false }
📧 [REGISTER] Verification token generated for laeba2704@gmail.com
📨 [REGISTER] Verification email sent to laeba2704@gmail.com
```

---

## 🔍 Full Database Schema

If you need to **recreate tables from scratch**, run:

```sql
-- Drop existing tables (⚠️ WARNING: Deletes all data!)
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Expenses Table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category);
```

---

## ✅ Checklist

- [ ] Opened Supabase Dashboard
- [ ] Navigated to SQL Editor
- [ ] Ran the ALTER TABLE query
- [ ] Saw ✅ Success message
- [ ] Filled registration form with correct phone (no leading 0)
- [ ] Got success message in browser
- [ ] Saw console logs in terminal

---

## 🆘 Still Not Working?

Check your Supabase connection:

1. Is `.env.local` filled with correct Supabase credentials?
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

2. Do the tables exist in Supabase? (Check SQL Editor)

3. Check server logs for exact error:
   ```bash
   tail -50 /tmp/dev_server.log | grep -A 2 "REGISTER"
   ```

---

**Need Help?** Rerun the ALTER TABLE query above! 🚀
