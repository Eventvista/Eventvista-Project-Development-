// frontend/app/components/GoogleAuthAndRoleSelect.jsx
"use client";

import React, { useState } from "react";

// In-memory or localStorage simulation of Firebase Google Authentication state for current branch integration
const mockFirebaseGoogleAuth = async () => {
  return new Promise((resolve) => setTimeout(() => {
    // Modify this return object during local alpha testing to test various user routing scenarios
    resolve({ email: "johnsimonwafula@gmail.com", name: "John Simon" });
  }, 1000));
};

export function GoogleSignInButton({ onClick, loading = false, label = "Continue with Google" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-200
                 bg-white px-5 py-3 text-neutral-800 font-medium text-[15px]
                 shadow-sm transition-all duration-150
                 hover:shadow-md hover:border-neutral-300 active:scale-[0.98]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500
                 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="h-5 w-5 rounded-full border-2 border-neutral-300 border-t-purple-600 animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6l6.6 5.4C40.5 36.8 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
      )}
      <span>{loading ? "Signing you in…" : label}</span>
    </button>
  );
}

export function AlphaTestingDashboard({ email, onClose }) {
  const modules = [
    { name: "Organiser Dashboard Workspace", route: "/dashboard?role=organiser" },
    { name: "Vendor Management Terminal", route: "/vendors" },
    { name: "3D Spatial Layout Designer Engine", route: "/designer" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-md px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 border border-purple-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
          <div>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold uppercase px-3 py-1 rounded-full">Alpha Test Mode</span>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">Welcome Project Member</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Active Session Identifier: {email}</p>
          </div>
        </div>
        
        <p className="text-sm text-neutral-600 mb-6">
          Your credentials grant access to specialized systems modules. Use the links below to test sandbox routing parameters.
        </p>

        <div className="space-y-3 mb-6">
          {modules.map((mod, index) => (
            <button
              key={index}
              onClick={() => { window.location.href = mod.route; }}
              className="w-full flex items-center justify-between border border-neutral-200 rounded-xl p-4 text-left transition-all hover:bg-purple-50 hover:border-purple-300"
            >
              <span className="font-semibold text-neutral-800 text-sm">{mod.name}</span>
              <span className="text-purple-600 text-sm font-medium">Launch →</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { window.location.href = "/admin"; }}
            className="flex-1 bg-neutral-900 text-white text-sm font-bold py-3.5 rounded-xl transition-colors hover:bg-neutral-800 text-center"
          >
            Access System Analytics (Admin)
          </button>
          <button
            onClick={onClose}
            className="border border-neutral-200 text-neutral-600 text-sm font-medium px-5 rounded-xl transition-colors hover:bg-neutral-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoleSelectionModal({ open, onSelect }) {
  const [chosen, setChosen] = useState(null);
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  const roles = [
    { id: "organiser", title: "Organiser", copy: "Plan events and design venues in 3D." },
    { id: "vendor", title: "Vendor", copy: "List your services and get booked for events." },
  ];

  const handleConfirm = async () => {
    if (!chosen) return;
    setConfirming(true);
    await onSelect(chosen);
    setConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
        <h2 className="text-xl font-semibold text-neutral-900">One quick thing</h2>
        <p className="mt-1 text-sm text-neutral-500">How will you be using Eventvista?</p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roles.map((role) => {
            const selected = chosen === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setChosen(role.id)}
                className={`text-left rounded-xl border-2 p-4 transition-all duration-150 ${
                  selected ? "border-purple-600 bg-purple-50" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="font-medium text-neutral-900">{role.title}</div>
                <div className="mt-1 text-xs text-neutral-500">{role.copy}</div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!chosen || confirming}
          className="mt-6 w-full rounded-xl bg-purple-600 px-5 py-3 font-medium text-white transition-all duration-150 hover:bg-purple-700 disabled:opacity-50"
        >
          {confirming ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}