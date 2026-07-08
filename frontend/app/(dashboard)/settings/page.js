// frontend/app/(dashboard)/settings/page.js
"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Simon",
    email: "john@gmail.com",
    phone: "0712242544",
    role: "Client",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    guestUpdates: true,
    vendorUpdates: true,
    budgetAlerts: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>

      {/* Profile Settings */}
      <Card>
        <h2 className="mb-4 text-base font-semibold text-neutral-900">
          Profile Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-700">
              {profile.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">{profile.name}</p>
              <p className="text-xs text-neutral-500">{profile.role}</p>
              <button className="mt-1 text-xs font-medium text-purple-600 hover:underline">
                Change Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Role
              </label>
              <select
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              >
                <option>Client</option>
                <option>Event Planner</option>
                <option>Vendor</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="mb-4 text-base font-semibold text-neutral-900">
          Notifications
        </h2>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-800 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !value })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  value ? "bg-purple-600" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Password Settings */}
      <Card>
        <h2 className="mb-4 text-base font-semibold text-neutral-900">
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>
          {saved ? "Saved! ✓" : "Save Changes"}
        </Button>
        {saved && (
          <p className="text-sm font-medium text-green-500">
            Settings saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}