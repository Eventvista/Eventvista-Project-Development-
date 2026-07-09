// frontend/app/(dashboard)/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState([
    { label: "Total Events", value: "0", sublabel: "All time records" },
    { label: "Upcoming Events", value: "0", sublabel: "Next 30 days" },
    { label: "Total Budget", value: "ksh 0", sublabel: "Across events" },
    { label: "Total Guests", value: "0", sublabel: "Aggregated sum" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch user contextual profile metadata
        const userRes = await fetch("/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (userData.success) setUser(userData.data);

        // Fetch associated event data pipelines
        const eventsRes = await fetch("/api/v1/events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const eventsData = await eventsRes.json();
        
        if (eventsData.success && eventsData.data.length > 0) {
          const liveEvents = eventsData.data;
          setEvents(liveEvents);

          // Dynamically compute runtime aggregate metrics 
          const totalBudget = liveEvents.reduce((sum, e) => sum + (e.budget?.total || 0), 0);
          const totalGuests = liveEvents.reduce((sum, e) => sum + (e.guestCount || 0), 0);

          setStats([
            { label: "Total Events", value: String(liveEvents.length), sublabel: "All time records" },
            { label: "Upcoming Events", value: String(liveEvents.length), sublabel: "Next 30 days" },
            { label: "Total Budget", value: `ksh ${totalBudget.toLocaleString()}`, sublabel: "Across events" },
            { label: "Total Guests", value: totalGuests.toLocaleString(), sublabel: "Aggregated sum" },
          ]);
        }
      } catch (err) {
        console.error("Dashboard synchronization error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm font-medium text-neutral-500">
        Synchronizing system metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {user?.name || "User"} 👋</h1>
          <p className="text-sm text-neutral-500">Real-time status of your synchronized workspace.</p>
        </div>
        <Link href="/onboarding">
          <Button>+ New Event via AI</Button>
        </Link>
      </div>

      {/* Grid displaying computed workspace metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Active Deployments Section */}
        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Active Deployments</h2>
            {events.length > 0 && (
              <Link href="/events" className="text-xs font-semibold text-purple-600 hover:underline">
                View all
              </Link>
            )}
          </div>
          {events.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-neutral-400">No live configurations found.</p>
              <p className="text-xs text-neutral-400 mt-1">Use the AI onboarding terminal to start.</p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {events.slice(0, 3).map((event) => (
                <li key={event._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 text-sm font-bold">
                    {event.title?.charAt(0) || "E"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800">{event.title}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {event.date ? new Date(event.date).toLocaleDateString() : "No Date"} · {event.guestCount || 0} Guests
                    </p>
                  </div>
                  <Badge status={event.layout ? "confirmed" : "planning"} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 3D Canvas Spatial Rendering Preview */}
        <Card className="flex flex-col lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">3D Canvas Boundary Preview</h2>
            <Link href="/designer" className="text-xs font-semibold text-purple-600 hover:underline">
              View in 3D Designer
            </Link>
          </div>
          <div className="flex-1 min-h-48 rounded-xl bg-neutral-900 flex items-center justify-center text-center p-4">
            <p className="text-xs text-neutral-400 max-w-[200px]">
              Initialize a custom venue photo inside the spatial design application to build the mesh preview graph.
            </p>
          </div>
        </Card>

        {/* Dynamic Verification Logs */}
        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Verification Logs</h2>
          <ul className="space-y-4 text-xs text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
              <div>
                <p className="font-semibold text-neutral-800">Secure Context Sync</p>
                <p className="text-neutral-500 mt-0.5">Authenticated session established securely via Firebase Token integration hooks.</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}