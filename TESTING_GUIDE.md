# 🧪 Testing the Multi-Workspace Dashboard

## Quick Test Walkthrough

### 1. **Register New Account**
```
Navigate to: http://localhost:3000/auth/register
Fill in:
- Name: Test User
- Email: test@example.com
- Password: password123
- Confirm: password123
Click: Register
```

### 2. **Verify Email**
```
Navigate to: http://localhost:3000/auth/verify?token=xxx
(Check email or server logs for token)
Should auto-verify and redirect to login
```

### 3. **Login**
```
Navigate to: http://localhost:3000/auth/login
Email: test@example.com
Password: password123
Click: Login
Should redirect to: /dashboard
```

### 4. **Create Workspaces**
```
In Dashboard:
1. Click "New Workspace" button in sidebar
2. Enter "Personal Expenses" as title
3. Enter "My personal spending" as description
4. Click "Create"
5. Create more: "Home", "Business", "Family"
```

### 5. **Add Expenses**
```
Select a workspace from sidebar
Click "Add Expense" button
Fill in:
- Amount: 500
- Description: Lunch at restaurant
- Category: Food
- Date: Today
Click: Add
Should appear in Recent Transactions table
```

### 6. **Filter by Month/Year**
```
Use dropdowns to select different months/years
Table should update with matching expenses
Summary cards recalculate automatically
```

### 7. **Switch Workspaces**
```
Click different workspace in sidebar
Should highlight with emerald border
Expenses table updates for that workspace
Summary cards recalculate
User info in topbar stays same
```

### 8. **Logout**
```
Click "Logout" button in topbar
Should clear token from localStorage
Redirect to home page
```

## Expected Data Flow

### Dashboard Load Sequence
```
1. Check token in localStorage
   └─ If not found → redirect to /auth/login

2. Fetch /api/workspaces with Bearer token
   └─ Returns: { workspaces: [...], user: {...} }

3. Set first workspace as selectedWorkspace

4. Fetch /api/expenses with workspace_id + month/year
   └─ Returns: { expenses: [...] }

5. Fetch /api/expenses/summary with workspace_id + month/year
   └─ Returns: { summary: {...} }

6. Render dashboard with data
```

### Create Workspace Flow
```
1. User fills form: { title, description }

2. Click "Create" button

3. POST /api/workspaces with Bearer token
   Request body: { title, description }

4. API:
   ├─ Verify token
   ├─ Extract user_id
   ├─ Insert to workspaces table
   └─ Return: { workspace: {...} }

5. Frontend:
   ├─ Add workspace to state
   ├─ Select new workspace
   ├─ Clear form
   └─ Close form
```

### Add Expense Flow
```
1. User fills form: { amount, description, category, date }

2. Click "Add" button

3. POST /api/expenses with Bearer token
   Request body: { 
     amount, 
     description, 
     category, 
     date,
     workspace_id
   }

4. API:
   ├─ Verify token
   ├─ Extract user_id
   ├─ Insert to expenses table
   └─ Return: { expense: {...} }

5. Frontend:
   ├─ Add expense to state
   ├─ Clear form
   ├─ Close form
   ├─ Refetch expenses (optional)
   └─ Recalculate summary
```

## URL Endpoints

### Pages
```
GET  /                          → Landing page
GET  /auth/register             → Register form
GET  /auth/login                → Login form
GET  /auth/verify?token=xxx     → Email verification
GET  /dashboard                 → Main dashboard
```

### APIs
```
GET  /api/workspaces            → Get user workspaces + info
POST /api/workspaces            → Create workspace
GET  /api/expenses              → Get expenses (filtered)
POST /api/expenses              → Create expense
GET  /api/expenses/summary      → Get summary (to implement)
```

## Server Logs Indicators

### ✅ Success Indicators
```
✅ Fetched X workspaces for user XXX
✅ Created workspace "Personal" for user XXX
✅ Fetched Y expenses for user XXX, workspace ZZZ
✅ Created expense ₹500 in workspace ZZZ for user XXX
✅ Generated summary for user XXX, workspace ZZZ: ₹2500
```

### ❌ Error Indicators
```
❌ Error fetching workspaces: [error message]
❌ Error creating workspace: [error message]
❌ Error fetching expenses: [error message]
❌ Auth error: [error message]
❌ Unauthorized
```

## Browser Console Checks

### Network Tab
```
1. Open DevTools → Network tab
2. Refresh dashboard
3. Should see:
   - workspaces request → 200 OK
   - expenses request → 200 OK
   - expenses/summary request → 200 OK

4. Response should be valid JSON with data
```

### Console Tab
```
1. Open DevTools → Console tab
2. Should NOT see any error messages
3. Check for logs from fetch operations
```

### Application Tab
```
1. Open DevTools → Application tab
2. Click "Local Storage"
3. Should have: localStorage.getItem('token')
   └─ Contains valid JWT token
```

## Sample Test Data

### Workspace Sample
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Personal",
  "description": "My personal expenses",
  "type": "custom",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Expense Sample
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 500,
  "description": "Lunch at restaurant",
  "category": "Food",
  "date": "2024-01-15",
  "workspace_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Summary Sample
```json
{
  "summary": {
    "totalSpend": 2500,
    "categoryWise": {
      "Food": 1200,
      "Transport": 800,
      "Entertainment": 500
    },
    "expenseCount": 8
  }
}
```

## Troubleshooting

### Issue: "Unauthorized" on dashboard
**Fix**: 
- Check if token exists in localStorage
- Try logging in again
- Check if token has expired (7 days)

### Issue: "No workspaces found"
**Fix**:
- Create a new workspace from dashboard
- Check Supabase if workspaces table has data
- Verify user_id matches in database

### Issue: Expenses not showing
**Fix**:
- Check if workspace is selected
- Check month/year filters match expense dates
- Verify workspace_id on expenses matches selected workspace

### Issue: Summary not calculating
**Fix**:
- Check if expenses exist for that workspace
- Verify expense amounts are valid numbers
- Check if dates are in selected month/year range

## Performance Tips

1. **Reduce API calls**: Cache workspaces list after first fetch
2. **Optimize filtering**: Filter month/year on backend using date range queries
3. **Lazy load expenses**: Load expenses on-demand instead of on mount
4. **Debounce filters**: Add debounce to month/year filter changes

