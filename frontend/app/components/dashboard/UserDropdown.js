// frontend/components/dashboard/UserDropdown.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth, signOut } from "firebase/auth";
import app from "@/config/firebaseClient"; // Ensure your client-side firebase initialization is imported

export default function UserDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const auth = getAuth(app);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      // 1. Sign out of Firebase Identity Session (Google Auth)
      if (auth.currentUser) {
        await signOut(auth);
      }
      // 2. Wipe authorization token signatures from storage
      localStorage.removeItem("token");
      
      // 3. Force-route back to the public landing layout
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Authentication separation fault:", error);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative inline-block text-left"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Area containing the structural sketch detailing user details */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white p-1.5 pr-4 transition-all duration-200 hover:border-purple-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow-inner">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-neutral-800 truncate max-w-[120px]">
            {user?.name || "Workspace Profile"}
          </p>
          <p className="text-[10px] text-neutral-400 capitalize truncate">
            {user?.role || "Organiser"}
          </p>
        </div>
      </button>

      {/* Dynamic Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 origin-top-right rounded-xl border border-neutral-100 bg-white p-1 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link href="/settings" className="block">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-purple-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account Settings
            </button>
          </Link>
          
          <div className="my-1 border-t border-neutral-100" />
          
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}