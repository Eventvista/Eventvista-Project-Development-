// frontend/app/demo/page.js
"use client";

import Link from "next/link";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const MOCK_STATS = [
  { label: "Total Events", value: "3", sublabel: "All time records" },
  { label: "Upcoming Events", value: "2", sublabel: "Next 30 days" },
  { label: "Total Budget", value: "ksh 4,500,000", sublabel: "Across events" },
  { label: "Total Guests", value: "1,450", sublabel: "Aggregated sum" },
];

const MOCK_EVENTS = [
  { _id: "demo-1", title: "Summer Gala", date: "2026-07-24", guestCount: 450, layout: true },
  { _id: "demo-2", title: "AI Innovation Expo", date: "2026-09-12", guestCount: 1000, layout: false },
  { _id: "demo-3", title: "Charity Dinner", date: "2026-08-01", guestCount: 200, layout: true },
];

const MOCK_ACTIVITY = [
  "Vendor \"Elegant Decor\" confirmed for Summer Gala",
  "320 guests RSVP'd — 71% response rate",
  "Budget: ksh 1,245,000 of 2,000,000 allocated",
];

export default function DemoDashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-neutral-50">
        {/* Same shell component real users see — demoMode disables live links */}
        <Sidebar demoMode />
        <div className="flex flex-1 flex-col lg:ml-64 transition-all duration-300">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs font-semibold text-amber-900">
                Sandbox demo workspace — sample data only.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/onboarding" className="text-xs font-bold text-purple-700 underline hover:text-purple-900">
                Create Live Profile →
              </Link>
              <Link href="/">
                <button className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-50">
                  Exit Demo
                </button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Welcome back, Demo User 👋</h1>
              <p className="text-sm text-neutral-500">Sample workspace mirroring the live dashboard layout.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_STATS.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-neutral-900">Active Deployments</h2>
                </div>
                <ul className="divide-y divide-neutral-100">
                  {MOCK_EVENTS.map((event) => (
                    <li key={event._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 text-sm font-bold">
                        {event.title.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-800">{event.title}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {new Date(event.date).toLocaleDateString()} · {event.guestCount} Guests
                        </p>
                      </div>
                      <Badge status={event.layout ? "confirmed" : "planning"} />
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="flex flex-col lg:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-neutral-900">3D Canvas Boundary Preview</h2>
                </div>
                <div className="flex-1 min-h-48 rounded-xl bg-neutral-900 flex items-center justify-center text-center p-4">
                  <p className="text-xs text-neutral-400 max-w-[220px]">
                    Live mesh previews require an active account — the 3D Designer generates a real render here once you sign up.
                  </p>
                </div>
              </Card>

              <Card className="lg:col-span-1">
                <h2 className="mb-4 text-base font-semibold text-neutral-900">Recent Activity</h2>
                <ul className="space-y-4 text-xs text-neutral-600">
                  {MOCK_ACTIVITY.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}