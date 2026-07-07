// frontend/app/(dashboard)/events/page.js
"use client";

import { useState, useMemo } from "react";
import DataTable from "@/components/molecules/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const EVENTS = [
  { id: 1, name: "Dream Wedding", date: "24 July 2026", venue: "Nairobi, Kenya", guests: 120, status: "planning" },
  { id: 2, name: "Corporate Conference", date: "10 July 2026", venue: "KICC, Nairobi", guests: 300, status: "confirmed" },
  { id: 3, name: "Charity Gala Dinner", date: "1 August 2026", venue: "Sarova Panafric", guests: 200, status: "planning" },
  { id: 4, name: "Product Launch", date: "17 August 2026", venue: "TRM, Nairobi", guests: 150, status: "confirmed" },
  { id: 5, name: "Birthday Party", date: "30 August 2026", venue: "Karen Club", guests: 80, status: "planning" },
];

export default function EventsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => EVENTS.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const columns = [
    {
      key: "name", label: "Event Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
  src={
  row.id === 1 ? "/images/dream wedding photo.jpeg" :
  row.id === 2 ? "/images/corporate conferencee.jpeg" :
  row.id === 3 ? "/images/charity galaa photo.jpeg" :
  row.id === 4 ? "/images/product launch photo.jpeg" :
  "/images/birthday party photo.jpeg"
}
  alt={row.name}
  className="h-10 w-14 shrink-0 rounded-lg object-cover"
/>
          <span className="font-medium text-neutral-800">{row.name}</span>
        </div>
      ),
    },
    { key: "date", label: "Date" },
    { key: "venue", label: "Venue" },
    { key: "guests", label: "Guests" },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
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
        <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
        <Button>+ New Event</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar id="events-search" value={query} onChange={setQuery} placeholder="Search Events" />
      </div>
      <DataTable columns={columns} rows={filtered} caption="List of events" />
    </div>
  );
}