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

  // SSOT State Management
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Hydrate user profile variables directly from MongoDB server context instance
  useEffect(() => {
    const fetchSSOTUser = async () => {
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
    };

    fetchSSOTUser();
  }, []);

  // Notifications: fetch on mount, then poll every 30s
  useEffect(() => {
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
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    router.push(`/events?q=${encodeURIComponent(query)}`);
  };

  // Multi-tier absolute session teardown sequence
  const handleSignOut = async () => {
    try {
      await signOut(auth); // Terminate active edge instances via Firebase Provider
      localStorage.removeItem("token"); // Clear localized database token signatures
      router.push("/"); // Securely route user back to marketing page root
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
      {/* Mobile Sidebar Hamburger Toggle Interface Trigger */}
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

      <div className="hidden md:flex lg:hidden items-center gap-2 mr-2">
        <span className="text-lg font-black text-purple-700">Eventvista</span>
      </div>

      {/* Global Search — now actually navigates to filtered Events results */}
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

      <div className="ml-auto flex items-center gap-4">

        {/* Notifications — real popover backed by GET/PUT /api/v1/notifications */}
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
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-xs font-bold text-neutral-800">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-semibold text-purple-600 hover:underline"
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

        {/* Database Validated Identity Control Node */}
        {!loading && user && (
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className="flex items-center gap-3 border-l border-neutral-200 pl-4 cursor-pointer py-2 group select-none">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 transition-transform group-hover:scale-105 shadow-sm border border-purple-200/50">
                {getInitials(user.name)}
              </span>
              <div className="hidden text-left leading-tight md:block">
                <p className="text-sm font-semibold text-neutral-800 transition-colors group-hover:text-purple-700">
                  {user.name || "Workspace Profile"}
                </p>
                <p className="text-xs font-medium text-neutral-400 capitalize">
                  {user.role || "Client"}
                </p>
              </div>
            </div>

            {/* Exactly two items per spec: Settings, Sign Out */}
            {isDropdownOpen && (
              <div className="absolute right-0 w-52 pt-1.5 z-50 animate-fadeIn">
                <div className="bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden flex flex-col p-1">
                  <div className="px-3 py-2 border-b border-neutral-100 md:hidden">
                    <p className="text-xs font-bold text-neutral-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 capitalize mt-0.5">{user.role}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="px-3 py-2 text-xs font-bold text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-purple-600 transition-colors"
                  >
                    Account Settings
                  </Link>
                  <div className="border-t border-neutral-100 my-1" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 text-xs font-bold text-red-600 text-left rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}