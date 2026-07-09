// frontend/app/register/GoogleAuthAndRoleSelect.jsx
import React, { useState } from "react";

/**
 * EventVista — Google Sign-In Button + Role Selection Modal
 * -----------------------------------------------------------
 * Drop these into your Login/Register pages.
 *
 * <GoogleSignInButton onClick={handleGoogleSignIn} />
 *   -> wire onClick to your Firebase signInWithPopup(googleProvider) call.
 *
 * <RoleSelectionModal
 *   open={showRoleModal}
 *   onSelect={(role) => saveRoleToFirestore(role)}
 * />
 *   -> show this only when a new Google user has no role set yet.
 */

// ---------- Google Sign-In Button ----------
export function GoogleSignInButton({ onClick, loading = false, label = "Continue with Google" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200
                 bg-white px-5 py-3 text-slate-800 font-medium text-[15px]
                 shadow-sm transition-all duration-150
                 hover:shadow-md hover:border-slate-300 active:scale-[0.98]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
      ) : (
        <GoogleGlyph />
      )}
      <span>{loading ? "Signing you in…" : label}</span>
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6l6.6 5.4C40.5 36.8 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

// ---------- Role Selection Modal ----------
export function RoleSelectionModal({ open, onSelect, onClose }) {
  const [chosen, setChosen] = useState(null);
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  const roles = [
    {
      id: "organiser",
      title: "Organiser",
      copy: "Plan events and design venues in 3D.",
    },
    {
      id: "vendor",
      title: "Vendor",
      copy: "List your services and get booked for events.",
    },
  ];

  const handleConfirm = async () => {
    if (!chosen) return;
    setConfirming(true);
    await onSelect(chosen);
    setConfirming(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
        <h2 id="role-modal-title" className="text-xl font-semibold text-slate-900">
          One quick thing
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          How will you be using EventVista?
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roles.map((role) => {
            const selected = chosen === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setChosen(role.id)}
                aria-pressed={selected}
                className={`text-left rounded-xl border-2 p-4 transition-all duration-150
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                  ${selected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className="font-medium text-slate-900">{role.title}</div>
                <div className="mt-1 text-xs text-slate-500">{role.copy}</div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!chosen || confirming}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white
                     transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {confirming ? "Saving…" : "Continue"}
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">
          You can't skip this step — we need it to set up your dashboard.
        </p>
      </div>
    </div>
  );
}