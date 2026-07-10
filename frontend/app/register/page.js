// frontend/app/register/page.js
/**
 * @file frontend/app/register/page.js
 * @description Native registration account generation layout for Eventvista.
 * Features structural form hooks linked directly to backend schema validation, 
 * Federated Google Identity onboarding, and automatic dynamic viewport updates.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleSignInButton, RoleSelectionModal } from "../components/GoogleAuthAndRoleSelect";
import { signInWithGoogle, completeProfile } from "../lib/authClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function RegisterPage() {
  // Form hooks initialized to prevent backend validation omissions ("Primary fields are required")
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "organiser", 
    businessName: "" 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState(null);

  // =========================================================================
  // SECTION 1: STANDARD USER FORM SUBMISSION HANDLER
  // =========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.data.email);
        localStorage.setItem("userRole", data.data.role);
        
        // Push newly registered standard accounts to the guided onboarding setup
        window.location.href = "/onboarding";
      } else {
        setError(data.message || "Registration failed. Please evaluate form elements.");
      }
    } catch (err) {
      setError("Could not reach the Eventvista server. Please verify your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // SECTION 2: FEDERATED GOOGLE ACCREDITATION HANDLER
  // =========================================================================
  /**
   * Spawns an explicit auth challenge window. Pristine profiles receive 
   * a role selection requirement modal before finalizing system persistence hooks.
   */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithGoogle();
      if (result.isNewUser) {
        setPendingIdToken(result.idToken);
        setShowRoleModal(true);
      } else {
        // Hydrated structural documents return directly to the primary landing workspace
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.message || "Google sign-in was cancelled or failed via the Provider.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRoleSelect = async (role, businessName) => {
    try {
      setError("");
      await completeProfile({ idToken: pendingIdToken, role, businessName });
      setShowRoleModal(false);
      window.location.href = "/onboarding";
    } catch (err) {
      setError(err.message || "Could not finalize structural role profiles.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Informational Splash Panel Viewports - Collapsed on Mobile viewports */}
        <div className="hidden flex-1 flex-col justify-between bg-purple-50 p-10 lg:flex">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-purple-600" />
            <span className="text-lg font-bold text-neutral-900">Eventvista</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Plan. Manage. <span className="text-purple-600">Celebrate.</span></h1>
            <p className="mt-3 text-sm text-neutral-500">Eventvista helps you organise events seamlessly and create unforgettable experiences.</p>
          </div>
          <div className="mt-8 flex-1 overflow-hidden rounded-xl">
            <img src="/images/registration photo.jpeg" alt="Event celebration crowd grid" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Dynamic Multi-Input Interactive Registration Interface Form */}
        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Create Your Account</h2>
            <p className="text-sm text-neutral-500 mt-1">Fill in the details below to get started</p>

            {error && <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 animate-fade-in" aria-live="polite">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Full Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="Enter full name" 
                  required 
                  className="w-full rounded-lg border border-neutral-200 py-2.5 px-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Email Address</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  placeholder="Enter email" 
                  required 
                  className="w-full rounded-lg border border-neutral-200 py-2.5 px-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    placeholder="At least 8 characters" 
                    required 
                    minLength={8} 
                    className="w-full rounded-lg border border-neutral-200 py-2.5 px-3 pr-10 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {["organiser", "vendor"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r, businessName: r === "organiser" ? "" : form.businessName })}
                      className={`rounded-lg border-2 py-2 text-sm font-medium capitalize transition-all ${form.role === r ? "border-purple-600 bg-purple-50 text-purple-700" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {form.role === "vendor" && (
                <div className="animate-fade-in">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Business Name</label>
                  <input 
                    type="text" 
                    value={form.businessName} 
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })} 
                    placeholder="Your company name" 
                    required 
                    className="w-full rounded-lg border border-neutral-200 py-2.5 px-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "CREATING ACCOUNT..." : "REGISTER"}
              </button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400 select-none">OR</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              {/* Secure Firebase Google Sign-In Entrypoint Component */}
              <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} label="Sign up with Google" />

              <p className="text-center text-sm text-neutral-500 mt-2">
                Already have an account? <Link href="/login" className="font-semibold text-purple-600 hover:underline">Log In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Federated Sign Up Account Specific Metadata Modal Selection */}
      <RoleSelectionModal open={showRoleModal} onSelect={handleRoleSelect} />
    </div>
  );
}