// frontend/app/page.js
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-purple-600" />
          <span className="text-xl font-bold text-neutral-900">Eventvista</span>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-neutral-900 tracking-tight">
          Plan. Manage. <span className="text-purple-600">Celebrate.</span>
        </h1>
        <p className="mt-6 text-lg text-neutral-500 max-w-2xl">
          Eventvista is the ultimate platform for organisers to design layouts, track budgets, and manage guest lists all in one place. 
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/register" 
            className="px-8 py-3 text-base font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Planning for Free
          </Link>
          <Link 
            href="/designer" 
            className="px-8 py-3 text-base font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all"
          >
            Try the Designer
          </Link>
        </div>
      </main>
    </div>
  );
}