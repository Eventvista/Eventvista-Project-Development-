// frontend/components/Navbar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // UI Interactive states
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Sync state metadata with the backend SSOT on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Fetch User Identity Profile Context
    fetch("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUser(json.data);
      })
      .catch((err) => console.error("Navbar Identity sync fault:", err));

    // 2. Fetch Notification Telemetry Data Stream
    fetch("/api/v1/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setNotifications(json.data || []);
          setUnreadCount(json.unreadCount || 0);
        }
      })
      .catch((err) => console.error("Navbar Notification telemetry fault:", err));
  }, []);

  // Handle seamless hover drop-downs cleanly without flickering
  const handleProfileMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsProfileHovered(true);
  };

  const handleProfileMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsProfileHovered(false);
    }, 200); // 200ms grace threshold
  };

  // Perform operational search query dispatching
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Broadcast parameters across global structural route queries
    router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
  };

  // System Sign-out Sequence (Clears active tokens and session data)
  const handleSignOut = async () => {
    try {
      // Clear all items stored in local state caches
      localStorage.removeItem("token");
      localStorage.removeItem("activeEventId");
      
      // Note: If you have initialized client-side Firebase Auth hooks, call your authInstance.signOut() here
      
      // Force immediate rehydration routing back onto standard public landing zone
      router.push("/");
    } catch (error) {
      console.error("Sign out process intercepted error:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Failed to commit notification status adjustments:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-6 shadow-sm">
      
      {/* SECTION 1: SEARCH PIPELINE BLOCK */}
      <div className="flex flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <label htmlFor="navbar-search" className="sr-only">Search events or workspace metrics</label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center定位 left-3">
            <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="navbar-search"
            type="search"
            placeholder="Search events, vendors, allocations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2 pl-10 pr-4 text-xs font-medium text-neutral-800 placeholder-neutral-400 transition-all focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </form>
      </div>

      {/* SECTION 2: UTILITY SYSTEM METRIC ACTIONS CONTAINER */}
      <div className="flex items-center gap-4">
        
        {/* NOTIFICATION INTERACTIVE POP-OVER AREA */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
            aria-label="View platform metrics updates notifications"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
                <span className="text-xs font-bold text-neutral-800">System Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} className="text-[10px] font-semibold text-purple-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto py-1 no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-neutral-400">No recent notifications received.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif._id} className={`rounded-lg px-3 py-2 transition-colors ${notif.read ? "bg-white" : "bg-neutral-50"}`}>
                      <p className="text-xs text-neutral-700 font-medium">{notif.message}</p>
                      <span className="text-[9px] text-neutral-400">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "System Just Now"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: USERNAME PROFILE INTERACTION PIPELINE TAB */}
        <div 
          className="relative"
          onMouseEnter={handleProfileMouseEnter}
          onMouseLeave={handleProfileMouseLeave}
        >
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 p-1.5 pr-3 transition-colors hover:bg-neutral-50"
            aria-expanded={isProfileHovered}
            aria-haspopup="true"
          >
            {/* Visual User Avatar Frame */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 font-bold text-white text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            {/* User Identity String Display */}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-neutral-800 truncate max-w-[100px]">{user?.name || "Active Session"}</p>
              <p className="text-[9px] font-medium text-neutral-400 uppercase tracking-wider">{user?.role || "Organiser"}</p>
            </div>
            <svg className={`h-3 w-3 text-neutral-400 transition-transform duration-200 ${isProfileHovered ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* DYNAMIC DROPDOWN MODULAR OVERLAY CONTAINER */}
          {isProfileHovered && (
            <div 
              className="absolute right-0 w-48 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 transition-all animate-in fade-in slide-in-from-top-2"
              role="menu"
              aria-label="User Profile actions context setup"
            >
              {/* MODULE BUTTON 1: SETTINGS COMPONENT TARGET ROUTER */}
              <Link href="/settings" role="menuitem" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
                <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Workspace Settings
              </Link>
              
              <hr className="my-1 border-neutral-100" />

              {/* MODULE BUTTON 2: DISCONNECT / SIGN OUT COMMAND ACTION */}
              <button
                type="button"
                onClick={handleSignOut}
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out Account
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}