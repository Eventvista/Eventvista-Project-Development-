// frontend/app/page.js
/**
 * @file frontend/app/page.js
 * @description Highly converted multi-channel landing hero framework for Eventvista.
 * Integrates onboarding funnels, contextual demos, and traditional credential management.
 */

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 font-sans">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl border border-neutral-100">
        
        {/* Left Side: Branding Showcase Billboard Banner */}
        <div className="hidden flex-1 flex-col justify-between bg-purple-50 p-10 lg:flex">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-purple-600" />
            <span className="text-lg font-bold text-neutral-900 tracking-tight">Eventvista</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-neutral-900 leading-tight">
              Plan. Manage.{" "}
              <span className="text-purple-600">Celebrate.</span>
            </h1>
            <p className="text-sm leading-relaxed text-neutral-500">
              Eventvista helps you organise events seamlessly and create
              unforgettable experiences.
            </p>
          </div>
          <div className="mt-8 flex-1 overflow-hidden rounded-2xl shadow-inner bg-white p-2">
            <img
              src="/images/login photo.jpeg"
              alt="Event planning workspace management grid"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Right Side: Direct Interactive Call-to-Actions (CTA) Terminal */}
        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12 bg-white">
          <div className="mx-auto w-full max-w-sm text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-2 tracking-tight">Welcome!</h2>
            <p className="text-sm leading-relaxed text-neutral-500 mb-6">
              The ultimate platform to design layouts, track budgets, and manage guest lists all in one place.
            </p>

            {/* Core Segmented Hero Action Block Container */}
            <div className="mb-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link href="/onboarding" className="flex-1 min-w-[160px]">
                <button className="w-full rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 hover:shadow-purple-700/30 active:scale-[0.98]">
                  Get Started via AI
                </button>
              </Link>
              
              <Link href="/demo" className="flex-1 min-w-[160px]">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-bold text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]">
                  <svg className="h-4 w-4 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Interactive Demo
                </button>
              </Link>
            </div>

            {/* Supplementary Access Options and Fallback Matrix */}
            <div className="space-y-3">
              <Link 
                href="/register" 
                className="flex w-full items-center justify-center rounded-xl bg-neutral-900 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-neutral-800"
              >
                Start Planning for Free
              </Link>

              <Link 
                href="/login" 
                className="flex w-full items-center justify-center rounded-xl border border-neutral-200 py-2.5 text-xs font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50"
              >
                Login to Your Account
              </Link>

              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-neutral-100" />
                <span className="text-[10px] tracking-widest font-black text-neutral-400 uppercase">Legacy Preview</span>
                <div className="flex-1 border-t border-neutral-100" />
              </div>

              {/* Legacy Canvas Workspace Preview Link */}
              <Link 
                href="/designer" 
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-100 bg-purple-50/50 py-2.5 text-xs font-bold text-purple-700 transition-colors duration-200 hover:bg-purple-100/70"
              >
                <span className="text-sm">🎪</span>
                Legacy Designer View
              </Link>
            </div>
            
            <p className="mt-8 text-center text-[11px] font-medium text-neutral-400 tracking-normal">
              © 2026 Eventvista. All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}