// frontend/components/layout/Navbar.js
/**
 * @file frontend/components/layout/Navbar.js
 * @description Production-grade global application navigation header for Eventvista.
 * Features asynchronous authenticated state synchronization via backend user endpoints,
 * dynamic responsive rendering, and an identity profile dropdown for settings and session teardown.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { signOutUser } from "@/app/lib/authClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function Navbar() {
  const { toggleMobileNav } = useSidebar();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // =========================================================================
  // SECTION 1: AUTHENTICATED PROFILE LIFECYCLE SYNCHRONIZATION
  // =========================================================================
  useEffect(() => {
    async function fetchUserProfile() {
      const token = localStorage.getItem("token");
      
      // If no session token resides in local storage, do not render user identity details
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const body = await res.json();
        if (res.ok && body.success) {
          setUser(body.data);
        } else {
          // Token is likely malformed or expired; clean up invalid cached state smoothly
          console.warn("Session validation failed. Clearing local storage token.");
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
        }
      } catch (err) {
        console.error("Failed to synchronize Navbar profile metrics with server:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  // =========================================================================
  // SECTION 2: DISMISSAL CLICK LISTENERS (OUTSIDE DROPDOWN DETECTION)
  // =========================================================================
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // =========================================================================
  // SECTION 3: SESSION DEPRECATION PROCESSOR
  // =========================================================================
  const handleSignOutProcess = async () => {
    try {
      // Execute contextual core signout sequence
      await signOutUser();
    } catch (err) {
      console.error("Firebase contextual logout threw an exception, clearing token manually:", err);
    } finally {
      // Clear all local session parameters to maintain SSOT integrity
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      
      // Force clean redirect to application home landing page
      window.location.href = "/";
    }
  };

  // Helper utility to generate initials from a name safely
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header role="banner" className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      
      {/* Mobile Drawer Trigger */}
      <button 
        type="button" 
        onClick={toggleMobileNav} 
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 lg:hidden"
        aria-label="Toggle navigation view menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Right-Aligned Identity Block Area */}
      <div className="ml-auto flex items-center gap-4">
        
        {isLoading ? (
          // Content placeholder shell while network profile request finishes
          <div className="h-9 w-28 animate-pulse rounded-full bg-neutral-100" />
        ) : user ? (
          
          /* Interactive User Chip Component with Dropdown Menu */
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-purple-100"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                {getInitials(user.name)}
              </span>
              <div className="hidden text-left leading-tight md:block mr-1">
                <p className="text-sm font-semibold text-neutral-800">{user.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
              </div>
              <svg 
                className={`hidden h-4 w-4 text-neutral-400 transition-transform md:block ${dropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Contextual Action Dropdown Overlay Card */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-neutral-200 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-neutral-100 md:hidden">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{user.name}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                </div>
                
                <Link
                  href="/settings"
                  className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 rounded-lg transition-colors hover:bg-neutral-50 hover:text-purple-600"
                  onClick={() => setDropdownOpen(false)}
                >
                  ⚙️ <span className="ml-2">Settings</span>
                </Link>
                
                <hr className="my-1 border-neutral-100" />
                
                <button
                  type="button"
                  onClick={handleSignOutProcess}
                  className="flex w-full items-center px-3 py-2 text-sm text-red-600 font-medium rounded-lg transition-colors hover:bg-red-50 text-left"
                >
                  🚪 <span className="ml-2">Sign Out</span>
                </button>
              </div>
            )}
          </div>

        ) : (
          /* Unauthenticated/Public Access State Layout View */
          <div className="flex gap-2">
            <Link href="/login" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">
              Log In
            </Link>
            <Link href="/register" className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors">
              Sign Up
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}