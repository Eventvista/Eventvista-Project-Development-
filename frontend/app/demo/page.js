// frontend/app/demo/page.js
"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function DemoDashboard() {
  const mockStats = [
    { label: "Total Mock Events", value: "3", sublabel: "Sandbox Profile Mode" },
    { label: "Aggregated Attendance", value: "1,450", sublabel: "Simulated Metrics" },
    { label: "Target Financial Cap", value: "ksh 4,500,000", sublabel: "Mock Budget Framework" },
    { label: "Mesh Pipeline Assets", value: "24 Objects", sublabel: "Trellis 3D Previews" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-6 sm:p-8 space-y-6">
      {/* Simulation Banner Notice */}
      <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-xs font-semibold">You are interacting with the isolated Eventvista Demo space running simulated dashboard frameworks.</p>
        </div>
        <Link href="/onboarding" className="text-xs font-bold underline hover:text-amber-950">Create Live Profile →</Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Demo Interactive Environment 📊</h1>
          <p className="text-xs text-neutral-500">Evaluation panel showcasing mock sample data pipelines.</p>
        </div>
        <Link href="/">
          <button className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50">Exit Demo Space</button>
        </Link>
      </div>

      {/* Numerical Analytics Array */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((s, i) => (
          <Card key={i} className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-extrabold text-neutral-800 mt-1">{s.value}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{s.sublabel}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-white rounded-2xl border">
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-4">Simulated Dynamic Deployments</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-xl bg-neutral-50">
              <div><p className="text-sm font-bold text-neutral-800">Summer Gala Gala</p><p className="text-[11px] text-neutral-400">July 24, 2026 · 450 Guests</p></div>
              <Badge status="confirmed" />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-xl bg-neutral-50">
              <div><p className="text-sm font-bold text-neutral-800">AI Innovation Expo</p><p className="text-[11px] text-neutral-400">Sept 12, 2026 · 1,000 Guests</p></div>
              <Badge status="planning" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 text-white p-6 rounded-2xl flex flex-col justify-center items-center text-center min-h-[200px]">
          <div className="p-3 bg-white/10 rounded-full mb-3 text-purple-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v8a4 4 0 01-4 4H5a2 2 0 110-4h6V4z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold">3D Mesh Spatial Canvas Simulator</h4>
          <p className="text-xs text-neutral-400 max-w-sm mt-1">Live mesh graphs require an active account context to execute Hugging Face Trellis point-cloud matrix conversions.</p>
        </Card>
      </div>
    </div>
  );
}