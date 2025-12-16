'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Plus,
  LogOut,
  Menu,
  X,
  TrendingUp,
  PieChart,
  ArrowDownRight,
  FolderPlus,
} from 'lucide-react';

interface Workspace {
  id: string;
  title: string;
  description?: string;
  type: string;
  created_at: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  workspace_id: string;
}

interface Summary {
  totalSpend: number;
  categoryWise: { [key: string]: number };
  expenseCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ title: '', description: '' });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showEmptyStateModal, setShowEmptyStateModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    } else {
      fetchWorkspaces();
    }
  }, [router]);

  useEffect(() => {
    if (workspaces.length === 0) {
      setShowEmptyStateModal(true);
    }
  }, [workspaces.length]);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchExpenses();
      fetchSummary();
    }
  }, [selectedWorkspace, selectedMonth, selectedYear]);

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setWorkspaces(data.workspaces || []);
        if (data.workspaces && data.workspaces.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data.workspaces[0].id);
        }
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError('Failed to load workspaces');
    }
  }, [router, selectedWorkspace]);

  const fetchExpenses = useCallback(async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/expenses?workspace_id=${selectedWorkspace}&month=${selectedMonth}&year=${selectedYear}`,
        { headers: getAuthHeader() }
      );

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace, selectedMonth, selectedYear]);

  const fetchSummary = useCallback(async () => {
    if (!selectedWorkspace) return;
    try {
      const response = await fetch(
        `/api/expenses/summary?workspace_id=${selectedWorkspace}&month=${selectedMonth}&year=${selectedYear}`,
        { headers: getAuthHeader() }
      );

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, [selectedWorkspace, selectedMonth, selectedYear]);

  const createWorkspace = async () => {
    if (!newWorkspace.title.trim()) {
      setError('Workspace title is required');
      return;
    }

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newWorkspace),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces([...workspaces, data.workspace]);
        setNewWorkspace({ title: '', description: '' });
        setShowNewWorkspaceForm(false);
        setSelectedWorkspace(data.workspace.id);
      } else {
        setError('Failed to create workspace');
      }
    } catch (err) {
      console.error('Error creating workspace:', err);
      setError('Error creating workspace');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || !expenseForm.amount || !expenseForm.description) {
      setError('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
          workspace_id: selectedWorkspace,
        }),
      });

      if (response.ok) {
        setExpenseForm({
          amount: '',
          description: '',
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
        });
        setShowAddExpenseForm(false);
        setError('');
        fetchExpenses();
        fetchSummary();
      } else {
        setError('Failed to add expense');
      }
    } catch (err) {
      setError('Error adding expense');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const categoryColors: { [key: string]: string } = {
    Food: 'bg-red-500/20 text-red-300 border-red-500/30',
    Transport: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Entertainment: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Shopping: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    Utilities: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Health: 'bg-green-500/20 text-green-300 border-green-500/30',
    Other: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* ============ EMPTY STATE MODAL ============ */}
      {showEmptyStateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <FolderPlus className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              <h2 className="text-2xl font-bold mb-2">Welcome! 👋</h2>
              <p className="text-slate-400">Let's create your first workspace to get started.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createWorkspace();
                setShowEmptyStateModal(false);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Workspace name (e.g., Personal)"
                value={newWorkspace.title}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmptyStateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-lg transition"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============ SIDEBAR ============ */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-900/80 border-r border-slate-700 overflow-hidden transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-semibold text-lg">Workspaces</span>
          </div>
        </div>

        {/* Workspaces List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => setSelectedWorkspace(workspace.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                selectedWorkspace === workspace.id
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
              }`}
            >
              <div className="font-medium truncate">{workspace.title}</div>
              <div className="text-xs text-slate-500 truncate">{workspace.description || 'No description'}</div>
            </button>
          ))}
        </div>

        {/* New Workspace Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => setShowNewWorkspaceForm(!showNewWorkspaceForm)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-lg transition"
          >
            <FolderPlus className="w-4 h-4" />
            New Workspace
          </button>

          {/* New Workspace Form */}
          {showNewWorkspaceForm && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg space-y-3 border border-slate-700">
              <input
                type="text"
                placeholder="Workspace title"
                value={newWorkspace.title}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-slate-500 text-sm"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-slate-500 text-sm"
              />
              <button
                onClick={createWorkspace}
                className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded text-sm"
              >
                Create
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ============ TOPBAR ============ */}
        <nav className="h-20 bg-slate-900/50 border-b border-slate-700 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl font-bold">
                {workspaces.find((w) => w.id === selectedWorkspace)?.title || 'Dashboard'}
              </h1>
              <p className="text-xs text-slate-400">
                {user?.name} • {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </nav>

        {/* ============ DASHBOARD CONTENT ============ */}
        <div className="flex-1 overflow-auto">
          {workspaces.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FolderPlus className="w-20 h-20 mx-auto mb-4 text-slate-600" />
                <h3 className="text-2xl font-bold mb-2 text-slate-300">No Workspaces Yet</h3>
                <p className="text-slate-400 mb-6">Create your first workspace to start tracking expenses</p>
                <button
                  onClick={() => setShowEmptyStateModal(true)}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-lg transition"
                >
                  + Create Workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg">
                  {error}
                </div>
              )}

            {/* Month/Year Filter */}
            <div className="flex items-center gap-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAddExpenseForm(!showAddExpenseForm)}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>

            {/* Add Expense Form */}
            {showAddExpenseForm && (
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="Amount"
                    required
                    className="px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="Description"
                    required
                    className="px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-slate-500"
                  />
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white"
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Utilities</option>
                    <option>Health</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    required
                    className="px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-lg transition"
                  >
                    Add
                  </button>
                </form>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Total Expenses</p>
                    <p className="text-3xl font-bold">₹{summary?.totalSpend.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-slate-500 mt-2">{summary?.expenseCount || 0} transactions</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-emerald-500/30" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Monthly Average</p>
                    <p className="text-3xl font-bold">₹{((summary?.totalSpend || 0) / (selectedMonth || 1)).toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-2">Per month</p>
                  </div>
                  <PieChart className="w-12 h-12 text-blue-500/30" />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <div>
                  <p className="text-slate-400 text-sm mb-4">Top Categories</p>
                  <div className="space-y-2">
                    {summary?.categoryWise && Object.entries(summary.categoryWise)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-slate-300">{category}</span>
                          <span className="font-semibold">₹{amount.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                  Recent Transactions
                </h2>
              </div>

              {loading ? (
                <div className="p-6 text-center text-slate-400">Loading expenses...</div>
              ) : expenses.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No expenses found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50 text-slate-400 text-sm">
                      <tr>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-left">Category</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-6 py-3 text-slate-300">{expense.description}</td>
                          <td className="px-6 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[expense.category] || categoryColors.Other}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-slate-400 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-right font-semibold">₹{expense.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
