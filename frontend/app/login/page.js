// frontend/app/login/page.js
/**
 * @file frontend/app/login/page.js
 * @description Central authentication routing portal for Eventvista.
 * Integrates classic identity credential challenges with explicit live Firebase
 * Google Auth provider popups, redirect recovery layers, and backend profile verification checks.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleSignInButton, RoleSelectionModal } from "../components/GoogleAuthAndRoleSelect";
import { signInWithGoogle, completeProfile, handleRedirectCallback } from "../lib/authClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Retained static testing index for local alpha developer access routing
const ALPHA_TESTERS = [
  "kariukilewis04@gmail.com",
  "johnsimonwafula@gmail.com",
  "muttasheky@gmail.com",
  "giddyoseko35@gmail.com"
];

export default function LoginPage() {
  const router = useRouter();

  // Unified State Engine
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState(null);
  
  // Alpha state hooks preserved for internal diagnostic modules
  const [authenticatedEmail, setAuthenticatedEmail] = useState("");
  const [showAlphaModule, setShowAlphaModule] = useState(false);

  // =========================================================================
  // SECTION 1: REDIRECT RECOVERY MONITORING (ON-MOUNT CYCLE)
  // =========================================================================
  /**
   * Catches user context upon returning to the app from a Google redirect flow.
   * Resolves authentication pipelines for security-restricted environments[cite: 17].
   */
  useEffect(() => {
    const verifyRedirectRecovery = async () => {
      setGoogleLoading(true);
      setError("");
      try {
        const result = await handleRedirectCallback();
        if (!result) return; // No active redirect sequence in progress[cite: 17]

        const userEmailLower = result.email?.toLowerCase() || "";

        if (result.isNewUser) {
          // Pristine registration state: Hold validation token and ask for platform role[cite: 17]
          setPendingIdToken(result.idToken);
          setShowRoleModal(true);
        } else {
          // Existing user instance verified via backend database schema
          if (ALPHA_TESTERS.includes(userEmailLower)) {
            setAuthenticatedEmail(userEmailLower);
            setShowAlphaModule(true);
          } else {
            router.push("/dashboard"); // Safe, seamless navigation inside client dashboard[cite: 17]
          }
        }
      } catch (err) {
        console.error("Google cross-origin redirect verification failure:", err);
        setError(err.message || "Failed to recover authentic session with the server[cite: 17].");
      } finally {
        setGoogleLoading(false);
      }
    };

    verifyRedirectRecovery();
  }, [router]);

  // =========================================================================
  // SECTION 2: TRADITIONAL EMAIL / PASSWORD SECURITY CHALLENGE
  // =========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.data.email || email);
        localStorage.setItem("userRole", data.data.role);

        // Alpha testing gateway bypass toggle condition
        if (ALPHA_TESTERS.includes((data.data.email || email).toLowerCase())) {
          setAuthenticatedEmail((data.data.email || email).toLowerCase());
          setShowAlphaModule(true);
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Invalid credentials provided.");
      }
    } catch (err) {
      setError("Could not reach the Eventvista system database server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // SECTION 3: FIREBASE FEDERATED GOOGLE POPUP CHECKPOINT (SSOT LINK)
  // =========================================================================
  /**
   * Spawns identity popups and triggers fallback redirects on restricted browsers[cite: 11, 17].
   * Defers new-vs-returning validation natively to MongoDB[cite: 17].
   */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithGoogle();
      if (!result) return; // Halt execution if transferring to a redirect flow[cite: 17]

      const userEmailLower = result.email?.toLowerCase() || "";

      if (result.isNewUser) {
        // Pristine registration state: Hold validation token and request role[cite: 17]
        setPendingIdToken(result.idToken);
        setShowRoleModal(true);
      } else {
        // Existing user instance verified via backend aggregation logic[cite: 17]
        if (ALPHA_TESTERS.includes(userEmailLower)) {
          setAuthenticatedEmail(userEmailLower);
          setShowAlphaModule(true);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("Google cross-origin sign-in verification failure:", err);
      setError(err.message || "Google authentication lifecycle was cancelled or failed via the Provider.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // =========================================================================
  // SECTION 4: NEW USER ROLE SELECTION & ADVISOR ONBOARDING FORWARDING
  // =========================================================================
  /**
   * Handles profile finalization for brand-new authenticated sessions[cite: 17].
   * Routes first-time signups smoothly through the AI Advisor onboarding pipeline[cite: 17].
   */
  const handleRoleSelect = async (role, businessName) => {
    try {
      setError("");
      await completeProfile({
        idToken: pendingIdToken,
        role,
        businessName,
      });
      
      setShowRoleModal(false);
      
      // Send first-time registrations to build their first event project context before hitting dashboard[cite: 17]
      router.push("/onboarding");
    } catch (err) {
      console.error("Profile completion processing issue:", err);
      setError(err.message || "Could not save your account structural role configuration profile.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Informational Splash Sidebar Panel - Hidden on Mobile viewports */}
        <div className="hidden flex-1 flex-col justify-between bg-purple-50 p-10 lg:flex">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-purple-600" />
            <span className="text-lg font-bold text-neutral-900">Eventvista</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Plan. Manage. <span className="text-purple-600">Celebrate.</span></h1>
            <p className="mt-3 text-sm text-neutral-500">Eventvista helps you organise events seamlessly and create unforgettable experiences.</p>
          </div>
          <div className="mt-8 flex-1 overflow-hidden rounded-2xl">
            <img src="/images/login photo.jpeg" alt="Event planning layout matrix" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Active Interaction Form Inputs Control Region */}
        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Welcome Back!</h2>
            <p className="mt-1 text-sm text-neutral-500">Sign in to continue to your account</p>

            {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 animate-fade-in" aria-live="polite">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-10 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-neutral-300 accent-purple-600" />
                  Remember Me
                </label>
                <button type="button" className="text-sm font-medium text-purple-600 hover:underline">Forgot Password?</button>
              </div>

              <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? "LOGGING IN..." : "LOGIN"}
              </button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400 select-none">OR</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              {/* Federated Identity Authentication Component Triggers */}
              <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />

              <p className="text-center text-sm text-neutral-500 mt-4">
                Don&apos;t have an account? <Link href="/register" className="font-semibold text-purple-600 hover:underline">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Role Collection Modal Overlay Engine for first-time signups[cite: 17] */}
      <RoleSelectionModal open={showRoleModal} onSelect={handleRoleSelect} />
      
      {/* Alpha testing panel re-injection module */}
      {showAlphaModule && (
        <AlphaTestingDashboard email={authenticatedEmail} onClose={() => setShowAlphaModule(false)} />
      )}
    </div>
  );
}

// =========================================================================
// SECTION 5: ALPHA TESTING DIAGNOSTIC ACCESS MODULE
// =========================================================================
/**
 * Internal diagnostics framework bypassed during baseline user redirection.
 */
function AlphaTestingDashboard({ email, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100">
        <h3 className="text-lg font-bold text-neutral-900">Alpha Diagnostics Platform</h3>
        <p className="mt-2 text-sm text-neutral-500">
          You have authenticated successfully as alpha tester: <strong className="text-purple-600">{email}</strong>
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button 
            onClick={() => { window.location.href = "/dashboard"; }}
            className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Proceed to App Dashboard
          </button>
          <button 
            onClick={onClose}
            className="w-full rounded-lg border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}