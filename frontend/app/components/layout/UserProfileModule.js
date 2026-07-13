// frontend/app/components/layout/UserProfileModule.js
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";

export default function UserProfileModule() {
  const router = useRouter();
  const auth = getAuth(); // Ensure Firebase is initialized in your app core

  const handleSignOut = async () => {
    try {
      // 1. Sign out from Firebase
      await signOut(auth);
      
      // 2. Clear local storage tokens (SSOT cleanup)
      localStorage.removeItem("token");
      localStorage.removeItem("activeEventId");
      
      // 3. Redirect user to the landing page
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out from Firebase:", error);
    }
  };

  return (
    <div className="relative group inline-block">
      
      {/* Trigger: Hover Target */}
      <div 
        className="flex items-center gap-2 cursor-pointer p-1.5 rounded-full hover:bg-neutral-100 transition-colors duration-200"
        aria-label="User menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 uppercase ring-2 ring-transparent group-hover:ring-purple-200 transition-all">
          U
        </div>
      </div>

      {/* Pop-up: Hover Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
        
        {/* Invisible bridge to prevent hover loss when moving mouse from avatar to menu */}
        <div className="absolute -top-4 left-0 h-4 w-full bg-transparent" />
        
        <div className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1.5 flex flex-col gap-1">
          
          {/* 1. Settings Button */}
          <Link 
            href="/settings" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <span aria-hidden="true">⚙️</span> Settings
          </Link>

          {/* Divider */}
          <div className="h-px bg-neutral-100 mx-2 my-0.5" />

          {/* 2. Sign-out Button */}
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 text-left transition-colors w-full"
          >
            <span aria-hidden="true">🚪</span> Sign Out
          </button>
          
        </div>
      </div>
    </div>
  );
}