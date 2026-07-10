// frontend/app/(dashboard)/admin/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable from "@/components/molecules/DataTable";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const [metricsRes, usersRes] = await Promise.all([
        fetch("/api/v1/admin/metrics", { headers }),
        fetch("/api/v1/users", { headers })
      ]);

      const metricsData = await metricsRes.json();
      const usersData = await usersRes.json();

      if (metricsData.success && usersData.success) {
        setMetrics(metricsData.data);
        setUsers(usersData.data);
      } else {
        throw new Error("Failed to authenticate admin credentials.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/users/role", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole })
      });
      
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error("Failed to mutate role", err);
    }
  };

  const userColumns = [
    { key: "name", label: "Identity" },
    { key: "email", label: "Email Address" },
    { key: "createdAt", label: "Joined", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { 
      key: "role", 
      label: "Platform Role", 
      render: (row) => (
        <select 
          value={row.role}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold focus:border-purple-500 focus:outline-none"
        >
          <option value="organiser">Organiser</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      )
    },
  ];

  if (loading) return <div className="p-8 text-neutral-500">Synchronizing global admin telemetry...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">System Monitoring Workspace</span>
          <h1 className="text-2xl font-bold text-neutral-900 mt-2">Platform Administration</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary" className="px-3 py-1.5 text-xs">← Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <p className="text-xs font-bold text-neutral-400 uppercase">System Throughput</p>
          <p className="text-3xl font-extrabold my-2 text-purple-600">{metrics?.events}</p>
          <p className="text-[11px] text-neutral-500">Total global events registered</p>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <p className="text-xs font-bold text-neutral-400 uppercase">Budget Deviation Index</p>
          <p className="text-3xl font-extrabold my-2 text-green-600">{metrics?.financials?.deviationIndex || '0%'}</p>
          <p className="text-[11px] text-neutral-500">Percentage of budget expended</p>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-neutral-400 uppercase">Registered Users</p>
          <p className="text-3xl font-extrabold my-2 text-blue-600">{metrics?.users}</p>
          <p className="text-[11px] text-neutral-500">Total authenticated identities</p>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-neutral-400 uppercase">3D Engine Telemetry</p>
          <p className="text-3xl font-extrabold my-2 text-amber-600">{metrics?.layouts}</p>
          <p className="text-[11px] text-neutral-500">Trellis layouts generated</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Identity Management Matrix</h2>
        <DataTable columns={userColumns} rows={users} caption="Live platform users" />
      </div>
    </div>
  );
}