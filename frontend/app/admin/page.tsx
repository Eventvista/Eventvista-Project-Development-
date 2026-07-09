// frontend/app/admin/page.js
"use client";

import Card from "@/components/ui/Card";

export default function AdminDashboardPage() {
  const kpis = [
    { title: "System Throughput", value: "842 Events", description: "Active system events running globally", color: "text-purple-600" },
    { title: "Budget Deviation Index", value: "92.4%", description: "Actual total spent compared to baseline targets", color: "text-green-600" },
    { title: "User Ecosystem Ratio", value: "3.2 : 1", description: "Proportion of active Organisers to Vendor accounts", color: "text-blue-600" },
    { title: "Trellis AI Engine Latency", value: "3.84s", description: "Average duration of multi-modal layout assembly", color: "text-amber-600" }
  ];

  return (
    <div className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      <div>
        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">System Monitoring Workspace</span>
        <h1 className="text-2xl font-bold text-neutral-900 mt-2">Platform Administration & KPIs Terminal</h1>
        <p className="text-xs text-neutral-500">Live operational telemetry tracking layout engine cycles and cloud database performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="border border-neutral-100 shadow-sm">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">{kpi.title}</p>
            <p className={`text-3xl font-extrabold my-2 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-neutral-500 leading-snug">{kpi.description}</p>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-900 mb-4">Core System Verification Operations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase">
                <th className="pb-2">Monitoring Node ID</th>
                <th className="pb-2">Component Sector</th>
                <th className="pb-2">Performance Threshold</th>
                <th className="pb-2">Status Flag</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-50"><td className="py-3 font-mono">node-auth-firebase</td><td className="py-3">Google Auth Central Gateway</td><td className="py-3">140ms validation speed</td><td className="py-3 text-green-600 font-bold">Operational</td></tr>
              <tr className="border-b border-neutral-50"><td className="py-3 font-mono">node-ai-trellis-hf</td><td className="py-3">3D Layout Rehydration Pipeline</td><td className="py-3">99.2% parsing success scale</td><td className="py-3 text-green-600 font-bold">Operational</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}