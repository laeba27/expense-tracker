# 🔐 Auth APIs - Quick Reference

## 📊 3-Step Flow

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: REGISTER                                        │
│ POST /api/auth/register                                 │
│ Status: 201                                             │
│ Response: { userId, token (15m verification) }          │
│ → Email sent with verification link                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: VERIFY                                          │
│ GET /auth/verify?token=TOKEN                            │
│ Status: 302 Redirect                                    │
│ → Clicks email link                                     │
│ → User marked verified in DB                            │
│ → Redirects to /auth/login?success=verified             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: LOGIN                                           │
│ POST /api/auth/login                                    │
│ Status: 200                                             │
│ Response: { token (7d auth), user { id, name, email } } │
│ → User logged in, can access dashboard                  │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ REGISTER

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Shivam Goyat",           # Required: 2+ chars
  "email": "shivam@example.com",    # Required: valid email
  "phone": "9717809918",             # Required: 10 digits
  "password": "SecurePass123"        # Required: 6+ chars
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Check your email to verify.",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** for verification step!

---

## 2️⃣ VERIFY

```bash
# Method 1: Browser
GET http://localhost:3000/auth/verify?token=PASTE_TOKEN_HERE

# Method 2: CURL
curl "http://localhost:3000/auth/verify?token=PASTE_TOKEN_HERE"
```

**Response:** Redirect to `/auth/login?success=verified`

**Console:** Shows green checkmark ✅ if successful

---

## 3️⃣ LOGIN

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "shivam@example.com",     # Must match registration
  "password": "SecurePass123"         # Must match registration
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Shivam Goyat",
    "email": "shivam@example.com"
  }
}
```

**This token is valid for 7 days** and used for dashboard access.

---

## 🚨 Common Errors

| Error | Status | Fix |
|-------|--------|-----|
| "Name must be at least 2 characters" | 400 | Use 2+ char name |
| "Invalid email format" | 400 | Use valid email |
| "Phone must be 10 digits" | 400 | Use 10-digit phone |
| "Password must be at least 6 characters" | 400 | Use 6+ char password |
| "User already exists" | 409 | Use different email |
| "Please verify your email first" | 403 | Click email verification link |
| "Invalid email or password" | 401 | Check email/password spelling |
| "Database error: Password field issue" | 500 | Add password column to Supabase |

---

## ✅ Complete Test (5 minutes)

### Terminal 1: Start Server
```bash
cd /Users/laebafirdous/Desktop/webdev/expense-tracker
npm run dev
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
→ **Copy the token** from response

**Step 2: Verify (Replace TOKEN)**
```bash
curl "http://localhost:3000/auth/verify?token=TOKEN_HERE"
```
→ Should redirect with success message

**Step 3: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq .
```
→ Should return auth token + user info

---

## 🔑 Token Types

| Token | Type | Expiry | Use Case |
|-------|------|--------|----------|
| Verification Token | 15-minute | Email link verification | Click link in email |
| Auth Token | 7-day | User login & API access | Dashboard + APIs |

---

## 📨 Email Flow

1. **User registers** → Email sent automatically
2. **Email contains:**
   - Verification link: `http://localhost:3000/auth/verify?token=...`
   - Valid for: 15 minutes only
   - Once clicked: User verified, redirect to login
3. **User must click** verification link before login

---

## 🗄️ Database Checks

```sql
-- Check if user exists and verified
SELECT email, is_verified, created_at FROM users 
WHERE email = 'test@example.com';

-- Result should show: is_verified = true after email click
```

---

## 📊 Console Output (What to Look For)

### Register Success
```
📝 [REGISTER] Received request
🔐 [REGISTER] Phone and password hashed
✅ [REGISTER] User created
🎫 [REGISTER] Verification token generated
📨 [REGISTER] Verification email sent
```

### Verify Success
```
📧 [VERIFY] Email verification link clicked
✅ [VERIFY] Token decoded successfully
✅ [VERIFY] User marked as verified in database
✅ [VERIFY] Redirecting to login
```

### Login Success
```
🔑 [LOGIN] Received login request
🔍 [LOGIN] Looking up user in database
✅ [LOGIN] User found
✅ [LOGIN] Email verified
🔐 [LOGIN] Password verified
✅ [LOGIN] Generated 7-day auth token
✅ [LOGIN] User logged in successfully
```

---

## 🎯 What Happens at Each Step

| Step | What Happens | Database | Result |
|------|-------------|----------|--------|
| Register | Create user, hash password/phone, send email | `is_verified = false` | User unverified |
| Click Email | Validate token, mark verified, redirect | `is_verified = true` | User verified ✅ |
| Login | Find user, check verified, compare password, gen token | Read only | 7-day token |
| Use Dashboard | Send token in Authorization header | Read only | Access granted |

---

## 💡 Pro Tips

1. **Always check terminal logs** - They show exact flow
2. **Email may take 5 seconds** - Check spam folder
3. **Tokens expire** - Registration (15m), Auth (7d)
4. **Copy full token** - Don't miss any characters
5. **Case-sensitive** - Email & password matching matter
6. **Database first** - All data persisted in Supabase

---

## 📚 Full Documentation

See **API_TESTING_GUIDE.md** for detailed information including:
- Error handling for each endpoint
- Response codes and meanings
- Database state at each step
- Troubleshooting guide
- All curl commands

---

**Ready to test? Start with REGISTER! 🚀**
