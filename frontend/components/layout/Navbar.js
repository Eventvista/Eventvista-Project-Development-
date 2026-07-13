// frontend/components/layout/Navbar.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const { toggleMobileNav } = useSidebar();
  const router = useRouter();

  // Core State Engine (Single Source of Truth)
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  // Notification Architecture States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // 1. Session Rehydration & Sandbox Environment Interception
  useEffect(() => {
    const initializeSessionContext = async () => {
      const demoState = localStorage.getItem("eventvista_demo_mode") === "true";
      setIsDemo(demoState);

      if (demoState) {
        // Populate local state instantly with sandboxed mock credentials
        setUser({ 
          name: "Demo Planner", 
          role: "organiser", 
          email: "demo@eventvista.sandbox" 
        });
        setLoading(false);
      } else {
        // Rehydrate a standard live user session from the MongoDB instance
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const res = await fetch("/api/v1/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.success) {
            setUser(json.data);
          }
        } catch (error) {
          console.error("SSOT client data layer synchronization failed:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeSessionContext();
  }, []);

  // 2. Dual-Mode Notification Syncing & Background Polling Engine
  useEffect(() => {
    if (isDemo) {
      // Inject mock payload notifications to simulate active platform interactions
      setNotifications([
        { 
          _id: "mock-notif-1", 
          message: "Welcome to the Eventvista interactive sandbox! Rate limits are safely disabled.", 
          createdAt: new Date().toISOString(), 
          read: false 
        },
        { 
          _id: "mock-notif-2", 
          message: "AI Advisor has successfully prepared a plan based on your guest layout constraints.", 
          createdAt: new Date().toISOString(), 
          read: true 
        }
      ]);
      setUnreadCount(1);
      return;
    }

    // Connect and read from live server endpoints if operating outside sandbox boundaries
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/v1/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
          setUnreadCount(json.unreadCount);
        }
      } catch (error) {
        console.error("Notification sync failed:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Background polling loop every 30s
    return () => clearInterval(interval);
  }, [isDemo]);

  // Global Notification State Actions
  const handleMarkAllRead = async () => {
    if (isDemo) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await fetch("/api/v1/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications read:", error);
    }
  };

  // Search Context Form Controller
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    router.push(`/events?q=${encodeURIComponent(query)}`);
  };

  // Sandbox Mode Activation Route Trigger
  const handleLaunchDemo = () => {
    localStorage.setItem("eventvista_demo_mode", "true");
    window.location.href = "/demo/dashboard"; // Clean reload establishes sandbox configurations
  };

  // Sandbox Mode Environment Teardown
  const handleExitDemo = () => {
    localStorage.removeItem("eventvista_demo_mode");
    window.location.href = "/"; // Route user cleanly back to live marketing infrastructure
  };

  // Multi-Tier Identity Token Sign-Out Sequence
  const handleSignOut = async () => {
    try {
      await signOut(auth); // Disconnect live edge token instances via Firebase Provider
      localStorage.removeItem("token"); // Purge client authorization signatures
      router.push("/"); // Direct user back to root landing page
    } catch (error) {
      console.error("Session termination execution pipeline fault:", error);
    }
  };

  const getInitials = (nameString) => {
    if (!nameString) return "?";
    return nameString
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-md sm:px-6"
    >
      {/* Mobile Sidebar Hamburger Toggle */}
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label="Open navigation menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 lg:hidden shrink-0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Brand & Mode Badging */}
      <div className="flex items-center gap-3 mr-2">
        <Link href="/" className="text-xl font-black tracking-tight text-purple-700">
          Eventvista
        </Link>
        {isDemo && (
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black tracking-wider text-white bg-orange-500 rounded animate-pulse">
            SANDBOX MODE
          </span>
        )}
      </div>

      {/* Global Search Interface */}
      <form role="search" className="hidden flex-1 max-w-md sm:block" onSubmit={handleSearchSubmit}>
        <label htmlFor="global-search" className="sr-only">Search events, vendors, configurations</label>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="global-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search events, vendors..."
            className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-4 text-sm placeholder:text-neutral-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all"
          />
        </div>
      </form>

      {/* Action Control Deck */}
      <div className="ml-auto flex items-center gap-4">

        {/* Notifications Popover */}
        <div
          className="relative"
          onMouseEnter={() => setIsNotifOpen(true)}
          onMouseLeave={() => setIsNotifOpen(false)}
        >
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-purple-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 w-80 pt-1.5 z-50 animate-fadeIn">
              <div className="bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/50">
                  <p className="text-xs font-bold text-neutral-800">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-purple-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-neutral-400">
                      You&apos;re all caught up.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`px-4 py-3 border-b border-neutral-50 last:border-0 ${
                          !n.read ? "bg-purple-50/40" : ""
                        }`}
                      >
                        <p className="text-xs text-neutral-700">{n.message}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Identity Controller Split */}
        {!loading && (
          user ? (
            /* Authenticated Component */
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="flex items-center gap-3 border-l border-neutral-200 pl-4 cursor-pointer py-2 group select-none">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-transform group-hover:scale-105 shadow-sm border ${
                  isDemo 
                    ? "bg-orange-100 text-orange-700 border-orange-200" 
                    : "bg-purple-100 text-purple-700 border-purple-200/50"
                }`}>
                  {getInitials(user.name)}
                </span>
                <div className="hidden text-left leading-tight md:block">
                  <p className="text-sm font-semibold text-neutral-800 transition-colors group-hover:text-purple-700">
                    {user.name}
                  </p>
                  <p className="text-xs font-medium text-neutral-400 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 w-52 pt-1.5 z-50 animate-fadeIn">
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden flex flex-col p-1">
                    <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50/50 rounded-t-lg mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Signed in as</p>
                      <p className="text-xs font-bold text-neutral-800 truncate mt-0.5">{user.email}</p>
                    </div>

                    {isDemo ? (
                      <button
                        type="button"
                        onClick={handleExitDemo}
                        className="w-full px-3 py-2 text-xs font-bold text-orange-600 text-left rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        Exit Demo Sandbox
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/settings"
                          className="px-3 py-2 text-xs font-bold text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-purple-600 transition-colors"
                        >
                          Account Settings
                        </Link>
                        <div className="border-t border-neutral-100 my-1 mx-1" />
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full px-3 py-2 text-xs font-bold text-red-600 text-left rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Visitor Options */
            <div className="flex items-center gap-3 pl-2 border-l border-neutral-200">
              <button 
                type="button"
                onClick={handleLaunchDemo} 
                className="hidden sm:inline-block px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Interactive Demo
              </button>
              <Link 
                href="/login" 
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )
        )}

      </div>
    </header>
  );
}