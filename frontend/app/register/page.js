// frontend/app/register/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
// FIXED: Updated import path pointing to the shared components directory
import { GoogleSignInButton, RoleSelectionModal } from "../components/GoogleAuthAndRoleSelect";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "organiser",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      setShowRoleModal(true);
    }, 800);
  };

  const handleRoleSelect = async (role) => {
    setForm((prev) => ({ ...prev, role }));
    setShowRoleModal(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        
        {/* Left Side Branding Graphic */}
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
              Eventvista helps you organise events seamlessly and create unforgettable experiences.
            </p>
          </div>
          <div className="mt-8 flex-1 overflow-hidden rounded-xl">
            <img src="/images/registration photo.jpeg" alt="Event celebration" className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Right Side Form Workspace */}
        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Create Your Account</h2>
            <p className="mt-1 text-sm text-neutral-500">Fill in the details below to get started</p>

            {error && <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">👤</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">✉</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Role</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">⚙️</span>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-white rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 appearance-none"
                  >
                    <option value="organiser">Organiser</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-10 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 select-none text-base"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-700 disabled:opacity-70 mt-2"
              >
                {isLoading ? "CREATING ACCOUNT..." : "REGISTER"}
              </button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400">OR</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />

              <p className="text-center text-sm text-neutral-500 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-purple-600 hover:underline">Sign In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <RoleSelectionModal open={showRoleModal} onSelect={handleRoleSelect} />
    </div>
  );
}