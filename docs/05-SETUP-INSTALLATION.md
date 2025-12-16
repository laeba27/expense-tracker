# 🚀 Project Setup & Installation Guide

## Complete Setup from Start to End

This guide will walk you through setting up the Expense Tracker project from scratch on your local machine.

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **npm**: v9+ (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Accounts Required
- **Supabase**: Free account ([Sign up](https://supabase.com/))
- **Gmail**: For email verification ([Get Gmail](https://gmail.com/))

### System Requirements
- **OS**: macOS, Linux, or Windows
- **RAM**: Minimum 4GB
- **Disk Space**: Minimum 2GB
- **Network**: Stable internet connection

---

## 🔧 Step 1: Environment Setup

### 1.1 Install Node.js

**macOS (using Homebrew)**
```bash
brew install node@18
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

**Windows**
- Download from nodejs.org
- Run installer with default settings

**Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install nodejs npm
```

---

### 1.2 Verify Installation
```bash
node --version
npm --version
```

Expected output:
```
v18.20.0
9.8.1
```

---

## 📁 Step 2: Project Setup

### 2.1 Clone Repository (or Create New)

**Option A: Clone from GitHub**
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

**Option B: Create New Project**
```bash
npx create-next-app@latest expense-tracker --typescript
cd expense-tracker
```

### 2.2 Install Dependencies
```bash
npm install
```

This installs:
- Next.js framework
- React components
- TypeScript
- Tailwind CSS
- Lucide icons
- JWT library
- Supabase client

---

## 🌐 Step 3: Supabase Database Setup

### 3.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com/)
2. Sign up with email or GitHub
3. Verify email

### 3.2 Create New Project
1. Click "New Project"
2. **Project Name**: "expense-tracker"
3. **Database Password**: Create secure password (save this!)
4. **Region**: Select closest to you
5. Click "Create new project"
6. Wait 3-5 minutes for provisioning

### 3.3 Get Database Credentials
1. Go to Project Settings
2. Click "API" tab
3. Copy these credentials:
   - **URL**: Under "Project URL"
   - **Anon Key**: Under "Project API keys"
   - **Service Role Key**: Under "Project API keys"

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## 💾 Step 4: Create Database Tables

### 4.1 Open Supabase SQL Editor
1. In Supabase dashboard
2. Click "SQL Editor"
3. Click "New Query"

### 4.2 Create Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**Click "Run"** to execute

### 4.3 Create Workspaces Table
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'custom',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_workspace_per_user UNIQUE(user_id, title)
);

CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
```

**Click "Run"** to execute

### 4.4 Create Expenses Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK(amount > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_workspace_id ON expenses(workspace_id);
CREATE INDEX idx_expenses_date ON expenses(date);
```

**Click "Run"** to execute

### 4.5 Create Verification Codes Table
```sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
```

**Click "Run"** to execute

---

## 🔐 Step 5: Environment Variables Setup

### 5.1 Create .env.local File
In project root:
```bash
touch .env.local
```

### 5.2 Add Supabase Credentials
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Replace with your actual credentials from Step 3.3

### 5.3 Add JWT Secret
```bash
JWT_SECRET=your-secret-key-change-in-production
```

Generate a secure random key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5.4 Add Email Configuration (Gmail)

Get Gmail App Password:
1. Enable 2-Factor Authentication on Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy generated 16-character password

Add to .env.local:
```bash
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=xxxx xxxx xxxx xxxx
NODEMAILER_FROM_NAME=Expense Tracker

NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5.5 Final .env.local File
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# JWT
JWT_SECRET=your-jwt-secret-key

# Email
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=xxxx xxxx xxxx xxxx
NODEMAILER_FROM_NAME=Expense Tracker

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

⚠️ **NEVER commit .env.local to Git!** Add to .gitignore:
```bash
echo ".env.local" >> .gitignore
```

---

## 📦 Step 6: Install Project Dependencies

### 6.1 Install All Required Packages
```bash
npm install
```

This installs all packages from `package.json`:
- next
- react & react-dom
- typescript
- tailwindcss
- lucide-react
- jwt & bcryptjs
- nodemailer
- @supabase/supabase-js

### 6.2 Verify Installation
```bash
npm list
```

Should show all packages without errors.

---

## 🏗️ Step 7: Create API Endpoints

### 7.1 Authentication APIs

Create `/src/app/api/auth/register/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';

// See full code in repository
```

Create `/src/app/api/auth/login/route.ts`:
```typescript
// See full code in repository
```

Create `/src/app/api/auth/verify-email/route.ts`:
```typescript
// See full code in repository
```

### 7.2 Workspace APIs

Create `/src/app/api/workspaces/route.ts`:
```typescript
// See full code in repository
```

### 7.3 Expense APIs

Create `/src/app/api/expenses/route.ts`:
```typescript
// See full code in repository
```

Create `/src/app/api/expenses/summary/route.ts`:
```typescript
// See full code in repository
```

---

## 🎨 Step 8: Create Frontend Pages

### 8.1 Create Registration Page

Create `/src/app/auth/register/page.tsx`:
```typescript
// See full code in repository
```

### 8.2 Create Login Page

Create `/src/app/auth/login/page.tsx`:
```typescript
// See full code in repository
```

### 8.3 Create Email Verification Page

Create `/src/app/auth/verify-email/page.tsx`:
```typescript
// See full code in repository
```

### 8.4 Create Dashboard Page

Create `/src/app/dashboard/page.tsx`:
```typescript
// See full code in repository
```

---

## 🧪 Step 9: Test the Application

### 9.1 Start Development Server
```bash
npm run dev
```

Expected output:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 9.2 Visit Application
Open browser and go to:
```
http://localhost:3000
```

### 9.3 Test Registration
1. Click "Sign Up"
2. Fill registration form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "SecurePass123"
3. Click "Register"
4. Check email for verification code
5. Enter code in verification page
6. Should redirect to dashboard

### 9.4 Test Workspace Creation
1. On dashboard, should see empty state modal
2. Enter workspace name: "Personal"
3. Enter description: "My personal expenses"
4. Click "Create Workspace"
5. Modal closes, workspace appears in sidebar

### 9.5 Test Expense Creation
1. Click "Add Expense" button
2. Fill expense form:
   - Amount: 500
   - Description: "Groceries"
   - Category: "Food"
   - Date: Today's date
3. Click "Add"
4. Expense appears in table
5. Summary cards update

---

## 🚨 Step 10: Troubleshooting

### Issue: "Cannot find module '@/lib/supabase'"

**Solution**: Create `/src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
```

---

### Issue: "Email verification not working"

**Solution**: 
1. Check `.env.local` for email credentials
2. Verify Gmail account has 2FA enabled
3. Use App Password (not regular password)
4. Check server logs for error messages

---

### Issue: "Workspace creation returns 401"

**Solution**:
1. Check token is stored in localStorage
2. Verify JWT_SECRET is set in .env.local
3. Check Authorization header is being sent
4. Verify token hasn't expired

---

### Issue: "Database connection failed"

**Solution**:
1. Verify Supabase credentials in .env.local
2. Check tables exist in Supabase dashboard
3. Verify network connection
4. Try accessing Supabase URL in browser

---

### Issue: "Port 3000 already in use"

**Solution**:
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or run on different port:
npm run dev -- -p 3001
```

---

## 🔄 Step 11: Development Workflow

### 11.1 Start Development Server
```bash
npm run dev
```

### 11.2 Make Code Changes
- Edit files in `/src` directory
- Browser auto-refreshes on save

### 11.3 Build for Production
```bash
npm run build
```

### 11.4 Start Production Server
```bash
npm start
```

---

## 📱 Step 12: Testing Checklist

```
□ Server starts without errors
□ Can access http://localhost:3000
□ Registration page loads
□ Can register new user
□ Verification code received in email
□ Can verify email
□ Redirected to dashboard
□ Dashboard shows empty state
□ Can create workspace from modal
□ Workspace appears in sidebar
□ Can create expense
□ Expense appears in table
□ Summary cards update
□ Can switch workspaces
□ Expenses isolated per workspace
□ Can logout
□ Redirected to login page
□ Token properly stored in localStorage
```

---

## 🐛 Step 13: Debugging

### View Server Logs
```bash
npm run dev
# Logs appear in terminal
```

### Browser DevTools
```
Right-click → Inspect → Console
- Check for JavaScript errors
- Monitor network requests
- View localStorage
```

### Supabase Logs
1. Supabase Dashboard
2. SQL Editor
3. Run logs queries

### Test Endpoints with Postman
```
1. Download Postman
2. POST http://localhost:3000/api/auth/register
3. Add JSON body with user data
4. Send request
5. Check response
```

---

## 🔐 Step 14: Security Best Practices

### 14.1 Protect Environment Variables
```bash
# Never commit .env.local
echo ".env.local" >> .gitignore

# Never share credentials
# Use different JWT_SECRET for production
```

### 14.2 Update Dependencies Regularly
```bash
npm update
npm audit fix
```

### 14.3 Enable Supabase Security
1. Set Row Level Security (RLS) on tables
2. Create policies for user isolation
3. Enable JWT verification

---

## 📊 Step 15: Monitoring

### 15.1 Check Application Health
```bash
# Test API endpoint
curl http://localhost:3000/api/test/supabase

# Expected response:
{
  "status": "SUCCESS ✅",
  "message": "Supabase is connected..."
}
```

### 15.2 Monitor Performance
- Open browser DevTools → Network tab
- Check response times for each API call
- Target: < 500ms for all requests

### 15.3 View Error Logs
- Check server logs in terminal
- Check browser console for errors
- Check Supabase dashboard for database errors

---

## 🚀 Step 16: Deployment

### Prepare for Deployment
```bash
# Run production build
npm run build

# Test production build locally
npm start

# Create GitHub repository
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Deploy to Vercel
1. Sign up at [vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Add environment variables
4. Click Deploy
5. Application live!

### Deploy to Other Platforms
- Netlify
- Heroku
- AWS
- Azure
- DigitalOcean

---

## 📚 Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start           # Run production build

# Linting
npm run lint        # Check for errors

# Database
npx supabase init   # Initialize Supabase project
npx supabase db reset  # Reset database

# Git
git status          # Check git status
git add .           # Stage changes
git commit -m "message"  # Commit changes
git push            # Push to GitHub
```

---

## ✅ Setup Complete!

You've successfully set up the Expense Tracker application! 🎉

**Next Steps**:
1. Create a test account
2. Create a workspace
3. Add some expenses
4. Explore the dashboard
5. Read other documentation files for deeper understanding

**Questions?** Check:
- [01-FRONTEND.md](/docs/01-FRONTEND.md) - Frontend architecture
- [02-BACKEND-API.md](/docs/02-BACKEND-API.md) - API documentation
- [03-SDLC.md](/docs/03-SDLC.md) - Development process
- [04-DATABASE-SQL.md](/docs/04-DATABASE-SQL.md) - Database queries

Happy coding! 🚀

