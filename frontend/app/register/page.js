"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleSignInButton, RoleSelectionModal } from "./GoogleAuthAndRoleSelect";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = "/dashboard";
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    // TODO (John): real signInWithPopup(auth, googleProvider) call goes here,
    // then check Firestore — if user has no role yet, open the modal.
    setGoogleLoading(false);
    setShowRoleModal(true); // temporary, until John's real check replaces this
  };

  const handleRoleSelect = async (role) => {
    // TODO (John): write `role` to this user's Firestore doc
    setShowRoleModal(false);
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-floating">

        {/* Left side */}
        <div className="hidden flex-1 flex-col justify-between bg-purple-50 p-10 lg:flex">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-purple-600" />
            <span className="text-lg font-bold text-neutral-900">Eventvista</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Plan. Manage.{" "}
              <span className="text-purple-600">Celebrate.</span>
            </h1>
            <p className="mt-3 text-sm text-neutral-500">
              Eventvista helps you organise events seamlessly and create
              unforgettable experiences.
            </p>
          </div>
         <div className="mt-8 flex-1 overflow-hidden rounded-2xl">
  <img
    src="/images/login photo.jpeg"
    alt="Event planning"
    className="w-full h-full object-contain"
  />
</div>
        </div>

        {/* Right side */}
        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-neutral-900">Welcome Back!</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in to continue to your account
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    ✉
                  </span>
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
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    🔒
                  </span>
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
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-neutral-300 accent-purple-600"
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-purple-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-700"
              >
                LOGIN
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400">OR</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />

              <p className="text-center text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-purple-600 hover:underline">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
          {/*
          <p className="mt-8 text-center text-xs text-neutral-400">
            2024 Eventvista. All rights reserved.
          </p>
*/}
        </div>
      </div>

      <RoleSelectionModal open={showRoleModal} onSelect={handleRoleSelect} />
    </div>
  );
}