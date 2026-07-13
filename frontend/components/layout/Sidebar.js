// frontend/components/layout/Sidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useEventContext } from "@/context/EventContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Events", href: "/events", icon: "calendar-event" },
  { label: "3D Designer", href: "/designer", icon: "cube" },
  { label: "Guests", href: "/guests", icon: "users" },
  { label: "Vendors", href: "/vendors", icon: "briefcase", roleRestrict: "client" },
  { label: "Budget", href: "/budget", icon: "wallet", roleRestrict: "client" },
  { label: "Inventory", href: "/inventory", icon: "briefcase", roleRestrict: "vendor" },
  { label: "Calendar", href: "/calendar", icon: "calendar" },
  { label: "Messages", href: "/messages", icon: "chat" },
  { label: "Reports", href: "/reports", icon: "chart" },
  { label: "Settings", href: "/settings", icon: "cog" },
];

const ICONS = {
  grid: (
    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
  ),
  "calendar-event": (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
    </>
  ),
  cube: (
    <path d="M12 2l9 5v10l-9 5-9-5V7l9-5zM3 7l9 5 9-5M12 12v10" />
  ),
  users: (
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  ),
  briefcase: (
    <path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
  ),
  wallet: (
    <path d="M3 6h15a3 3 0 013 3v9a3 3 0 01-3 3H6a3 3 0 01-3-3V6zM16 13h2" />
  ),
  calendar: (
    <path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4" />
  ),
  chat: (
    <path d="M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-4-1L3 21l1.5-4.5A8.38 8.38 0 013 11.5 8.5 8.5 0 0111.5 3 8.38 8.38 0 0121 11.5z" />
  ),
  chart: (
    <path d="M3 3v18h18M9 17V9M14 17V5M19 17v-7" />
  ),
  cog: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
};

function NavIcon({ name }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const { collapsed, toggleCollapsed, mobileNavOpen, toggleMobileNav } = useSidebar();
  const { activeEventId } = useEventContext();

  return (
    <>
      {mobileNavOpen && (
        <button
          aria-label="Close navigation overlay"
          onClick={toggleMobileNav}
          className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
        />
      )}

      <nav
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-neutral-900 text-neutral-200 transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
          <span
            className="h-7 w-7 shrink-0 rounded-full bg-primary-500"
            aria-hidden="true"
          />
          {!collapsed && (
            <span className="text-lg font-semibold text-white">
              Eventvista
            </span>
          )}
        </div>

        <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            // Check custom app role restrictions
            if (item.roleRestrict && role !== item.roleRestrict) {
              return null;
            }

            // Append active eventId context parameter to preserve workspace sessions
            const targetHref = activeEventId
              ? `${item.href}?eventId=${activeEventId}`
              : item.href;

            const active = pathname?.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={targetHref}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200
                    ${
                      active
                        ? "bg-primary-600 text-white"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                >
                  <NavIcon name={item.icon} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sync Status Overlay Panel */}
        <div className="border-t border-white/10 p-3 flex flex-col gap-2">
          {/* Expanded Sidebar Sync Info */}
          {!collapsed && (
            <div className="px-3 py-2 rounded-lg bg-neutral-950/50 border border-white/5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${activeEventId ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span className="truncate font-medium">
                  {activeEventId ? `Active ID: ${activeEventId}` : "No Event Selected"}
                </span>
              </div>
            </div>
          )}

          {/* Collapsed Sidebar Indicator Dot */}
          {collapsed && (
            <div 
              className="flex justify-center py-1"
              title={activeEventId ? `Active Event ID: ${activeEventId}` : "No Event Selected"}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${activeEventId ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            </div>
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden w-full h-9 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-200 hover:bg-neutral-800 hover:text-white lg:flex"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}