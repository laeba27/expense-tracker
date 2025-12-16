# 🔐 Three Auth APIs - Complete Sync & Testing Guide

## 📊 Quick Summary

| API | Method | URL | Input | Output | Role |
|-----|--------|-----|-------|--------|------|
| **REGISTER** | POST | `/api/auth/register` | name, email, phone, password | userId, token (15m) | Create account + send email |
| **VERIFY** | GET | `/auth/verify?token=X` | token (from email) | Redirect to login | Confirm email is real |
| **LOGIN** | POST | `/api/auth/login` | email, password | token (7d), user info | User login + auth |

---

## 🎬 The Complete Flow (Step by Step)

```
USER VISIT LANDING PAGE
           ↓
USER CLICKS "GET STARTED"
           ↓
┌─────────────────────────────────────────────────────┐
│ STEP 1: FILL REGISTRATION FORM                      │
│ - Name: "Shivam Goyat"                              │
│ - Email: "shivam@example.com"                       │
│ - Phone: "9717809918" (10 digits)                   │
│ - Password: "SecurePass123" (6+ chars)              │
│ - Click "CREATE ACCOUNT"                            │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│ REGISTER API PROCESSES                              │
│                                                     │
│ 1. Validates all fields ✅                          │
│ 2. Hashes password with bcryptjs ✅                 │
│ 3. Hashes phone with bcryptjs ✅                    │
│ 4. Creates user row: is_verified = false ✅         │
│ 5. Generates 15-minute token ✅                     │
│ 6. Sends email with verification link ✅            │
│ 7. Returns: userId + verification token ✅          │
│                                                     │
│ Console: 📝 🔐 ✅ 🎫 📨                            │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│ EMAIL ARRIVES IN INBOX                              │
│                                                     │
│ To: shivam@example.com                              │
│ Subject: Verify Your Email                          │
│                                                     │
│ Click: http://localhost:3000/auth/verify?token=... │
│ Valid for: 15 minutes                               │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│ STEP 2: USER CLICKS VERIFICATION LINK               │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│ VERIFY API PROCESSES                                │
│                                                     │
│ 1. Gets token from URL ✅                           │
│ 2. Validates token signature ✅                     │
│ 3. Checks token not expired (15-min) ✅             │
│ 4. Decodes token to get userId ✅                   │
│ 5. Updates user: is_verified = true ✅              │
│ 6. Confirms database update ✅                      │
│ 7. Redirects to /auth/login?success=verified ✅     │
│                                                     │
│ Console: 📧 ✅ ✅ ✅ Redirect                      │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│ STEP 3: USER SEES LOGIN PAGE                        │
│ Shows: "Email verified! You can now login."         │
│                                                     │
│ - Email: shivam@example.com (pre-filled)            │
│ - Password: [empty]                                 │
│ - Click "LOGIN"                                     │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│ LOGIN API PROCESSES                                 │
│                                                     │
│ 1. Gets email + password ✅                         │
│ 2. Validates email format ✅                        │
│ 3. Looks up user in database ✅                     │
│ 4. Checks is_verified = true ✅ (MUST BE!)          │
│ 5. Compares password with hash ✅                   │
│ 6. Generates 7-day auth token ✅                    │
│ 7. Returns: token + user info ✅                    │
│                                                     │
│ Console: 🔑 🔍 ✅ ✅ 🔐 ✅ ✅                    │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│ STEP 4: USER LOGGED IN ✅                           │
│ Redirects to: /dashboard                            │
│ Auth Token: Can now use for 7 days                  │
│ Can access: Expense APIs, Protected routes          │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Test All Three APIs

### Option 1: Copy & Paste Commands

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9717809918",
    "password": "password123"
  }' | jq .

# COPY the "token" from response
# Replace TOKEN_HERE with the copied token

# 2. Verify (one of these)
# Option A: In browser
http://localhost:3000/auth/verify?token=TOKEN_HERE

# Option B: In terminal
curl "http://localhost:3000/auth/verify?token=TOKEN_HERE"

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq .
```

### Option 2: Use Bash Script

```bash
# Run automated tests
bash test-auth-apis.sh

# It will:
# 1. Register a user
# 2. Verify the email
# 3. Login with credentials
# 4. Show all responses
```

### Option 3: Use Postman

1. Import `Expense_Tracker_Auth.postman_collection.json`
2. Click "1. REGISTER - Create Account"
3. Click Send
4. Click "2. VERIFY - Click Email Link"
5. Click Send
6. Click "3. LOGIN - Get Auth Token"
7. Click Send

---

## 📋 Test Payloads

### 1️⃣ REGISTER

**Endpoint:**
```
POST http://localhost:3000/api/auth/register
```

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

**Response (201):**
```json
{
  "message": "User registered successfully. Check your email to verify.",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDdhYzEwYi1..."
}
```

---

### 2️⃣ VERIFY

**Endpoint:**
```
GET http://localhost:3000/auth/verify?token=VERIFICATION_TOKEN
```

**In Browser:**
```
http://localhost:3000/auth/verify?token=PASTE_TOKEN_HERE
```

**Response:**
```
302 Redirect to http://localhost:3000/auth/login?success=verified
```

---

### 3️⃣ LOGIN

**Endpoint:**
```
POST http://localhost:3000/api/auth/login
```

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

**Response (200):**
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

---

## ✅ Expected Console Output

### REGISTER Console:
```
📝 [REGISTER] Received request: { name: 'Shivam Goyat', email: 'shivam@example.com', phone: '***', hasPassword: true }
🔐 [REGISTER] Phone and password hashed
✅ [REGISTER] User created: { id: 'f47ac10b...', email: 'shivam@example.com', verified: false }
🎫 [REGISTER] Verification token generated - expires in 15 minutes
📨 [REGISTER] Verification email sent to shivam@example.com
```

### VERIFY Console:
```
📧 [VERIFY] Email verification link clicked with token: present (****)
✅ [VERIFY] Token decoded successfully for user: f47ac10b-58cc-4372-a567-0e02b2c3d479
✅ [VERIFY] User marked as verified in database: shivam@example.com
✅ [VERIFY] Redirecting to login - user can now login with password
```

### LOGIN Console:
```
🔑 [LOGIN] Received login request for: shivam@example.com
🔍 [LOGIN] Looking up user in database...
✅ [LOGIN] User found - email: shivam@example.com verified: true
✅ [LOGIN] Email verified - checking password...
✅ [LOGIN] Password verified
✅ [LOGIN] Generated 7-day auth token
✅ [LOGIN] User logged in successfully: { id: 'f47ac10b...', email: 'shivam@example.com' }
```

---

## 🔴 Error Responses

### Register Errors

```json
// Invalid name
{
  "error": "Name must be at least 2 characters",
  "status": 400
}

// Invalid email
{
  "error": "Invalid email format",
  "status": 400
}

// Invalid phone
{
  "error": "Phone must be 10 digits",
  "status": 400
}

// Short password
{
  "error": "Password must be at least 6 characters",
  "status": 400
}

// User exists
{
  "error": "User already exists",
  "status": 409
}

// Missing password column
{
  "error": "Database error: Password field issue. Please contact support.",
  "details": "Missing password column in users table",
  "status": 500
}
```

### Verify Errors

```
GET /auth/verify → Redirects to:
/auth/login?error=no-token          (Token missing)
/auth/login?error=invalid-token     (Token expired or invalid)
/auth/login?error=user-not-found    (User deleted)
/auth/login?error=server-error      (DB error)
```

### Login Errors

```json
// Email not verified
{
  "error": "Please verify your email first. Check your inbox for verification link.",
  "status": 403
}

// Wrong password
{
  "error": "Invalid email or password",
  "status": 401
}

// User not found
{
  "error": "Invalid email or password",
  "status": 401
}

// Missing password field
{
  "error": "Password is required",
  "status": 400
}
```

---

## 🔐 Database State

### After Register
```
users table:
├── id: f47ac10b-58cc-4372-a567-0e02b2c3d479
├── name: "Shivam Goyat"
├── email: "shivam@example.com"
├── phone: "$2a$10$...hashed..." (bcryptjs hash)
├── password: "$2a$10$...hashed..." (bcryptjs hash)
├── is_verified: false ← User NOT verified yet
└── created_at: 2025-12-16T15:30:00Z

Status: User exists but CANNOT login
```

### After Verify
```
users table:
├── id: f47ac10b-58cc-4372-a567-0e02b2c3d479
├── name: "Shivam Goyat"
├── email: "shivam@example.com"
├── phone: "$2a$10$...hashed..."
├── password: "$2a$10$...hashed..."
├── is_verified: true ← User IS verified ✅
└── verified_at: 2025-12-16T15:45:00Z

Status: User CAN now login
```

### Login Check
```
SELECT * FROM users 
WHERE email = 'shivam@example.com' 
AND is_verified = true;

Result: Returns user row if verified
        Returns nothing if is_verified = false
```

---

## 🎯 Key Points

1. **All three APIs are synchronized**
   - Register creates unverified users
   - Verify marks users as verified
   - Login checks verification status

2. **Two different tokens**
   - 15-minute verification token (email)
   - 7-day authentication token (login)

3. **Email verification is mandatory**
   - Cannot login without clicking verification link
   - Link valid for 15 minutes only
   - Can always register again for new token

4. **Passwords are hashed**
   - Never stored in plain text
   - Bcryptjs with 10 salt rounds
   - Cannot recover passwords

5. **Comprehensive logging**
   - All three APIs log each step
   - Emoji-based console output
   - Easy to debug issues

---

## 🚀 Ready to Test?

### Start Here:

1. **Terminal 1:**
   ```bash
   cd /Users/laebafirdous/Desktop/webdev/expense-tracker
   npm run dev
   ```

2. **Terminal 2:**
   ```bash
   # Copy the REGISTER command and run it
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "phone": "9717809918",
       "password": "password123"
     }' | jq .
   ```

3. **Copy token and run VERIFY command**

4. **Run LOGIN command**

✅ Done! All three APIs working in sync!

---

## 📚 More Information

- `API_TESTING_GUIDE.md` - Complete testing guide with all details
- `AUTH_QUICK_REFERENCE.md` - Quick reference card
- `AUTH_SYNC_COMPLETE.md` - Detailed sync documentation
- `test-auth-apis.sh` - Automated bash test script
- `Expense_Tracker_Auth.postman_collection.json` - Postman collection

---

**Everything is ready! Start testing now! 🎉**
