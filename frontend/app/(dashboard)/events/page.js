// frontend/app/(dashboard)/events/page.js
"use client";

import { useState, useMemo, useEffect } from "react";
import DataTable from "@/components/molecules/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";


export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/v1/events", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setEvents(data.data);
        } else {
          setError(data.message || "Failed to fetch events");
        }
      } catch (err) {
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(
    () => events.filter((e) => e.title && e.title.toLowerCase().includes(query.toLowerCase())),
    [query, events]
  );

  const columns = [
    {
      key: "title", label: "Event Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 font-bold">
            {row.title.charAt(0)}
          </div>
          <span className="font-medium text-neutral-800">{row.title}</span>
        </div>
      ),
    },
    { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
    { key: "eventType", label: "Type", render: (row) => <span className="capitalize">{row.eventType}</span> },
    { key: "guestCount", label: "Guests" },
    { key: "status", label: "Status", render: (row) => <Badge status={row.layout ? "confirmed" : "planning"} /> },
    {
      key: "action", label: "Action",
      render: () => (
        <button className="text-neutral-400 hover:text-neutral-700 text-lg font-bold">···</button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
          <Button variant="secondary" className="px-3 py-1.5 text-xs">← Back to Dashboard</Button>
          </Link>        
          <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
          </div>
        <Button>+ New Event</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar id="events-search" value={query} onChange={setQuery} placeholder="Search Events" />
      </div>
      
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      {loading ? (
        <div className="py-10 text-center text-neutral-500">Loading events...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} caption="List of events" />
      )}
    </div>
  );
}