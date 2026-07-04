"use client";

import { useState, useMemo } from "react";
import DataTable from "@/components/molecules/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const GUESTS = [
  { id: 1, name: "Alice Johnson", email: "alice@gmail.com", phone: "0712242544", status: "confirmed" },
  { id: 2, name: "Brian Smith", email: "brian@gmail.com", phone: "0700345675", status: "pending" },
  { id: 3, name: "Catherine Lee", email: "catherine@gmail.com", phone: "0754757004", status: "confirmed" },
  { id: 4, name: "David Brown", email: "david@gmail.com", phone: "0111223354", status: "declined" },
  { id: 5, name: "Emma Wilson", email: "emma@gmail.com", phone: "0711767134", status: "pending" },
];

export default function GuestsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => GUESTS.filter((g) => g.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "RSVP Status", render: (row) => <Badge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Guests</h1>
        <div className="flex gap-2">
          <Button variant="secondary">Import</Button>
          <Button>+ Add Guest</Button>
        </div>
      </div>
      <SearchBar id="guests-search" value={query} onChange={setQuery} placeholder="Search Guests" />
      <DataTable columns={columns} rows={filtered} caption="List of guests" />
    </div>
  );
}