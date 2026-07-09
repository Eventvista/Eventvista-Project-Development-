// frontend/app/login/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleSignInButton, RoleSelectionModal } from "../components/GoogleAuthAndRoleSelect";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        window.location.href = "/hub";
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to reach server architecture.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      setShowRoleModal(true);
    }, 1000);
  };

  const handleRoleSelect = async (role) => {
    setShowRoleModal(false);
    window.location.href = "/hub";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="hidden flex-1 flex-col justify-between bg-purple-50 p-10 lg:flex">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-purple-600" />
            <span className="text-lg font-bold text-neutral-900">Eventvista</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Plan. Manage. <span className="text-purple-600">Celebrate.</span>
            </h1>
            <p className="mt-3 text-sm text-neutral-500">
              Seamless infrastructure for modern venue generation and event analytics.
            </p>
          </div>
          <div className="mt-8 flex-1 overflow-hidden rounded-2xl bg-neutral-100">
            <div className="w-full h-full bg-gradient-to-tr from-purple-200 to-indigo-100 flex items-center justify-center text-neutral-400">Secure Vault Portal</div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Welcome Back!</h2>
            <p className="mt-1 text-sm text-neutral-500">Sign in to manage your system workspace</p>

            {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full rounded-lg border border-neutral-200 py-2.5 px-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-3 pr-10 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-neutral-300 accent-purple-600"
                  />
                  Remember System Identity
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-700 disabled:opacity-70"
              >
                {isLoading ? "AUTHENTICATING..." : "LOG IN"}
              </button>

              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400">OR</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />

              <p className="text-center text-sm text-neutral-500 mt-4">
                New to the platform?{" "}
                <Link href="/register" className="font-semibold text-purple-600 hover:underline">Register Hub Account</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <RoleSelectionModal open={showRoleModal} onSelect={handleRoleSelect} />
    </div>
  );
}