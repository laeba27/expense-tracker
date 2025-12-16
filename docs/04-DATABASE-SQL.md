# 💾 Database & SQL Documentation

## Overview
The application uses Supabase PostgreSQL for data storage. This document covers schema, queries, and database design.

---

## 🏗️ Database Schema

### Table 1: users

**Purpose**: Store user account information

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**
| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| name | TEXT | NOT NULL | User's full name |
| email | TEXT | NOT NULL, UNIQUE | Email (used for login) |
| password | TEXT | NOT NULL | Bcrypt hashed password |
| verified_at | TIMESTAMP | NULL | When email was verified |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation time |

**Indexes**
```sql
CREATE INDEX idx_users_email ON users(email);
-- Purpose: Fast email lookup during login
```

**Constraints**
```sql
-- Unique email across all users
CONSTRAINT unique_email UNIQUE(email)

-- User must have name
CONSTRAINT not_null_name CHECK(name IS NOT NULL AND length(name) > 0)
```

**Example Data**
```sql
INSERT INTO users (id, name, email, password, verified_at, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john@example.com', 
   '$2a$10$...hashed...', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'jane@example.com', 
   '$2a$10$...hashed...', NOW(), NOW());
```

---

### Table 2: workspaces

**Purpose**: Store expense tracking workspaces for users

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
```

**Columns**
| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PRIMARY KEY | Unique workspace identifier |
| user_id | UUID | NOT NULL, FK | Owner of workspace |
| title | TEXT | NOT NULL | Workspace name |
| description | TEXT | NULL | Optional description |
| type | TEXT | DEFAULT 'custom' | Workspace category |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Foreign Key**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- When user deleted, all their workspaces are deleted
```

**Indexes**
```sql
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
-- Purpose: Fast lookup of user's workspaces

CREATE UNIQUE INDEX idx_workspaces_user_title ON workspaces(user_id, title);
-- Purpose: Prevent duplicate workspace names per user
```

**Example Data**
```sql
INSERT INTO workspaces (id, user_id, title, description, type, created_at) VALUES
  ('uuid-1', '550e8400-e29b-41d4-a716-446655440000', 'Personal', 
   'My personal expenses', 'custom', NOW()),
  ('uuid-2', '550e8400-e29b-41d4-a716-446655440000', 'Business',
   'Work related expenses', 'custom', NOW());
```

---

### Table 3: expenses

**Purpose**: Store individual expense records

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
```

**Columns**
| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PRIMARY KEY | Unique expense identifier |
| user_id | UUID | NOT NULL, FK | Expense owner |
| workspace_id | UUID | NOT NULL, FK | Associated workspace |
| amount | DECIMAL(10,2) | NOT NULL, > 0 | Expense amount (in currency) |
| description | TEXT | NOT NULL | Expense description |
| category | TEXT | NOT NULL | Category (Food, Transport, etc) |
| date | DATE | NOT NULL | Expense date |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

**Foreign Keys**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- Delete expenses when user deleted

FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
-- Delete expenses when workspace deleted
```

**Indexes**
```sql
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
-- Purpose: Fast lookup of user's expenses

CREATE INDEX idx_expenses_workspace_id ON expenses(workspace_id);
-- Purpose: Fast lookup of workspace's expenses

CREATE INDEX idx_expenses_date ON expenses(date);
-- Purpose: Fast filter by date/month

CREATE INDEX idx_expenses_category ON expenses(category);
-- Purpose: Fast category-wise grouping

CREATE INDEX idx_expenses_user_workspace_date 
  ON expenses(user_id, workspace_id, date);
-- Purpose: Composite index for common query pattern
```

**Constraints**
```sql
CHECK(amount > 0)
-- Amount must be positive

CHECK(length(description) > 0)
-- Description required

CHECK(category IN ('Food', 'Transport', 'Entertainment', 
                   'Shopping', 'Utilities', 'Health', 'Other'))
-- Only predefined categories
```

**Example Data**
```sql
INSERT INTO expenses (id, user_id, workspace_id, amount, description, category, date) VALUES
  ('exp-1', '550e8400-e29b-41d4-a716-446655440000', 'uuid-1', 500.00, 
   'Groceries', 'Food', '2024-12-16'),
  ('exp-2', '550e8400-e29b-41d4-a716-446655440000', 'uuid-1', 50.00,
   'Bus Pass', 'Transport', '2024-12-15'),
  ('exp-3', '550e8400-e29b-41d4-a716-446655440000', 'uuid-1', 600.00,
   'Movie Tickets', 'Entertainment', '2024-12-14');
```

---

### Table 4: verification_codes

**Purpose**: Store temporary email verification codes

```sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**
| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| id | UUID | PRIMARY KEY | Unique code record ID |
| user_id | UUID | NOT NULL, FK | User who needs verification |
| email | TEXT | NOT NULL | Email being verified |
| code | TEXT | NOT NULL | 6-digit verification code |
| expires_at | TIMESTAMP | NOT NULL | When code expires (5 min) |
| created_at | TIMESTAMP | DEFAULT NOW | When code was generated |

**Foreign Key**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- Delete codes when user deleted
```

**Indexes**
```sql
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
-- Purpose: Fast lookup by email

CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
-- Purpose: Fast lookup by user

CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);
-- Purpose: Cleanup of expired codes
```

**Example Data**
```sql
INSERT INTO verification_codes (id, user_id, email, code, expires_at) VALUES
  ('code-1', '550e8400-e29b-41d4-a716-446655440000', 'john@example.com',
   '123456', NOW() + INTERVAL '5 minutes');
```

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │◄─────┐
│ name        │      │
│ email       │      │
│ password    │      │
│ verified_at │      │
└─────────────┘      │
       │              │
       │ 1:N          │
       │              │
       ├─────────────────────────┐
       │                         │
       ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  workspaces      │      │  expenses        │
├──────────────────┤      ├──────────────────┤
│ id (PK)          │      │ id (PK)          │
│ user_id (FK)─────┼──────►user_id (FK)      │
│ title            │      │ workspace_id(FK)-┤
│ description      │      │ amount           │
│ type             │      │ description      │
├──────────────────┤      │ category         │
│ ◄────workspace_id├──────┤ date             │
└──────────────────┘      └──────────────────┘
       │
       │
       ▼
┌──────────────────────┐
│ verification_codes   │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)─────────┤ (to users)
│ email                │
│ code                 │
│ expires_at           │
└──────────────────────┘
```

---

## 🔍 Common SQL Queries

### 1. Get All Workspaces for User
```sql
SELECT id, title, description, type, created_at
FROM workspaces
WHERE user_id = $1
ORDER BY created_at DESC;

-- Parameter: $1 = userId
-- Purpose: Fetch user's workspaces for sidebar
-- Performance: Uses index on user_id
```

**Usage in Code**
```typescript
const { data: workspaces } = await supabase
  .from('workspaces')
  .select('id, title, description, type, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

---

### 2. Get Expenses for Workspace (with Month/Year Filter)
```sql
SELECT id, amount, description, category, date, workspace_id
FROM expenses
WHERE user_id = $1
  AND workspace_id = $2
  AND EXTRACT(MONTH FROM date) = $3
  AND EXTRACT(YEAR FROM date) = $4
ORDER BY date DESC;

-- Parameters:
-- $1 = userId (security check)
-- $2 = workspaceId
-- $3 = month (1-12)
-- $4 = year (2024)
```

**Usage in Code**
```typescript
const { data: expenses } = await supabase
  .from('expenses')
  .select('id, amount, description, category, date, workspace_id')
  .eq('user_id', userId)
  .eq('workspace_id', workspaceId)
  .then(data => data.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  }))
  .order('date', { ascending: false });
```

---

### 3. Get Expense Summary (Category-wise)
```sql
SELECT 
  SUM(amount) as totalSpend,
  COUNT(*) as expenseCount,
  category,
  SUM(amount) as categoryAmount
FROM expenses
WHERE user_id = $1
  AND workspace_id = $2
  AND EXTRACT(MONTH FROM date) = $3
  AND EXTRACT(YEAR FROM date) = $4
GROUP BY category
ORDER BY categoryAmount DESC;

-- Parameters:
-- $1 = userId
-- $2 = workspaceId  
-- $3 = month
-- $4 = year
```

**Usage in Code**
```typescript
const { data: expenses } = await supabase
  .from('expenses')
  .select('amount, category')
  .eq('user_id', userId)
  .eq('workspace_id', workspaceId);

// Group by category in application
const summary = expenses.reduce((acc, e) => {
  acc[e.category] = (acc[e.category] || 0) + e.amount;
  return acc;
}, {});
```

---

### 4. Create New Workspace
```sql
INSERT INTO workspaces (id, user_id, title, description, type, created_at)
VALUES ($1, $2, $3, $4, 'custom', NOW())
RETURNING id, title, description, type, created_at;

-- Parameters:
-- $1 = generated UUID
-- $2 = userId
-- $3 = workspace title
-- $4 = description
```

**Usage in Code**
```typescript
const { data: workspace } = await supabase
  .from('workspaces')
  .insert({
    user_id: userId,
    title: 'Personal',
    description: 'My personal expenses',
    type: 'custom',
    created_at: new Date().toISOString(),
  })
  .select();
```

---

### 5. Create New Expense
```sql
INSERT INTO expenses (id, user_id, workspace_id, amount, description, category, date, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
RETURNING id, amount, description, category, date, workspace_id;

-- Parameters:
-- $1 = generated UUID
-- $2 = userId
-- $3 = workspaceId
-- $4 = amount (decimal)
-- $5 = description
-- $6 = category
-- $7 = date
```

**Usage in Code**
```typescript
const { data: expense } = await supabase
  .from('expenses')
  .insert({
    user_id: userId,
    workspace_id: workspaceId,
    amount: 500.00,
    description: 'Groceries',
    category: 'Food',
    date: '2024-12-16',
    created_at: new Date().toISOString(),
  })
  .select();
```

---

### 6. Get User by Email
```sql
SELECT id, name, email, password, verified_at
FROM users
WHERE email = $1;

-- Parameter: $1 = email
-- Purpose: Authentication during login
-- Performance: Uses unique index on email
```

**Usage in Code**
```typescript
const { data: user } = await supabase
  .from('users')
  .select('id, name, email, password, verified_at')
  .eq('email', email)
  .single();
```

---

### 7. Verify Email (Update verified_at)
```sql
UPDATE users
SET verified_at = NOW()
WHERE id = $1
RETURNING id, name, email, verified_at;

-- Parameter: $1 = userId
-- Purpose: Mark user as email verified
```

**Usage in Code**
```typescript
const { data: user } = await supabase
  .from('users')
  .update({ verified_at: new Date().toISOString() })
  .eq('id', userId)
  .select();
```

---

### 8. Create Verification Code
```sql
INSERT INTO verification_codes (id, user_id, email, code, expires_at)
VALUES ($1, $2, $3, $4, NOW() + INTERVAL '5 minutes')
RETURNING id, email, code, expires_at;

-- Parameters:
-- $1 = generated UUID
-- $2 = userId
-- $3 = email
-- $4 = 6-digit code
```

**Usage in Code**
```typescript
const { data: verificationCode } = await supabase
  .from('verification_codes')
  .insert({
    user_id: userId,
    email: email,
    code: generateCode(),
    expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
  })
  .select();
```

---

### 9. Get Verification Code
```sql
SELECT id, user_id, email, code, expires_at
FROM verification_codes
WHERE email = $1
  AND code = $2
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;

-- Parameters:
-- $1 = email
-- $2 = code
-- Purpose: Validate verification code
```

**Usage in Code**
```typescript
const { data: verificationCode } = await supabase
  .from('verification_codes')
  .select()
  .eq('email', email)
  .eq('code', code)
  .gt('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

---

### 10. Delete Verification Code
```sql
DELETE FROM verification_codes
WHERE id = $1;

-- Parameter: $1 = codeId
-- Purpose: Clean up after verification
```

**Usage in Code**
```typescript
await supabase
  .from('verification_codes')
  .delete()
  .eq('id', verificationCodeId);
```

---

## 🔒 Data Security

### Password Security
```
Plain Password: "SecurePassword123"
         ↓ (bcryptjs with salt=10)
Stored Hash: "$2a$10$k3GvqxZ5x5ZxZ5ZxZ5ZxZeL3n.5z5z5z5z5z5z5z5z5z5z5z5z5z5"
```

### Data Isolation
```sql
-- User A cannot see User B's data
SELECT * FROM expenses
WHERE user_id = 'user-a-id'  -- Only their expenses
  AND workspace_id IN (
    SELECT id FROM workspaces 
    WHERE user_id = 'user-a-id'  -- Only their workspaces
  );
```

### Foreign Key Constraints
```sql
-- If workspace deleted, expenses deleted
ON DELETE CASCADE

-- If user deleted, workspaces & expenses deleted
ON DELETE CASCADE
```

---

## 📈 Query Performance

### Execution Times (Typical)
| Query | Time | Indexed By |
|-------|------|-----------|
| Get workspaces | ~20ms | user_id |
| Get expenses | ~30ms | user_id, workspace_id, date |
| Get summary | ~40ms | compound index |
| Create workspace | ~15ms | insert only |
| Create expense | ~15ms | insert only |

### Optimization Tips
1. **Always filter by user_id** - security + performance
2. **Use indexes** - defined on all FK and search columns
3. **Limit results** - use LIMIT for large datasets
4. **Pagination** - for expense lists > 100 items
5. **Caching** - cache summary for 5 minutes

---

## 🧹 Data Cleanup

### Delete Expired Verification Codes
```sql
DELETE FROM verification_codes
WHERE expires_at < NOW();

-- Run this: Daily (via cron job)
-- Purpose: Remove old verification codes
```

### Archive Old Expenses
```sql
-- Optional: Move expenses > 1 year old to archive table
CREATE TABLE expenses_archive AS
SELECT * FROM expenses
WHERE date < NOW() - INTERVAL '1 year';

DELETE FROM expenses
WHERE date < NOW() - INTERVAL '1 year';
```

---

## 🚀 Migration Scripts

### Initial Setup (Run Once)
```sql
-- Create tables
\i /path/to/01-create-tables.sql

-- Create indexes
\i /path/to/02-create-indexes.sql

-- Create constraints
\i /path/to/03-create-constraints.sql

-- Seed test data (optional)
\i /path/to/04-seed-data.sql
```

---

## 📊 Database Statistics

### Table Sizes (approx. for 1000 users)
| Table | Records | Size |
|-------|---------|------|
| users | 1,000 | 200KB |
| workspaces | 3,000 | 150KB |
| expenses | 30,000 | 1.5MB |
| verification_codes | 5,000 | 150KB |

### Growth Rate
- Users: +10 per day = +3,650/year
- Workspaces: +30 per day = ~10K/year
- Expenses: +300 per day = ~110K/year

---

## 🔧 Database Maintenance

### Regular Backups
```bash
# Daily backup
pg_dump expense_db > backup_$(date +%Y%m%d).sql

# Hourly backup to S3 (automated)
```

### Monitoring
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Optimization
```sql
-- Analyze query plans
EXPLAIN ANALYZE
SELECT * FROM expenses WHERE user_id = $1;

-- Reindex if needed
REINDEX TABLE expenses;
```

