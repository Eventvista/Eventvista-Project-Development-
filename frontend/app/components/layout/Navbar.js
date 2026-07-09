// frontend/components/layout/Navbar.js
"use client";

import { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";

export default function Navbar({ user = { name: "John Simon", role: "Client" } }) {
  const { toggleMobileNav } = useSidebar();
  const [searchValue, setSearchValue] = useState("");

  const handleSignOutProcess = () => {
    // Safely clear core application tokens to kill user authentication scope across layouts
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("demoMode");
    window.location.href = "/";
  };

  return (
    <header role="banner" className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <button type="button" onClick={toggleMobileNav} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 lg:hidden">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" /></svg>
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </span>
          <div className="hidden text-left leading-tight md:block mr-2">
            <p className="text-sm font-semibold text-neutral-800">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOutProcess}
          className="rounded-lg bg-red-50 border border-red-200 text-red-600 font-semibold px-3 py-1.5 text-xs transition-colors hover:bg-red-100"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}