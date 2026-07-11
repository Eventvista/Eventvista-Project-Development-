// frontend/app/(dashboard)/budget/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BudgetPage() {
  const [budgetData, setBudgetData] = useState({ total: 0, spent: 0, allocations: [] });
  const [activeEventId, setActiveEventId] = useState("");
  const [formData, setFormData] = useState({ category: "", budgeted: "", spent: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rehydrate application context parameters on mount
  useEffect(() => {
    const storedId = localStorage.getItem("activeEventId");
    if (storedId) {
      setActiveEventId(storedId);
      fetchBudgetDetails(storedId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBudgetDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBudgetData({
          total: json.data.budget?.total || 0,
          spent: json.data.budget?.spent || 0,
          allocations: json.data.budget?.allocations || []
        });
      }
    } catch (err) {
      console.error("Budget pipeline hydration sync error:", err);
      setError("Failed to coordinate server-side ledger metrics.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.budgeted || !activeEventId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/events/${activeEventId}/allocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: formData.category,
          budgeted: Number(formData.budgeted),
          spent: Number(formData.spent || 0)
        })
      });
      const json = await res.json();
      if (json.success) {
        // Re-trigger global sync to guarantee state consistency
        fetchBudgetDetails(activeEventId);
        setFormData({ category: "", budgeted: "", spent: "" });
      } else {
        setError(json.message || "Failed to commit ledger entry.");
      }
    } catch (err) {
      console.error("Failed to commit expense to database instance:", err);
      setError("Network fault intercepted ledger transaction modification.");
    }
  };

  const fmt = (n) => `ksh ${Number(n || 0).toLocaleString()}`;
  const balance = budgetData.total - budgetData.spent;
  
  // Calculate true runtime expenditure percentage for visual telemetry
  const spentPct = budgetData.total > 0 ? Math.min(Math.round((budgetData.spent / budgetData.total) * 100), 100) : 0;

  if (loading) {
    return <div className="p-8 text-sm font-medium text-neutral-500 animate-pulse">Synchronizing ledger metrics...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Enhanced Routing UX Header Framework */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3 py-1.5 text-xs">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Budget Analytics</h1>
        </div>
        {error && <p className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">{error}</p>}
      </div>

      {/* Numerical Performance Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Cap Allocation</p>
          <p className="mt-2 text-xl font-bold text-neutral-900">{fmt(budgetData.total)}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Utilized Cashflow</p>
          <p className="mt-2 text-xl font-bold text-purple-600">{fmt(budgetData.spent)}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Remaining Balance</p>
          <p className="mt-2 text-xl font-bold text-green-600">{fmt(balance)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Itemized General Ledger Table Layout */}
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-neutral-800 uppercase tracking-wider">Expense Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs font-bold uppercase text-neutral-400">
                  <th scope="col" className="py-2">Line Item Category</th>
                  <th scope="col" className="py-2">Budgeted Cap</th>
                  <th scope="col" className="py-2">Actual Expended</th>
                  <th scope="col" className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {budgetData.allocations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-neutral-400">
                      No tracked line items assigned to this event context.
                    </td>
                  </tr>
                ) : (
                  budgetData.allocations.map((row, idx) => {
                    const isOverBudget = row.spent > row.budgeted;
                    return (
                      <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 font-semibold text-neutral-800">{row.category}</td>
                        <td className="py-3 text-neutral-500">{fmt(row.budgeted)}</td>
                        <td className="py-3 text-neutral-700 font-medium">{fmt(row.spent)}</td>
                        <td className={`py-3 text-xs font-bold ${isOverBudget ? "text-red-500" : "text-green-600"}`}>
                          {isOverBudget ? "⚠️ Over Cap" : "✓ Stable"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Dynamic Data Charts & Control Panel Stack */}
        <div className="space-y-6">
          
          {/* Dynamic Circular Visual Gauge Card */}
          <Card className="flex flex-col items-center justify-center text-center p-6">
            <div
              role="img"
              aria-label={`${spentPct}% of global event budget spent`}
              className="relative flex h-44 w-44 items-center justify-center rounded-full shadow-inner transition-transform duration-500"
              style={{
                background: `conic-gradient(#5b39e0 ${spentPct}%, #1fae72 ${spentPct}% 100%)`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow">
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Budget Spent</p>
                <p className="text-sm font-black text-neutral-800 mt-0.5">{spentPct}%</p>
                <p className="text-[10px] text-neutral-500 mt-1 max-w-[80px] truncate">{fmt(budgetData.spent)}</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-4 text-[11px] font-medium text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-600 inline-block" /> Spent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> Balance
              </span>
            </div>
          </Card>

          {/* Allocation Entry Writeback Submission Card */}
          <Card>
            <h2 className="mb-4 text-xs font-bold text-neutral-800 uppercase tracking-wider">Post Allocation Ledger</h2>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="sr-only">Allocation Category</label>
                <input
                  type="text"
                  placeholder="Category (e.g., Catering, Venue)"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  disabled={!activeEventId}
                  required
                />
              </div>
              <div>
                <label className="sr-only">Budgeted Cap Amount</label>
                <input
                  type="number"
                  placeholder="Budgeted Cap (Ksh)"
                  value={formData.budgeted}
                  onChange={(e) => setFormData({ ...formData, budgeted: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  disabled={!activeEventId}
                  required
                />
              </div>
              <div>
                <label className="sr-only">Actual Expended Amount</label>
                <input
                  type="number"
                  placeholder="Actual Expended (Ksh Optional)"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  disabled={!activeEventId}
                />
              </div>
              <Button type="submit" className="w-full text-xs font-bold py-2.5" disabled={!activeEventId}>
                Commit Ledger Action
              </Button>
            </form>
          </Card>
          
        </div>
      </div>
    </div>
  );
}