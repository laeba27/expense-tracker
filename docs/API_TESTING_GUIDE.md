# 🔐 Complete Authentication Flow - API Testing Guide

## 📋 Flow Overview

```
1. REGISTER (POST) → User created as unverified (is_verified = false)
                     ↓ Verification email sent with 15-min token
                     
2. VERIFY (GET)   → User clicks email link
                     ↓ Token validated (must be within 15 min)
                     ↓ User marked as verified (is_verified = true)
                     ↓ Redirect to login
                     
3. LOGIN (POST)   → User can now login with email + password
                     ↓ Only if is_verified = true
                     ↓ Password compared with hash
                     ↓ 7-day auth token generated
```

---

## 🚀 Step 1: Registration

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "name": "Shivam Goyat",
  "email": "shivam@example.com",
  "phone": "9717809918",
  "password": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully. Check your email to verify.",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Console Output (Terminal):**
```
📝 [REGISTER] Received request: { name: 'Shivam Goyat', email: 'shivam@example.com', phone: '***', hasPassword: true }
🔐 [REGISTER] Phone and password hashed
✅ [REGISTER] User created: { id: 'f47ac10b...', email: 'shivam@example.com', verified: false }
🎫 [REGISTER] Verification token generated - expires in 15 minutes
📨 [REGISTER] Verification email sent to shivam@example.com
```

**Error Cases:**

| Error | Status | When | Solution |
|-------|--------|------|----------|
| Name too short | 400 | name < 2 chars | Use name with 2+ chars |
| Invalid email | 400 | email format wrong | Use valid email: user@example.com |
| Invalid phone | 400 | phone != 10 digits | Use 10-digit phone |
| Password too short | 400 | password < 6 chars | Use 6+ char password |
| User exists | 409 | email already registered | Use different email |
| Missing password column | 500 | schema issue | Add password column to Supabase |

---

## 📧 Step 2: Email Verification (Automatic)

**What Happens:**
1. Registration API sends verification email
2. Email contains link: `http://localhost:3000/auth/verify?token=eyJ...`
3. User clicks link in email

**Email Contains:**
```
To: shivam@example.com
Subject: Verify Your Email - Expense Tracker

Please verify your email to complete your registration.
Click the link below to verify your email (valid for 15 minutes):

[Verify Email Button]
http://localhost:3000/auth/verify?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Step 2b: Test Verification Manually (For Testing Without Email)

**Endpoint:** `GET http://localhost:3000/auth/verify?token=YOUR_TOKEN_HERE`

**Steps:**
1. Register user (get token from response)
2. Copy token from response
3. Visit: `http://localhost:3000/auth/verify?token=PASTE_TOKEN_HERE`

**Console Output (Terminal):**
```
📧 [VERIFY] Email verification link clicked with token: present (****)
✅ [VERIFY] Token decoded successfully for user: f47ac10b-58cc-4372-a567-0e02b2c3d479
✅ [VERIFY] User marked as verified in database: shivam@example.com
✅ [VERIFY] Redirecting to login - user can now login with password
```

**What Happens:**
- ✅ Redirects to `/auth/login?success=verified`
- ✅ URL shows green success message
- ✅ User is now verified in database (`is_verified = true`)

**Error Cases:**

| Error | Console | When | Solution |
|-------|---------|------|----------|
| no-token | "No token provided in URL" | Token missing from link | Copy full link from email |
| invalid-token | "Token verification failed" | Token expired (>15 min) | Request new verification |
| user-not-found | "User not found after update" | User deleted | Register again |
| server-error | Unexpected error | Database issue | Check Supabase status |

---

## 🔑 Step 3: Login

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "email": "shivam@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDdhYzEwYi1...",
  "user": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Shivam Goyat",
    "email": "shivam@example.com"
  }
}
```

**Console Output (Terminal):**
```
🔑 [LOGIN] Received login request for: shivam@example.com
🔍 [LOGIN] Looking up user in database...
✅ [LOGIN] User found - email: shivam@example.com verified: true
✅ [LOGIN] Email verified - checking password...
✅ [LOGIN] Password verified
✅ [LOGIN] Generated 7-day auth token
✅ [LOGIN] User logged in successfully: { id: 'f47ac10b...', email: 'shivam@example.com' }
```

**Error Cases:**

| Error | Status | When | Solution |
|-------|--------|------|----------|
| Invalid email format | 400 | email format wrong | Use valid email |
| Password required | 400 | password missing | Include password field |
| Invalid email or password | 401 | email not found | Register first |
| Invalid email or password | 401 | wrong password | Check password spelling |
| Email not verified | 403 | is_verified = false | Click verification link in email |

---

## 📝 CURL Commands for Testing

### 1️⃣ Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shivam Goyat",
    "email": "shivam@example.com",
    "phone": "9717809918",
    "password": "SecurePass123"
  }'
```

### 2️⃣ Verify (Replace TOKEN with response from step 1)
```bash
# Open in browser or use curl:
curl "http://localhost:3000/auth/verify?token=TOKEN_FROM_REGISTER_RESPONSE"
```

### 3️⃣ Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shivam@example.com",
    "password": "SecurePass123"
  }'
```

---

## 🧪 Complete Test Flow (Step by Step)

### Terminal 1: Watch Logs
```bash
cd /Users/laebafirdous/Desktop/webdev/expense-tracker
npm run dev
# Watch for console logs showing flow
```

### Terminal 2: Run Tests

**Step 1: Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9717809918",
    "password": "password123"
  }' | jq .
```

**Copy the token from response** ✅

**Step 2: Verify Email**
```bash
# In browser or terminal:
curl "http://localhost:3000/auth/verify?token=PASTE_TOKEN_HERE"
```

**Step 3: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq .
```

---

## 🔐 Token Information

### Registration Token (15 minutes)
- **Purpose:** Email verification only
- **Expiry:** 15 minutes from generation
- **Used in:** Verification link
- **Cannot be used for:** Login or API access

**Example:**
```json
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "shivam@example.com",
  "iat": 1702734330,
  "exp": 1702735230  // 15 min from now
}
```

### Auth Token (7 days)
- **Purpose:** User login & API access
- **Expiry:** 7 days from generation
- **Used in:** Login response & Bearer header for API calls
- **Can be used for:** Dashboard, expenses APIs

**Example:**
```json
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "shivam@example.com",
  "iat": 1702734330,
  "exp": 1702993530  // 7 days from now
}
```

---

## 🗄️ Database State

### After Registration
```sql
SELECT * FROM users WHERE email = 'shivam@example.com';

-- Result:
id:         f47ac10b-58cc-4372-a567-0e02b2c3d479
name:       Shivam Goyat
email:      shivam@example.com
phone:      $2a$10$... (hashed)
password:   $2a$10$... (hashed)
is_verified: false        ← NOT VERIFIED YET
created_at: 2025-12-16T15:30:00
```

### After Email Verification
```sql
SELECT * FROM users WHERE email = 'shivam@example.com';

-- Result:
id:         f47ac10b-58cc-4372-a567-0e02b2c3d479
name:       Shivam Goyat
email:      shivam@example.com
phone:      $2a$10$... (hashed)
password:   $2a$10$... (hashed)
is_verified: true         ← VERIFIED ✅
created_at: 2025-12-16T15:30:00
verified_at: 2025-12-16T15:45:00
```

---

## ✅ What Should Happen (Complete Flow)

### 1. User Registers
- ✅ Form submitted with name, email, phone, password
- ✅ API validates all fields
- ✅ Password hashed with bcryptjs (10 rounds)
- ✅ Phone hashed with bcryptjs (10 rounds)
- ✅ User created in Supabase with `is_verified = false`
- ✅ 15-minute verification token generated
- ✅ Verification email sent to inbox/spam
- ✅ Frontend shows green success message

### 2. User Receives Email
- ✅ Email arrives in inbox/spam within 5 seconds
- ✅ Email contains verification link with token
- ✅ Link valid for 15 minutes only

### 3. User Clicks Verification Link
- ✅ Link opens verify endpoint with token
- ✅ Token decoded and validated
- ✅ User marked as verified in database (`is_verified = true`)
- ✅ Redirect to login page with success message

### 4. User Logs In
- ✅ User enters email + password
- ✅ User looked up in database by email
- ✅ Verified status checked (`is_verified = true`)
- ✅ Password compared with hash using bcryptjs
- ✅ 7-day auth token generated
- ✅ Token returned to frontend
- ✅ Frontend redirects to dashboard
- ✅ User can now access protected APIs

---

## 🐛 Troubleshooting

### "Email not verified" on login
- **Cause:** User didn't click verification link
- **Fix:** Send new verification email or use test endpoint with token

### "User not found"
- **Cause:** Email not in database
- **Fix:** Register first with correct email

### "Invalid password"
- **Cause:** Wrong password entered
- **Fix:** Check password spelling (case-sensitive)

### "Token expired"
- **Cause:** Verification link older than 15 minutes
- **Fix:** Request new verification email

### "Internal server error" on register
- **Cause:** Missing password column in Supabase
- **Fix:** Run SQL to add password column

### Email not arriving
- **Cause:** Gmail app password incorrect or email not configured
- **Fix:** Update `.env.local` with correct Gmail app password

---

## 📊 API Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | User created | Registration success |
| 200 | OK | Login success, verification success |
| 400 | Bad request | Invalid email, short password |
| 401 | Unauthorized | Wrong password, user not found |
| 403 | Forbidden | Email not verified |
| 404 | Not found | Resource doesn't exist |
| 409 | Conflict | User already exists |
| 500 | Server error | Database error, email service down |

---

## 🎯 Expected Console Output (Full Flow)

```
📝 [REGISTER] Received request: { name: 'Test User', email: 'test@example.com', ... }
🔐 [REGISTER] Phone and password hashed
✅ [REGISTER] User created: { id: 'xxx', email: 'test@example.com', verified: false }
🎫 [REGISTER] Verification token generated - expires in 15 minutes
📨 [REGISTER] Verification email sent to test@example.com

📧 [VERIFY] Email verification link clicked with token: present (****)
✅ [VERIFY] Token decoded successfully for user: xxx
✅ [VERIFY] User marked as verified in database: test@example.com
✅ [VERIFY] Redirecting to login - user can now login with password

🔑 [LOGIN] Received login request for: test@example.com
🔍 [LOGIN] Looking up user in database...
✅ [LOGIN] User found - email: test@example.com verified: true
✅ [LOGIN] Email verified - checking password...
✅ [LOGIN] Password verified
✅ [LOGIN] Generated 7-day auth token
✅ [LOGIN] User logged in successfully: { id: 'xxx', email: 'test@example.com' }
```

---

**Everything working? You're ready to access your dashboard! 🎉**
