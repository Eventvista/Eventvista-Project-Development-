// frontend/app/(dashboard)/budget/page.js
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const SUMMARY = [
  { label: "Total Budget", value: "ksh 2,000,000" },
  { label: "Total Spent", value: "ksh 1,245,000" },
  { label: "Balance", value: "ksh 755,000" },
];

const EXPENSES = [
  { category: "Venue", budgeted: 600000, spent: 500000 },
  { category: "Catering", budgeted: 500000, spent: 320000 },
  { category: "Decoration", budgeted: 300000, spent: 200000 },
  { category: "Entertainment", budgeted: 200000, spent: 125000 },
  { category: "Miscellaneous", budgeted: 400000, spent: 100000 },
];

const fmt = (n) => `ksh ${n.toLocaleString()}`;

export default function BudgetPage() {
  const totalSpent = EXPENSES.reduce((sum, e) => sum + e.spent, 0);
  const totalBudget = EXPENSES.reduce((sum, e) => sum + e.budgeted, 0);
  const spentPct = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="space-y-6">
      {/* Enhanced Routing UX Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3 py-1.5 text-xs">← Back to Dashboard</Button>
          </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Budget Overview</h1>
        </div>
        <Button>+ Add Expenses</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUMMARY.map((item) => (
          <Card key={item.label}>
            <p className="text-xs font-medium text-neutral-500">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-neutral-900">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Expense Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs font-semibold uppercase text-neutral-500">
                  <th scope="col" className="py-2">Category</th>
                  <th scope="col" className="py-2">Budgeted</th>
                  <th scope="col" className="py-2">Spent</th>
                  <th scope="col" className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map((row) => (
                  <tr key={row.category} className="border-b border-neutral-50 last:border-0">
                    <td className="py-3 font-medium text-neutral-800">{row.category}</td>
                    <td className="py-3 text-neutral-600">{fmt(row.budgeted)}</td>
                    <td className="py-3 text-neutral-600">{fmt(row.spent)}</td>
                    <td className="py-3 font-medium text-green-500">Good</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
          <div
            role="img"
            aria-label={`${spentPct}% of budget spent`}
            className="relative flex h-44 w-44 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#5b39e0 ${spentPct}%, #1fae72 ${spentPct}% 90%, #eeedf2 90% 100%)`,
            }}
          >
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
              <p className="text-xs text-neutral-500">Budget Spent</p>
              <p className="text-base font-bold text-neutral-900">{fmt(totalSpent)}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-600 inline-block" />Spent</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" />Balance</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-neutral-200 inline-block" />Total</span>
          </div>
        </Card>
      </div>
    </div>
  );
}