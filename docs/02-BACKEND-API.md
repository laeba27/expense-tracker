# 🔧 Backend API Documentation

## Overview
The backend is built with Next.js API Routes and Supabase PostgreSQL. It handles authentication, workspace management, and expense tracking with JWT-based authorization.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | RESTful API endpoints |
| **TypeScript** | Type safety for API handlers |
| **Supabase** | PostgreSQL database & authentication |
| **JWT** | Token-based authentication |
| **Nodemailer** | Email verification |
| **bcryptjs** | Password hashing |

---

## 🔐 Authentication Endpoints

### 1. POST /api/auth/register

**Purpose**: Create a new user account with email verification

**Request**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Validation**
- name: required, min 2 characters
- email: required, valid email format, unique in DB
- password: required, min 8 characters
- confirmPassword: must match password

**Response (200 OK)**
```json
{
  "message": "Registration successful! Please check your email to verify your account.",
  "email": "john@example.com"
}
```

**Response (400 Bad Request)**
```json
{
  "error": "Email already registered"
}
```

**Backend Logic**
```typescript
1. Validate input
2. Check if user exists
3. Hash password with bcryptjs
4. Create user in users table
5. Generate verification code
6. Store code in verification_codes table (5 min expiry)
7. Send verification email
8. Return success message
```

**Postman Setup**
```
Method: POST
URL: http://localhost:3000/api/auth/register
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

---

### 2. POST /api/auth/verify-email

**Purpose**: Verify email and get JWT token

**Request**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200 OK)**
```json
{
  "message": "Email verified successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (400 Bad Request)**
```json
{
  "error": "Invalid or expired verification code"
}
```

**Backend Logic**
```typescript
1. Validate code format
2. Find verification code in DB
3. Check if code matches and not expired
4. Mark user as verified (verified_at = now)
5. Delete used verification code
6. Generate JWT token with userId & email
7. Return token & user info
```

**Postman Setup**
```
Method: POST
URL: http://localhost:3000/api/auth/verify-email
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "john@example.com",
  "code": "123456"
}
```

---

### 3. POST /api/auth/login

**Purpose**: Authenticate user and get JWT token

**Request**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (401 Unauthorized)**
```json
{
  "error": "Invalid email or password"
}
```

**Response (403 Forbidden)**
```json
{
  "error": "Please verify your email first"
}
```

**Backend Logic**
```typescript
1. Validate email & password provided
2. Find user by email in DB
3. If not found: return 401
4. If not verified: return 403
5. Compare password with stored hash using bcryptjs
6. If mismatch: return 401
7. Generate JWT token with userId & email
8. Return token & user info
```

**Postman Setup**
```
Method: POST
URL: http://localhost:3000/api/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

## 📦 Workspace Endpoints

### 4. GET /api/workspaces

**Purpose**: Get all workspaces for authenticated user

**Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response (200 OK)**
```json
{
  "workspaces": [
    {
      "id": "uuid-1",
      "title": "Personal",
      "description": "My personal expenses",
      "type": "custom",
      "created_at": "2024-12-16T10:30:00Z"
    },
    {
      "id": "uuid-2",
      "title": "Business",
      "description": "Work related expenses",
      "type": "custom",
      "created_at": "2024-12-15T08:15:00Z"
    }
  ],
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (401 Unauthorized)**
```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

**Backend Logic**
```typescript
1. Extract token from Authorization header
2. Verify JWT token
3. Extract userId from token (supports both userId & user_id)
4. Query workspaces table WHERE user_id = userId
5. Order by created_at DESC
6. Fetch user details
7. Return workspaces array & user info
```

**Postman Setup**
```
Method: GET
URL: http://localhost:3000/api/workspaces
Headers:
  Authorization: Bearer {token_from_login}
  Content-Type: application/json
```

---

### 5. POST /api/workspaces

**Purpose**: Create a new workspace

**Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**
```json
{
  "title": "Family",
  "description": "Family expenses tracker"
}
```

**Validation**
- title: required, min 1 character
- description: optional

**Response (201 Created)**
```json
{
  "workspace": {
    "id": "uuid-new",
    "title": "Family",
    "description": "Family expenses tracker",
    "type": "custom",
    "created_at": "2024-12-16T11:45:00Z"
  }
}
```

**Response (400 Bad Request)**
```json
{
  "error": "Workspace title is required"
}
```

**Response (401 Unauthorized)**
```json
{
  "error": "Unauthorized"
}
```

**Backend Logic**
```typescript
1. Verify JWT token
2. Extract userId from token
3. Validate request body (title required)
4. Generate UUID for workspace
5. Create record in workspaces table:
   - user_id: userId (from token)
   - title: from request
   - description: from request
   - type: 'custom'
   - created_at: current timestamp
6. Return created workspace with 201 status
```

**Postman Setup**
```
Method: POST
URL: http://localhost:3000/api/workspaces
Headers:
  Authorization: Bearer {token_from_login}
  Content-Type: application/json
Body (raw JSON):
{
  "title": "Family",
  "description": "Family expenses tracker"
}
```

---

## 💰 Expense Endpoints

### 6. GET /api/expenses

**Purpose**: Get expenses for a specific workspace with filters

**Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**
```
?workspace_id=uuid-1&month=12&year=2024
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspace_id | string | Yes | Workspace UUID |
| month | number | Yes | Month (1-12) |
| year | number | Yes | Year (e.g., 2024) |

**Response (200 OK)**
```json
{
  "expenses": [
    {
      "id": "uuid-exp-1",
      "amount": 500.00,
      "description": "Groceries",
      "category": "Food",
      "date": "2024-12-16",
      "workspace_id": "uuid-1"
    },
    {
      "id": "uuid-exp-2",
      "amount": 50.00,
      "description": "Bus Pass",
      "category": "Transport",
      "date": "2024-12-15",
      "workspace_id": "uuid-1"
    }
  ]
}
```

**Backend Logic**
```typescript
1. Verify JWT token
2. Extract userId from token
3. Extract query parameters
4. Query expenses WHERE:
   - workspace_id matches
   - user_id matches (security check)
   - EXTRACT(MONTH FROM date) = month
   - EXTRACT(YEAR FROM date) = year
5. Order by date DESC
6. Return expenses array
```

**Postman Setup**
```
Method: GET
URL: http://localhost:3000/api/expenses?workspace_id=uuid-1&month=12&year=2024
Headers:
  Authorization: Bearer {token_from_login}
  Content-Type: application/json
```

---

### 7. POST /api/expenses

**Purpose**: Create a new expense

**Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**
```json
{
  "amount": 500.00,
  "description": "Groceries",
  "category": "Food",
  "date": "2024-12-16",
  "workspace_id": "uuid-1"
}
```

**Validation**
- amount: required, number, > 0
- description: required, min 1 character
- category: required, from predefined list
- date: required, valid date format (YYYY-MM-DD)
- workspace_id: required, valid UUID

**Response (201 Created)**
```json
{
  "expense": {
    "id": "uuid-new-exp",
    "amount": 500.00,
    "description": "Groceries",
    "category": "Food",
    "date": "2024-12-16",
    "workspace_id": "uuid-1"
  }
}
```

**Response (400 Bad Request)**
```json
{
  "error": "All fields are required"
}
```

**Backend Logic**
```typescript
1. Verify JWT token
2. Extract userId from token
3. Validate all required fields
4. Verify workspace_id belongs to user
5. Generate UUID for expense
6. Create record in expenses table:
   - id: generated UUID
   - user_id: userId (from token)
   - workspace_id: from request
   - amount: parsed as float
   - description: from request
   - category: from request (validated)
   - date: from request
   - created_at: current timestamp
7. Return created expense with 201 status
```

**Postman Setup**
```
Method: POST
URL: http://localhost:3000/api/expenses
Headers:
  Authorization: Bearer {token_from_login}
  Content-Type: application/json
Body (raw JSON):
{
  "amount": 500.00,
  "description": "Groceries",
  "category": "Food",
  "date": "2024-12-16",
  "workspace_id": "uuid-1"
}
```

---

### 8. GET /api/expenses/summary

**Purpose**: Get expense summary & analytics for a workspace

**Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**
```
?workspace_id=uuid-1&month=12&year=2024
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspace_id | string | Yes | Workspace UUID |
| month | number | Yes | Month (1-12) |
| year | number | Yes | Year (e.g., 2024) |

**Response (200 OK)**
```json
{
  "summary": {
    "totalSpend": 2350.50,
    "expenseCount": 8,
    "categoryWise": {
      "Food": 1200.00,
      "Transport": 450.00,
      "Entertainment": 300.00,
      "Shopping": 400.50
    }
  }
}
```

**Backend Logic**
```typescript
1. Verify JWT token
2. Extract userId from token
3. Extract query parameters
4. Query expenses WHERE:
   - workspace_id matches
   - user_id matches
   - EXTRACT(MONTH FROM date) = month
   - EXTRACT(YEAR FROM date) = year
5. Calculate:
   - totalSpend: SUM(amount)
   - expenseCount: COUNT(*)
   - categoryWise: GROUP BY category, SUM(amount)
6. Return summary object
```

**Postman Setup**
```
Method: GET
URL: http://localhost:3000/api/expenses/summary?workspace_id=uuid-1&month=12&year=2024
Headers:
  Authorization: Bearer {token_from_login}
  Content-Type: application/json
```

---

## 🔑 JWT Token Structure

**Token Payload**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "iat": 1702723200,
  "exp": 1702809600
}
```

**Token Expiration**: 24 hours

**Generation**
```typescript
const token = jwt.sign(
  { userId, email },
  JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Verification**
```typescript
const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
const userId = decoded.userId || decoded.user_id;  // Backward compatibility
```

---

## 🔒 Security Measures

### 1. JWT Verification
- Every API endpoint verifies JWT token
- Extracts userId from token for database queries
- Returns 401 if token invalid/expired

### 2. User Isolation
- All queries filtered by `user_id` from token
- Users can only access their own data
- Prevents unauthorized data access

### 3. Password Security
- Passwords hashed with bcryptjs (salt rounds: 10)
- Plain passwords never stored in DB
- Comparison done with bcryptjs.compare()

### 4. Input Validation
- All inputs validated before database operations
- Email format validated
- Numeric fields parsed safely

### 5. Database Constraints
- Unique constraint on email in users table
- NOT NULL constraints on required fields
- Foreign key constraints for workspace-user relationship

---

## 🔄 Authentication Flow

```
1. User Registers
   POST /api/auth/register
   ↓
2. Verification Code Sent
   Email with 6-digit code
   ↓
3. User Verifies Email
   POST /api/auth/verify-email
   ↓
4. JWT Token Generated
   Token with userId & email
   ↓
5. Token Stored in localStorage
   Client-side storage
   ↓
6. Subsequent Requests
   Include token in Authorization header
   ↓
7. Backend Verifies Token
   Extract userId for queries
   ↓
8. Data Isolated by User
   Only their workspaces & expenses returned
```

---

## 📊 Error Handling

### Standard Error Response
```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request successful |
| 201 | Created | Workspace/expense created |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Email not verified |
| 404 | Not Found | Workspace doesn't exist |
| 500 | Server Error | Database error |

---

## 🧪 Testing with Postman

### 1. Set Up Environment Variables
```
In Postman > Environments > Create New
Variables:
  base_url: http://localhost:3000
  token: (empty - will be filled after login)
```

### 2. Registration Workflow
```
Step 1: POST {{base_url}}/api/auth/register
Step 2: Copy verification code from email
Step 3: POST {{base_url}}/api/auth/verify-email
Step 4: Save token to {{token}} variable
```

### 3. Use Token in Subsequent Requests
```
In Postman Headers:
  Authorization: Bearer {{token}}
```

### 4. Complete Workflow
```
1. Register new user
2. Verify email
3. Get token
4. Create workspace
5. Create expense
6. Get expenses
7. Get summary
```

---

## 🚀 Database Integration Points

### Users Table
```sql
SELECT * FROM users WHERE id = userId;
-- Used in: All authenticated endpoints
```

### Workspaces Table
```sql
SELECT * FROM workspaces WHERE user_id = userId;
-- Used in: GET /api/workspaces
```

### Expenses Table
```sql
SELECT * FROM expenses 
WHERE user_id = userId 
  AND workspace_id = workspaceId
  AND EXTRACT(MONTH FROM date) = month
  AND EXTRACT(YEAR FROM date) = year;
-- Used in: GET /api/expenses, GET /api/expenses/summary
```

---

## 🐛 Common Backend Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Include valid JWT in Authorization header |
| null user_id in DB | userId not extracted properly | Use `decoded.userId \|\| decoded.user_id` |
| Email verification fails | Code expired | Codes expire in 5 minutes |
| Password mismatch | Case sensitivity | Passwords are case-sensitive |
| Workspace not found | User_id mismatch | Verify workspace belongs to user |

---

## 📝 API Response Time Expectations

- GET /api/workspaces: < 100ms
- GET /api/expenses: < 150ms
- GET /api/expenses/summary: < 200ms
- POST /api/auth/register: 2-3s (email sending)
- POST /api/auth/login: < 100ms

