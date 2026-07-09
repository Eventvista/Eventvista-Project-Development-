// frontend/app/login/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleSignInButton, RoleSelectionModal, AlphaTestingDashboard } from "../components/GoogleAuthAndRoleSelect";

const ALPHA_TESTERS = [
  "kariukilewis04@gmail.com",
  "johnsimonwafula@gmail.com",
  "muttasheky@gmail.com",
  "giddyoseko35@gmail.com"
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [authenticatedEmail, setAuthenticatedEmail] = useState("");
  const [showAlphaModule, setShowAlphaModule] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        
        if (ALPHA_TESTERS.includes(email.toLowerCase())) {
          setAuthenticatedEmail(email.toLowerCase());
          setShowAlphaModule(true);
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to the system database server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Direct integration checkpoint mimicking the Firebase Google Authentication pop-up process
      setTimeout(async () => {
        const dummyEmail = "johnsimonwafula@gmail.com"; 
        setAuthenticatedEmail(dummyEmail);
        localStorage.setItem("userEmail", dummyEmail);

        if (ALPHA_TESTERS.includes(dummyEmail.toLowerCase())) {
          setGoogleLoading(false);
          setShowAlphaModule(true);
          return;
        }

        // Standard user lifecycle check against the centralized database architecture
        const databaseCheck = await fetch(`/api/v1/auth/check-user?email=${dummyEmail}`);
        const userStatus = await databaseCheck.json();

        setGoogleLoading(false);
        if (userStatus.isExistingUser) {
          localStorage.setItem("token", userStatus.token);
          window.location.href = "/dashboard?projectContext=existing";
        } else {
          setShowRoleModal(true);
        }
      }, 1200);
    } catch (err) {
      setError("Authentication lifecycle error occurred via Google Provider.");
      setGoogleLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    setShowRoleModal(false);
    // Persist completely new baseline data mapping for pristine users
    window.location.href = `/dashboard?status=new&assignedRole=${role}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        
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
            <img src="/images/login photo.jpeg" alt="Event planning" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Welcome Back!</h2>
            <p className="mt-1 text-sm text-neutral-500">Sign in to continue to your account</p>

            {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-neutral-300 accent-purple-600" />
                  Remember Me
                </label>
                <button type="button" className="text-sm font-medium text-purple-600 hover:underline">Forgot Password?</button>
              </div>

              <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-70">
                {isLoading ? "LOGGING IN..." : "LOGIN"}
              </button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400">OR</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />

              <p className="text-center text-sm text-neutral-500 mt-4">
                Don&apos;t have an account? <Link href="/register" className="font-semibold text-purple-600 hover:underline">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <RoleSelectionModal open={showRoleModal} onSelect={handleRoleSelect} />
      
      {showAlphaModule && (
        <AlphaTestingDashboard email={authenticatedEmail} onClose={() => setShowAlphaModule(false)} />
      )}
    </div>
  );
}