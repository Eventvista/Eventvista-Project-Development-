// frontend/app/(dashboard)/vendors/page.js
"use client";

import { useState, useMemo, useEffect } from "react";
import DataTable from "@/components/molecules/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function VendorsPage() {
  const [query, setQuery] = useState("");
  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state dynamically from centralized database
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/v1/vendors", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const payload = await res.json();
        if (payload.success) {
          setVendorsList(payload.data);
        }
      } catch (error) {
        console.error("Failed to sync vendors configuration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const filtered = useMemo(
    () => vendorsList.filter((v) => v.name.toLowerCase().includes(query.toLowerCase())),
    [query, vendorsList]
  );

  const columns = [
    {
      key: "name", label: "Vendor",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className={`h-10 w-10 shrink-0 rounded-lg ${row.color || 'bg-neutral-300'}`} />
          <span className="font-medium text-neutral-800">{row.name}</span>
        </div>
      ),
    },
    { key: "category", label: "Category" },
    { key: "contact", label: "Contact" },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status || 'pending'} /> },
  ];

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Synchronizing vendor data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Vendors</h1>
        <Button>+ Add Vendor</Button>
      </div>
      <SearchBar id="vendors-search" value={query} onChange={setQuery} placeholder="Search vendors" />
      <DataTable columns={columns} rows={filtered} caption="List of active event vendors" />
    </div>
  );
}