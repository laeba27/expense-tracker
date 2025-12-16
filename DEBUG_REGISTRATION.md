# 🔍 Supabase Connection & Registration Flow - Complete Guide

## ⚠️ Current Problem

Your registration API is **failing silently** because the Supabase `users` table is **missing the `password` column**.

---

## ✅ Step 1: Verify Supabase is Connected

### Test the Connection:
Go to: **http://localhost:3000/api/test/supabase**

You should see one of:

✅ **SUCCESS Response:**
```json
{
  "status": "SUCCESS",
  "message": "Supabase is connected and working!",
  "details": {
    "usersTableAccessible": true,
    "supabaseUrl": "https://xxx.supabase.co",
    "anonKeyActive": true,
    "serviceRoleActive": true
  }
}
```

❌ **ERROR Response:**
```json
{
  "status": "ERROR",
  "message": "Failed to access users table",
  "error": "Could not find the 'users' table"
}
```

---

## ✅ Step 2: Fix Supabase Schema (CRITICAL)

### If you see ERROR above, run this SQL:

1. Go to: **https://app.supabase.com**
2. Select your project
3. Click **"SQL Editor"** → **"New Query"**
4. Copy & paste the complete SQL below:

```sql
-- ============================================
-- CREATE USERS TABLE WITH PASSWORD COLUMN
-- ============================================

-- Drop if exists (WARNING: This deletes all data!)
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If table exists but password column is missing, add it
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update existing rows with temp password if NULL
UPDATE public.users 
SET password = '' 
WHERE password IS NULL;

-- Make password NOT NULL
ALTER TABLE public.users 
ALTER COLUMN password SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================
-- CREATE EXPENSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- ============================================
-- VERIFY SCHEMA
-- ============================================

-- Check users table columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

5. **Click "Run"** (or Cmd+Enter)
6. **Wait for ✅ Success**

---

## ✅ Step 3: Test Connection Again

Go to: **http://localhost:3000/api/test/supabase**

Should now show ✅ **SUCCESS**

---

## ✅ Step 4: Complete Registration Flow

### Flow Diagram:
```
User Enters Form
    ↓
Submit Registration (POST /api/auth/register)
    ↓
Validate Input (name, email, phone, password)
    ↓
Hash Password (bcryptjs)
    ↓
Check if Email Already Exists
    ↓
Create User in Supabase (is_verified = false)
    ↓
Generate JWT Token (15 min expiry)
    ↓
Send Verification Email with Link
    ↓
User Clicks Link (GET /api/auth/verify?token=xxx)
    ↓
Token Verified
    ↓
Mark User as Verified (is_verified = true)
    ↓
Redirect to Login Page
    ↓
User Enters Email + Password (POST /api/auth/login)
    ↓
Hash & Compare Password
    ↓
Generate Auth Token (7 day expiry)
    ↓
Return JWT Token
    ↓
Redirect to Dashboard
    ↓
✅ Can Access All Expense APIs
```

---

## 🧪 Test Registration

### Go to: http://localhost:3000/auth/register

### Fill the form:
```
Full Name:  Shivam Goyat
Email:      test@example.com    (use NEW email each time)
Phone:      9717809918          (10 digits, NO leading 0)
Password:   password123         (min 6 chars)
```

### Click "Create Account"

---

## 📋 What Should Happen

### In Browser:
✅ Green success message: "Registration successful! Check your email to verify."

### In Terminal (where npm run dev runs):
```
📝 [REGISTER] Received request: { name: 'Shivam Goyat', email: 'test@example.com', phone: '***', hasPassword: true }
🔐 [REGISTER] Phone and password hashed
✅ [REGISTER] User created: { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', email: 'test@example.com', verified: false }
📧 [REGISTER] Verification token generated for test@example.com
📨 [REGISTER] Verification email sent to test@example.com
```

### In Supabase Dashboard:
1. Go to **"Table Editor"**
2. Click **"users"** table
3. Should see new row with:
   - ✅ name: 'Shivam Goyat'
   - ✅ email: 'test@example.com'
   - ✅ phone: 'hashed_value'
   - ✅ password: 'hashed_value'
   - ✅ is_verified: false
   - ✅ created_at: current timestamp

### In Email:
📧 You receive email with:
- Subject: "Verify Your Email"
- Button: "Verify Email" (links to http://localhost:3000/auth/verify?token=xxx)

---

## 🔐 Why This Architecture?

| Component | Why | Security |
|-----------|-----|----------|
| Password Hashing | Never store plain passwords | Bcryptjs with 10 rounds |
| Verification Tokens | Ensure real email | JWT with 15 min expiry |
| Auth Tokens | Session management | JWT with 7 day expiry |
| Phone Hashing | Privacy | Bcryptjs |
| Database Isolation | User data safety | Each user only sees own data |

---

## 🆘 Troubleshooting

### Issue: "Failed to create user"
**Solution**: Run the SQL above to add password column

### Issue: "Invalid phone"
**Solution**: Phone must be 10 digits without leading 0
- ❌ `09717809918`
- ✅ `9717809918`

### Issue: Email not received
**Solutions**:
1. Check spam/promotions folder
2. Verify NODEMAILER_EMAIL in .env.local
3. Check .env.local has correct Gmail App Password (not account password)

### Issue: "User already exists"
**Solution**: Register with a different email address

### Issue: Console logs not showing
**Solution**: Run `npm run dev` without `&` at the end (foreground mode)

---

## ✅ Final Checklist

- [ ] Ran Supabase test endpoint (Step 1)
- [ ] Saw SUCCESS response
- [ ] Ran SQL setup in Supabase (Step 2)
- [ ] Saw ✅ Success message
- [ ] Tested connection again (Step 3)
- [ ] Registered with new email (Step 4)
- [ ] Saw green success message
- [ ] Checked Supabase - new user visible
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Redirected to login
- [ ] Logged in with email + password
- [ ] Accessed dashboard

---

## 🚀 Now You're Ready!

Once registration flow works:
1. Test expense APIs (add/list/update/delete)
2. Test dashboard
3. Deploy to Vercel

**Questions? Check the console logs in terminal - they show exactly what's happening at each step!** 📝
