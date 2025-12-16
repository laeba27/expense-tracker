# Expense Tracker - Setup & API Documentation

## Prerequisites

1. **Node.js** 18+ and npm
2. **Supabase** account (free tier available)
3. **Gmail Account** with App Password
4. **Postman** for API testing

## Database Setup (Supabase)

Run the following SQL commands in your Supabase SQL Editor:

### 1. Create Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### 2. Create Expenses Table

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

JWT_SECRET=your-secure-jwt-secret-key-min-32-chars

NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
NODEMAILER_FROM_NAME=Expense Tracker

NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Getting Gmail App Password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Search for "App passwords"
4. Select Mail and Windows Computer
5. Copy the generated password

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit `http://localhost:3000`

---

## API Endpoints

### Authentication Endpoints (Public)

#### 1. Register User

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Check your email to verify.",
  "userId": "uuid-here",
  "token": "jwt-token-valid-for-15-minutes"
}
```

**Error Responses:**
- 400: Validation error (Invalid name/email/phone)
- 409: User already exists
- 500: Server error

#### 2. Verify Email

**GET** `/api/auth/verify?token=JWT_TOKEN`

**Response:**
- Redirects to `/auth/login?success=verified`
- Email verification token valid for 15 minutes

**Error Responses:**
- Redirects with `error=no-token` or `error=invalid-token`

#### 3. Login User

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "phone": "1234567890"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt-token-valid-for-7-days",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- 400: Missing email or phone
- 404: User not found
- 403: Email not verified
- 401: Invalid phone number
- 500: Server error

---

### Expense Management Endpoints (Protected)

All protected endpoints require `Authorization: Bearer JWT_TOKEN` header

#### 1. Add Expense

**POST** `/api/expenses`

**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50.99,
  "description": "Lunch at restaurant",
  "category": "Food",
  "date": "2025-12-15"
}
```

**Response (201):**
```json
{
  "message": "Expense created successfully",
  "expense": {
    "id": "uuid-here",
    "user_id": "uuid-here",
    "amount": 50.99,
    "description": "Lunch at restaurant",
    "category": "Food",
    "date": "2025-12-15",
    "created_at": "2025-12-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- 400: Invalid expense data
- 401: Missing or invalid token
- 500: Server error

#### 2. List Expenses

**GET** `/api/expenses?category=Food&month=12&year=2025`

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `category` (optional): Filter by category
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year

**Response (200):**
```json
{
  "expenses": [
    {
      "id": "uuid-here",
      "user_id": "uuid-here",
      "amount": 50.99,
      "description": "Lunch",
      "category": "Food",
      "date": "2025-12-15",
      "created_at": "2025-12-16T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- 401: Missing or invalid token
- 500: Server error

#### 3. Update Expense

**PUT** `/api/expenses/{id}`

**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 55.99,
  "description": "Dinner at restaurant",
  "category": "Food",
  "date": "2025-12-15"
}
```

**Response (200):**
```json
{
  "message": "Expense updated successfully",
  "expense": {
    "id": "uuid-here",
    "amount": 55.99,
    ...
  }
}
```

**Error Responses:**
- 400: Invalid expense data
- 401: Missing or invalid token
- 404: Expense not found or unauthorized
- 500: Server error

#### 4. Delete Expense

**DELETE** `/api/expenses/{id}`

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Response (200):**
```json
{
  "message": "Expense deleted successfully"
}
```

**Error Responses:**
- 401: Missing or invalid token
- 404: Expense not found or unauthorized
- 500: Server error

#### 5. Get Summary

**GET** `/api/expenses/summary?month=12&year=2025`

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `month` (optional): Filter by month
- `year` (optional): Filter by year

**Response (200):**
```json
{
  "totalSpend": 106.98,
  "categoryWise": {
    "Food": 106.98
  },
  "expenseCount": 2
}
```

**Error Responses:**
- 401: Missing or invalid token
- 500: Server error

---

## Testing with Postman

### 1. Create Collection

- Create a new collection named "Expense Tracker API"

### 2. Set Environment Variables

Create an environment with:
- `base_url`: http://localhost:3000
- `email`: your-test-email@example.com
- `phone`: 1234567890
- `jwt_token`: (auto-populated after login)

### 3. Test Flows

#### Positive Flow:
1. **Register** - POST to `/api/auth/register`
2. **Copy token** from response → Set as `jwt_token`
3. **Verify Email** - GET to `/api/auth/verify?token={{jwt_token}}`
4. **Login** - POST to `/api/auth/login` → Copy new token
5. **Add Expense** - POST to `/api/expenses` with token
6. **List Expenses** - GET to `/api/expenses`
7. **Update Expense** - PUT to `/api/expenses/{id}`
8. **Get Summary** - GET to `/api/expenses/summary`
9. **Delete Expense** - DELETE to `/api/expenses/{id}`

#### Negative Flows:
1. **Missing Token** - Try any protected endpoint without auth header → 401
2. **Invalid Token** - Use expired/fake token → 401
3. **Validation Error** - Send invalid data → 400
4. **Unauthorized Access** - Try to update/delete another user's expense → 404
5. **Invalid Phone** - Login with wrong phone → 401

---

## Frontend Features

- **Home Page**: Introduction and API documentation
- **Register**: Collect name, email, phone → Send verification email
- **Verify**: Click link in email to verify account
- **Login**: Login with email and phone
- **Dashboard**: 
  - Add expenses with amount, description, category, date
  - List all expenses with edit/delete options
  - Filter by month and year
  - View total spend and category-wise breakdown
  - Edit and delete expenses

---

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then redeploy
vercel --prod
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│        FRONTEND (Next.js App)           │
│  (Pages, Components, Client-side Auth)  │
└──────────────────┬──────────────────────┘
                   │
                   │ fetch() with JWT
                   │
┌──────────────────▼──────────────────────┐
│      API LAYER (Next.js Routes)         │
│  (/api/auth/*, /api/expenses/*)         │
│  (JWT Verification, Business Logic)     │
└──────────────────┬──────────────────────┘
                   │
                   │ SQL Queries
                   │
┌──────────────────▼──────────────────────┐
│    DATABASE (Supabase/PostgreSQL)       │
│  (Users, Expenses Tables with Indexes)  │
└─────────────────────────────────────────┘
```

---

## SQL Queries Used

### User Registration
```sql
INSERT INTO users (name, email, phone, is_verified)
VALUES ($1, $2, $3, FALSE)
RETURNING id, created_at;
```

### Email Verification
```sql
UPDATE users SET is_verified = TRUE WHERE id = $1;
```

### Login (Find user)
```sql
SELECT * FROM users WHERE email = $1 AND is_verified = TRUE;
```

### Add Expense
```sql
INSERT INTO expenses (user_id, amount, description, category, date)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
```

### List Expenses with Filters
```sql
SELECT * FROM expenses
WHERE user_id = $1 
  AND ($2::text IS NULL OR category = $2)
  AND ($3::date IS NULL OR date >= $3)
  AND ($4::date IS NULL OR date <= $4)
ORDER BY date DESC;
```

### Summary - Total Spend
```sql
SELECT SUM(amount) as total_spend
FROM expenses
WHERE user_id = $1
  AND ($2::date IS NULL OR date >= $2)
  AND ($3::date IS NULL OR date <= $3);
```

### Summary - Category-wise
```sql
SELECT category, SUM(amount) as total
FROM expenses
WHERE user_id = $1
  AND ($2::date IS NULL OR date >= $2)
  AND ($3::date IS NULL OR date <= $3)
GROUP BY category;
```

---

## Security Considerations

1. **JWT Secret**: Use a strong, random secret (min 32 characters)
2. **Password Hashing**: Phone numbers are hashed with bcryptjs
3. **Token Expiry**: 15 minutes for verification, 7 days for auth
4. **HTTPS**: Always use in production
5. **CORS**: Configure if frontend and backend are on different domains
6. **Input Validation**: All inputs are validated before processing
7. **Rate Limiting**: Consider adding rate limiting in production

---

## Troubleshooting

### Email not received?
- Check spam folder
- Verify Gmail app password is correct
- Ensure NODEMAILER_EMAIL is set

### Token expired error?
- Verification tokens expire in 15 minutes
- Auth tokens expire in 7 days
- Re-login to get new token

### Database connection error?
- Verify Supabase URL and keys
- Check firewall/network settings
- Ensure tables are created

### CORS error?
- Frontend and backend should be same domain during development
- Configure CORS headers if needed for different domains

---

## Next Steps

1. Set up Supabase project and database
2. Configure environment variables
3. Run locally: `npm run dev`
4. Test APIs with Postman
5. Deploy to Vercel
