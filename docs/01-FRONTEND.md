# 🎨 Frontend Documentation

## Overview
The frontend is a modern, responsive web application built with Next.js and React that provides a multi-workspace expense tracking interface with real-time dashboard analytics.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14+ | React framework with App Router, API routes |
| **React** | 18+ | UI component library |
| **TypeScript** | Latest | Type safety and better DX |
| **Tailwind CSS** | Latest | Utility-first CSS framework |
| **Lucide React** | Latest | Beautiful SVG icons |
| **JWT** | Library | Token-based authentication |
| **localStorage** | Browser API | Client-side token storage |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── register/
│   │   │   └── page.tsx           # Registration page
│   │   └── verify-email/
│   │       └── page.tsx           # Email verification page
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard (multi-workspace)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── verify-email/route.ts
│   │   ├── workspaces/route.ts    # Workspace CRUD
│   │   ├── expenses/
│   │   │   ├── route.ts           # Expense CRUD
│   │   │   └── summary/route.ts   # Expense analytics
│   │   └── test/
│   │       └── supabase/route.ts  # Connection test
│   └── ...
├── lib/
│   ├── supabase.ts                # Supabase client config
│   ├── jwt.ts                     # JWT token utilities
│   └── ...
├── components/
│   └── (future UI components)
└── styles/
    └── globals.css
```

---

## 🔐 Authentication Flow

### 1. **Registration Page** (`/auth/register`)
```
User fills form (name, email, password, confirm password)
           ↓
Client validates form
           ↓
POST /api/auth/register with credentials
           ↓
Backend: Hash password, create user in DB
           ↓
Backend: Send verification email
           ↓
Response: { message: "Check your email" }
           ↓
Redirect to /auth/verify-email
```

### 2. **Email Verification** (`/auth/verify-email`)
```
User enters verification code from email
           ↓
Client-side form submission
           ↓
POST /api/auth/verify-email with code
           ↓
Backend: Verify code, mark user as verified
           ↓
Response: { token: "jwt-token" }
           ↓
Store token in localStorage
           ↓
Redirect to /dashboard
```

### 3. **Login Page** (`/auth/login`)
```
User fills email & password
           ↓
POST /api/auth/login
           ↓
Backend: Verify credentials, hash check
           ↓
Backend: Generate JWT token
           ↓
Response: { token: "jwt-token", user: {...} }
           ↓
Store token in localStorage
           ↓
Redirect to /dashboard
```

### 4. **Token Storage & Usage**
```typescript
// Store
localStorage.setItem('token', jwtToken);

// Retrieve & Use
const token = localStorage.getItem('token');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

---

## 📊 Dashboard Page Logic

### State Management
```typescript
const [user, setUser] = useState<{ name: string; email: string } | null>(null);
const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
const [expenses, setExpenses] = useState<Expense[]>([]);
const [summary, setSummary] = useState<Summary | null>(null);
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
```

### Lifecycle Hooks

#### Hook 1: Authentication Check (On Mount)
```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/auth/login');  // Redirect if no token
  } else {
    fetchWorkspaces();           // Load workspaces
  }
}, [router]);
```

**Purpose**: Protect dashboard route - only authenticated users can access

---

#### Hook 2: Empty State Detection
```typescript
useEffect(() => {
  if (workspaces.length === 0) {
    setShowEmptyStateModal(true);  // Show welcome modal
  }
}, [workspaces.length]);
```

**Purpose**: Show modal when first-time users have no workspaces

---

#### Hook 3: Data Loading On Workspace Change
```typescript
useEffect(() => {
  if (selectedWorkspace) {
    fetchExpenses();           // Get expenses for workspace
    fetchSummary();            // Get analytics data
  }
}, [selectedWorkspace, selectedMonth, selectedYear]);
```

**Purpose**: Reload expenses & summary when user switches workspace or changes month/year filter

---

### Major Functions

#### 1. `fetchWorkspaces()`
```typescript
// GET /api/workspaces
// Sets: workspaces[], user data
// Selects first workspace by default
// Shows empty state if no workspaces
```

**Logic**:
- Get token from localStorage
- Call API with Authorization header
- If 401: Clear token, redirect to login
- If success: Set workspaces and select first one
- If error: Show error message

---

#### 2. `fetchExpenses()`
```typescript
// GET /api/expenses?workspace_id=X&month=Y&year=Z
// Sets: expenses[] for current workspace
// Filters by selected month & year
```

**Logic**:
- Check if workspace selected
- Call API with filters (workspace_id, month, year)
- Parse response and set expenses array
- Handle errors gracefully

---

#### 3. `fetchSummary()`
```typescript
// GET /api/expenses/summary?workspace_id=X&month=Y&year=Z
// Sets: summary (totalSpend, categoryWise, expenseCount)
// Used for dashboard cards
```

**Logic**:
- Fetch analytics data for selected workspace
- Calculate:
  - Total expenses for month
  - Category-wise breakdown
  - Expense count
- Update summary state

---

#### 4. `createWorkspace()`
```typescript
// POST /api/workspaces
// Body: { title, description }
// Sets: Add new workspace to workspaces[]
```

**Logic**:
- Validate workspace title (required)
- Call API with workspace data
- If success:
  - Add to workspaces array
  - Clear form
  - Close modal/form
  - Select new workspace
- If error: Show error message

---

#### 5. `handleAddExpense()`
```typescript
// POST /api/expenses
// Body: { amount, description, category, date, workspace_id }
// Sets: Clear form, refresh expenses & summary
```

**Logic**:
- Validate all required fields
- Parse amount as float
- Include workspace_id from selectedWorkspace
- Call API
- If success:
  - Clear expense form
  - Hide form
  - Refresh expenses list
  - Refresh summary data
  - Clear error
- If error: Show error message

---

#### 6. `handleLogout()`
```typescript
// Remove token and redirect to home
```

**Logic**:
- Delete token from localStorage
- Redirect to `/` (home page)
- User loses all access to protected pages

---

## 🎨 UI Components

### 1. **Empty State Modal**
```
┌─────────────────────────────┐
│   Welcome! 👋               │
│   Let's create your first   │
│   workspace to get started  │
│                             │
│   [Workspace Name Input]    │
│   [Description Input]       │
│                             │
│   [Cancel] [Create]         │
└─────────────────────────────┘
```

**Trigger**: When `workspaces.length === 0` and modal is shown

---

### 2. **Sidebar**
```
┌──────────────────┐
│ 💼 Workspaces   │
├──────────────────┤
│ ✓ Personal       │ (selected)
│   My Home Exp.   │
├──────────────────┤
│   Business       │ (unselected)
│   Work Exp.      │
├──────────────────┤
│ [+ New Workspace]│
└──────────────────┘
```

**Features**:
- Shows all user's workspaces
- Highlights selected workspace
- Click to switch workspace
- Form to create new workspace (expandable)
- Collapse/expand toggle

---

### 3. **Topbar**
```
┌────────────────────────────────────────┐
│ ☰  Dashboard           [Logout]        │
│     John Doe • john@gmail.com          │
└────────────────────────────────────────┘
```

**Features**:
- Menu toggle for mobile
- Current workspace title
- User name & email
- Logout button

---

### 4. **Filter Section**
```
┌─────────────────────────────────────────┐
│ [Month ▼] [Year ▼]    [+ Add Expense]  │
└─────────────────────────────────────────┘
```

**Features**:
- Month dropdown (1-12)
- Year dropdown (last 5 years)
- Add expense button
- Re-fetches data when changed

---

### 5. **Summary Cards**
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total Expenses   │ Monthly Average  │ Top Categories   │
│ ₹5,234.50        │ ₹5,234.50        │ Food: ₹2,100     │
│ 12 transactions  │ Per month        │ Transport: ₹800  │
└──────────────────┴──────────────────┴──────────────────┘
```

**Data Source**: `fetchSummary()` API

---

### 6. **Expenses Table**
```
┌─────────────────┬──────────────┬────────────┬──────────┐
│ Description     │ Category     │ Date       │ Amount   │
├─────────────────┼──────────────┼────────────┼──────────┤
│ Groceries       │ Food         │ 16 Dec    │ ₹500.00  │
│ Bus Pass        │ Transport    │ 15 Dec    │ ₹50.00   │
│ Movie Tickets   │ Entertainment│ 14 Dec    │ ₹600.00  │
└─────────────────┴──────────────┴────────────┴──────────┘
```

**Features**:
- Sorted by date (most recent first)
- Category badges with colors
- Loading state
- Empty state when no expenses

---

## 🔄 Data Flow Diagram

```
┌──────────────────┐
│  User Opens App  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Check localStorage for token │
└────────┬────────────┬────────┘
         │            │
      ✓  │            │  ✗
         │            │
         ▼            ▼
    ┌─────────┐  ┌────────────┐
    │Dashboard│  │Login Page  │
    └────┬────┘  └────────────┘
         │
         ▼
┌──────────────────────────────┐
│  GET /api/workspaces         │
│  (with JWT token)            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Check workspaces.length     │
└─────┬──────────────────┬─────┘
      │ = 0              │ > 0
      │                  │
      ▼                  ▼
 ┌─────────────┐   ┌──────────────────┐
 │ Show Modal  │   │ Select First WS  │
 │ Create First│   │ Load Dashboard   │
 │ Workspace   │   └────────┬─────────┘
 └────┬────────┘            │
      │                     ▼
      └────────────┬────────────────────┐
                   │                    │
                   ▼                    ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ GET /expenses    │  │ GET /summary     │
        │ GET /summary     │  │ (with filters)   │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Render Dashboard│
                   │ with all data    │
                   └──────────────────┘
```

---

## 🎯 Major UI Logic

### 1. **Conditional Rendering - Empty State**
```tsx
{workspaces.length === 0 ? (
  <div>Show "No Workspaces Yet" with button</div>
) : (
  <div>Show full dashboard</div>
)}
```

**Purpose**: Different UI for new users vs existing users

---

### 2. **Category Colors**
```typescript
const categoryColors: { [key: string]: string } = {
  Food: 'bg-red-500/20 text-red-300 border-red-500/30',
  Transport: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Entertainment: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  // ...
};
```

**Usage**: Visual categorization of expenses

---

### 3. **Dynamic Month/Year Selection**
```typescript
{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
  <option key={month} value={month}>
    {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
  </option>
))}
```

**Purpose**: Filter expenses by time period

---

### 4. **Loading States**
```tsx
{loading ? (
  <div>Loading expenses...</div>
) : expenses.length === 0 ? (
  <div>No expenses found</div>
) : (
  <table>Render table</table>
)}
```

**Purpose**: Show user feedback during data fetching

---

## 🔒 Security Measures

1. **Token Storage**: JWT stored in localStorage
2. **Authorization Header**: `Authorization: Bearer <token>`
3. **Protected Routes**: Dashboard redirects to login if no token
4. **Token Validation**: Backend verifies token on each request
5. **CORS**: API calls must include proper headers

---

## 📱 Responsive Design

- **Mobile First**: Sidebar collapses on small screens
- **Tablet**: 2-column layout for summary cards
- **Desktop**: Full 3-column layout
- **Icons**: Lucide React for scalable SVGs

---

## 🚀 Performance Optimizations

1. **useCallback**: Memoize API functions to prevent re-renders
2. **Conditional Fetching**: Only fetch data when workspace selected
3. **Debounced Filters**: Month/year changes trigger single fetch
4. **Local State**: No unnecessary re-renders from parent components

---

## 🐛 Common Frontend Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Blank dashboard | No token | Redirect to login |
| Workspaces not loading | API error | Check JWT extraction in backend |
| Expenses not showing | Wrong workspace_id | Verify workspace selection |
| Modal won't close | State not updated | Check onClick handler |
| Token expired | Stale token | Implement token refresh |

---

## 📝 Future Enhancements

- [ ] Expense editing & deletion
- [ ] Budget limits & alerts
- [ ] Recurring expenses
- [ ] Export to CSV/PDF
- [ ] Dark/light mode toggle
- [ ] Mobile app (React Native)
- [ ] Charts & graphs
- [ ] Expense sharing between users
- [ ] Multi-currency support
- [ ] Receipt image upload

