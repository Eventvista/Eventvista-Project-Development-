// frontend/app/register/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleSignInButton, RoleSelectionModal } from "../components/GoogleAuthAndRoleSelect";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "organiser" });
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
        window.location.href = "/dashboard?status=new";
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to the verification environment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchDemo = () => {
    // Demo workflow mapping: locks state markers to the user profile "John" populated with baseline parameters
    localStorage.setItem("demoMode", "true");
    localStorage.setItem("userEmail", "john.demo@eventvista.com");
    window.location.href = "/dashboard?mode=sandbox_demo";
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
          <div className="mt-8 flex-1 overflow-hidden rounded-xl">
            <img src="/images/registration photo.jpeg" alt="Event celebration" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Create Your Account</h2>
            <p className="text-sm text-neutral-500 mt-1">Fill in the details below to get started</p>

            <button 
              type="button" 
              onClick={handleLaunchDemo}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white py-3 text-sm font-bold shadow-md transition-all duration-150"
            >
              🚀 Explore System Demo (John Setup)
            </button>

            <div className="relative flex items-center gap-3 py-4">
              <div className="flex-1 border-t border-neutral-200" />
              <span className="text-xs text-neutral-400">OR STANDARD SIGN UP</span>
              <div className="flex-1 border-t border-neutral-200" />
            </div>

            {error && <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" required className="w-full rounded-lg border border-neutral-200 py-2.5 px-3 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email" required className="w-full rounded-lg border border-neutral-200 py-2.5 px-3 text-sm focus:outline-none" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700">
                {isLoading ? "CREATING ACCOUNT..." : "REGISTER"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}