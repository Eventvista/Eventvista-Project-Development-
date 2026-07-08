// frontend/app/(dashboard)/vendors/page.js
"use client";

import { useState, useMemo } from "react";
import DataTable from "@/components/molecules/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const VENDORS = [
  { id: 1, name: "Elegant Decor", category: "Decor", contact: "0712242544", status: "confirmed", color: "bg-purple-500" },
  { id: 2, name: "Classic Catering", category: "Catering", contact: "0700345675", status: "pending", color: "bg-green-500" },
  { id: 3, name: "Perfect Sounds", category: "Sound", contact: "0754757004", status: "confirmed", color: "bg-sky-500" },
  { id: 4, name: "Bright Lights", category: "Lighting", contact: "0111223354", status: "declined", color: "bg-neutral-900" },
  { id: 5, name: "Royal Photography", category: "Photography", contact: "0711767134", status: "pending", color: "bg-lime-600" },
];

export default function VendorsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => VENDORS.filter((v) => v.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const columns = [
    {
      key: "name", label: "Vendor",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className={`h-10 w-10 shrink-0 rounded-lg ${row.color}`} />
          <span className="font-medium text-neutral-800">{row.name}</span>
        </div>
      ),
    },
    { key: "category", label: "Category" },
    { key: "contact", label: "Contact" },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Vendors</h1>
        <Button>+ Add Vendor</Button>
      </div>
      <SearchBar id="vendors-search" value={query} onChange={setQuery} placeholder="Search vendors" />
      <DataTable columns={columns} rows={filtered} caption="List of vendors" />
    </div>
  );
}