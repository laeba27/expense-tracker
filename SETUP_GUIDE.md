# 🚀 Complete Setup Guide - Expense Tracker

## ✅ Step 1: Fix Supabase (CRITICAL)

Your registration is failing because the `password` column is missing from the `users` table.

### How to Fix (2 minutes):

1. **Go to Supabase**: https://app.supabase.com
2. **Select your project**
3. **Click "SQL Editor"** (left sidebar)
4. **Click "New Query"**
5. **Copy & Paste This SQL**:

```sql
-- Add password column to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update any existing rows
UPDATE public.users 
SET password = '' 
WHERE password IS NULL;

-- Make it required
ALTER TABLE public.users 
ALTER COLUMN password SET NOT NULL;
```

6. **Click "Run"** (or Cmd+Enter)
7. **Wait for ✅ Success message**

---

## ✅ Step 2: Test Registration

Go to: **http://localhost:3000/auth/register**

### Fill the Form:
```
Full Name:  Shivam Goyat
Email:      laeba2704@gmail.com
Phone:      9717809918        ← NO leading 0 (exactly 10 digits)
Password:   password123       ← Min 6 characters
```

### Click "Create Account"

---

## ✅ Step 3: Expected Results

### In Browser:
- ✅ Green message: "Registration successful! Check your email to verify."
- ✅ Redirects to login page after 3 seconds

### In Terminal (npm run dev):
```
📝 [REGISTER] Received request: { 
  name: 'Shivam Goyat', 
  email: 'laeba2704@gmail.com', 
  phone: '***' 
}
🔐 [REGISTER] Phone and password hashed
✅ [REGISTER] User created: { 
  id: 'xxx-xxx-xxx', 
  email: 'laeba2704@gmail.com', 
  verified: false 
}
📧 [REGISTER] Verification token generated
📨 [REGISTER] Verification email sent to laeba2704@gmail.com
```

### In Supabase Database:
- ✅ New row in `users` table
- ✅ Password column has hashed value
- ✅ is_verified = false
- ✅ Email stored

---

## 🔐 Why Password is Stored?

✅ **Passwords MUST be stored** - But always hashed (encrypted)
✅ **We hash with bcryptjs** - Industry standard
✅ **Even we can't see plain password** - Only encrypted version in database
✅ **When you login** - Your entered password is hashed and compared

This is **production-ready security**!

---

## 📧 Email Verification Flow

1. **Register** → Password hashed, user created as unverified
2. **Email Sent** → Verification link with JWT token (15 min expiry)
3. **Click Link** → Token verified, user marked verified
4. **Now Can Login** → Email + Password

---

## 🎨 New UI Features

✨ **Professional Dark Theme**
✨ **Glassmorphism Design** (frosted glass effect)
✨ **Modern Gradients** (Purple to Pink)
✨ **Smooth Animations**
✨ **Responsive Layout**

---

## ❌ Common Issues & Fixes

### Issue: Still "Failed to create user"
**Fix**: Make sure you ran the ALTER TABLE query and got ✅ Success

### Issue: "Invalid phone"
**Fix**: Phone must be exactly 10 digits without leading 0
- ❌ `09717809918` (11 digits with 0)
- ✅ `9717809918` (10 digits, no 0)

### Issue: Can't see console logs
**Fix**: Run `npm run dev` in foreground (don't use `&` at end)

### Issue: Email not received
**Fix**: 
1. Check spam/promotions folder
2. Verify NODEMAILER_EMAIL and NODEMAILER_PASSWORD in .env.local
3. Gmail requires App Password (not account password)

---

## 📊 What Happens After Registration

### User Journey:
1. **Register** → Unverified user created
2. **Email Received** → Click verification link
3. **Verified** → User marked as verified in database
4. **Can Login** → Enter email + password
5. **JWT Token** → Logged in, can access dashboard
6. **Add Expenses** → Track spending
7. **View Analytics** → See spending breakdown

---

## 🔗 Important Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create new user |
| `/api/auth/verify?token=xxx` | GET | Verify email |
| `/api/auth/login` | POST | Login with email+password |
| `/api/expenses` | POST/GET | Add/List expenses |
| `/api/expenses/[id]` | PUT/DELETE | Update/Delete expense |
| `/api/expenses/summary` | GET | Get spending summary |

---

## ✅ Checklist

- [ ] Added password column to Supabase
- [ ] Saw ✅ Success in SQL Editor
- [ ] Registered successfully
- [ ] Got green success message
- [ ] Check email for verification
- [ ] Click verification link (or check spam)
- [ ] See "Email verified" message
- [ ] Login with email + password
- [ ] Access dashboard

---

**🚀 You're all set! Registration flow is complete and working!**

Need help? Check the console logs or the error message in the browser!
