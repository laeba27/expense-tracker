# Expense Tracker SaaS

A beginner-friendly Expense Tracker application built with Next.js, featuring a clear separation between frontend and backend layers, custom JWT authentication, and Supabase PostgreSQL database.

## 🎯 Features

### Authentication
- **Custom JWT Authentication** (no Supabase Auth)
- User registration with name, email, and phone number
- Email verification via Nodemailer (15-minute token validity)
- Login with email and phone number
- 7-day JWT tokens for authenticated sessions
- Phone number hashing with bcryptjs

### Expense Management
- Add expenses with amount, description, category, and date
- List expenses with filtering by month, year, and category
- Update and delete expenses
- View aggregated summaries (total spend, category-wise breakdown)
- Responsive table view with edit/delete actions

### Frontend
- Clean, minimal UI built with Next.js (App Router) and Tailwind CSS
- Separate pages for registration, verification, login, and dashboard
- Client-side API consumption using fetch
- No direct database access from frontend
- Token-based authorization with Bearer tokens

### Backend (API)
- RESTful API routes using Next.js API Routes
- Middleware for JWT verification on protected routes
- SQL queries for CRUD operations, filtering, and aggregations
- Input validation and error handling
- Dedicated separation between API and business logic

### Database
- Supabase (PostgreSQL)
- Users table with verification status
- Expenses table with user relations and indexes
- Proper relationships and constraints

## 📁 Project Structure

```
expense-tracker/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   ├── verify/
│   │   │   │   └── route.ts
│   │   │   └── login/
│   │   │       └── route.ts
│   │   └── expenses/
│   │       ├── route.ts
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── summary/
│   │           └── route.ts
│   ├── auth/
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify/
│   │   │   └── page.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── page.tsx
├── lib/
│   ├── supabase.ts
│   ├── jwt.ts
│   ├── email.ts
│   ├── validators.ts
│   └── middleware.ts
├── SETUP_AND_API_DOCS.md
├── postman_collection.json
└── .env.local
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Gmail account with App Password
- Postman (for API testing)

### Installation

1. **Clone and navigate to project:**
```bash
cd /Users/laebafirdous/Desktop/webdev/expense-tracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-secure-jwt-secret-key
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
NODEMAILER_FROM_NAME=Expense Tracker
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Set up Supabase database:**
   - Run SQL from `SETUP_AND_API_DOCS.md` → Database Setup section

5. **Run development server:**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📚 API Documentation

See [SETUP_AND_API_DOCS.md](./SETUP_AND_API_DOCS.md) for complete API documentation including:
- Endpoint specifications
- Request/response examples
- Error scenarios
- SQL queries

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` - Register user
- `GET /api/auth/verify?token=...` - Verify email
- `POST /api/auth/login` - Login user

**Expenses (Protected):**
- `POST /api/expenses` - Add expense
- `GET /api/expenses` - List expenses
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/summary` - Get summary

## 🧪 Testing

### Import Postman Collection
1. Open Postman
2. Click "Import" → Upload `postman_collection.json`
3. Set environment variables: `base_url`, `email`, `phone`, `jwt_token`, `expense_id`

### Test Flows

**Positive Flow:**
1. Register → Get verification token
2. Verify email → Redirect to login
3. Login → Get auth token
4. Add, list, update, delete expenses
5. Get summary

**Negative Flows:**
1. Missing authorization header → 401
2. Invalid/expired token → 401
3. Invalid input data → 400
4. Unauthorized expense access → 404
5. Unverified email login attempt → 403

## 🔐 Security Features

- **JWT Authentication**: 15-minute verification tokens, 7-day auth tokens
- **Password Hashing**: Phone numbers hashed with bcryptjs
- **Input Validation**: All inputs validated before processing
- **Unauthorized Access**: Users can only access their own expenses
- **Bearer Token**: Required `Authorization: Bearer <token>` header
- **Error Handling**: Secure error messages without exposing system details

## 📈 Database Schema

### Users Table
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- phone (VARCHAR, hashed)
- is_verified (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Expenses Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- amount (DECIMAL)
- description (VARCHAR)
- category (VARCHAR)
- date (DATE)
- created_at, updated_at (TIMESTAMP)
```

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken)
- **Email**: Nodemailer
- **Security**: bcryptjs for hashing
- **Validation**: Custom validators

## 📦 Dependencies

```json
{
  "@supabase/supabase-js": "^2.x",
  "jsonwebtoken": "^9.x",
  "bcryptjs": "^2.x",
  "nodemailer": "^6.x",
  "dotenv": "^16.x"
}
```

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Configure all .env.local variables

# Redeploy
vercel --prod
```

**Update `NEXT_PUBLIC_API_URL`** to your Vercel domain.

## 📝 Frontend Pages

- **`/`** - Home page with introduction and API docs
- **`/auth/register`** - User registration
- **`/auth/verify`** - Email verification
- **`/auth/login`** - User login
- **`/dashboard`** - Expense management dashboard

## 🔄 Frontend-Backend Separation

**Frontend never accesses database directly:**
- All data goes through REST APIs
- Frontend uses `fetch()` to consume endpoints
- JWT tokens passed in `Authorization` header
- API routes handle business logic and database access
- Middleware verifies tokens before processing

## 🐛 Troubleshooting

- **Email not received**: Check spam, verify Gmail app password
- **Token expired**: 15min for verification, 7 days for auth
- **Database errors**: Verify Supabase credentials and table setup
- **Verification failed**: Ensure verification email link is correct

## 📚 Learning Resources

This project demonstrates:
- ✅ REST API design and implementation
- ✅ Custom JWT authentication flow
- ✅ SQL queries for CRUD, filtering, and aggregations
- ✅ Frontend-backend separation architecture
- ✅ Email integration with Nodemailer
- ✅ PostgreSQL with Supabase
- ✅ Input validation and error handling
- ✅ Security best practices

## 📄 License

This project is created for educational purposes.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
