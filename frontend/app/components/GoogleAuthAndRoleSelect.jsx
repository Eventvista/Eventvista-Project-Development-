// frontend/app/components/GoogleAuthAndRoleSelect.jsx
/**
 * @file frontend/app/components/GoogleAuthAndRoleSelect.jsx
 * @description Production-grade authentication component kit for Eventvista.
 * Completely cleanses legacy in-memory and localStorage alpha-testing mocks[cite: 1].
 * Enforces real Single Source of Truth (SSOT) client interactions with Firebase and MongoDB[cite: 1].
 */

"use client";

import React, { useState } from "react";

// =========================================================================
// SECTION 1: GLOBAL BRANDED AUTHENTICATION UI
// =========================================================================

/**
 * @component GoogleSignInButton
 * @description Standardized, high-fidelity Google OAuth button conforming to corporate guidelines.
 * Features built-in micro-interactions, disabled states, loading vectors, and accessible ARIA labels.
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Direct callback launching real identity provider handshakes.
 * @param {boolean} [props.loading=false] - Blocks multi-click registration thread duplication.
 * @param {string} [props.label="Continue with Google"] - Contextual button action text.
 */
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

// =========================================================================
// SECTION 2: METADATA CAPTURE & ACCOUNT PROVISIONING MODAL
// =========================================================================

/**
 * @component RoleSelectionModal
 * @description Collects necessary structural attributes (Roles and commercial contexts).
 * This data is sent to the backend database via authClient profiles immediately following new social logins.
 * 
 * @param {Object} props
 * @param {boolean} props.open - State-driven display parameter toggling layout overlay.
 * @param {Function} props.onSelect - Dispatches captured state values to parent profile serialization trees.
 */
export function RoleSelectionModal({ open, onSelect }) {
  const [chosen, setChosen] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const roles = [
    { id: "organiser", title: "Organiser", copy: "Plan events and design venues in 3D." },
    { id: "vendor", title: "Vendor", copy: "List your services and get booked for events." },
  ];

  /**
   * Evaluates input constraints before executing the registration handshake.
   */
  const handleConfirm = async () => {
    if (!chosen) return;

    // FIX: Client validation preventing the creation of invalid vendor records in MongoDB[cite: 1, 3]
    if (chosen === "vendor" && !businessName.trim()) {
      setError("Business name is required for vendor accounts.");
      return;
    }

    setError("");
    setConfirming(true);
    
    try {
      // Dispatches metadata back to the master page context handler
      await onSelect(chosen, businessName.trim() || undefined);
    } catch (err) {
      setError(err.message || "Could not save your profile. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm px-4" 
      role="dialog" 
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
        <h2 className="text-xl font-semibold text-neutral-900">One quick thing</h2>
        <p className="mt-1 text-sm text-neutral-500">How will you be using Eventvista?</p>

        {/* Role Matrix Grid */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roles.map((role) => {
            const selected = chosen === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setChosen(role.id);
                  setError(""); // Reset any prior validation warnings
                }}
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

        {/* 
          PROGRESSIVE DISCLOSURE UI BLOCK
          FIX: Explicitly reveals the commercial trade name text field only when 
          the vendor role is active, keeping the interface focused and concise[cite: 1].
        */}
        {chosen === "vendor" && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <label htmlFor="businessNameInput" className="sr-only">Business Name</label>
            <input
              id="businessNameInput"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business name"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
        )}

        {/* Dynamic Client Exception Messaging Banner */}
        {error && <p className="mt-3 text-xs text-red-600" aria-live="polite">{error}</p>}

        {/* Master Action Trigger */}
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
