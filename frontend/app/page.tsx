// frontend/app/page.js
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 font-sans">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-floating">
        
        {/* Left side - Branding & Image (Carried over from your design) */}
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

        {/* Right side - Landing Actions */}
        <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm text-center lg:text-left">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome!</h2>
            <p className="text-sm text-neutral-500 mb-8">
              The ultimate platform to design layouts, track budgets, and manage guest lists all in one place.
            </p>

            <div className="space-y-4">
              {/* Registration CTA */}
              <Link 
                href="/register" 
                className="flex w-full items-center justify-center rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-700 shadow-md"
              >
                Start Planning for Free
              </Link>

              {/* Login CTA */}
              <Link 
                href="/login" 
                className="flex w-full items-center justify-center rounded-lg border border-neutral-200 py-3 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50"
              >
                Login to Your Account
              </Link>

              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400">EXPLORE</span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>

              {/* Designer Demo CTA */}
              <Link 
                href="/designer" 
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 py-3 text-sm font-semibold text-purple-700 transition-colors duration-200 hover:bg-purple-100"
              >
                <span className="text-lg">🎪</span>
                Try the Designer Demo
              </Link>
            </div>
            
            <p className="mt-8 text-center text-xs text-neutral-400">
              © 2026 Eventvista. All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}