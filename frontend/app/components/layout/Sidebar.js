// frontend/components/layout/Sidebar.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Events", href: "/events", icon: "calendar-event" },
  { label: "3D Designer", href: "/designer", icon: "cube" },
  { label: "Guests", href: "/guests", icon: "users" },
  { label: "Vendors", href: "/vendors", icon: "briefcase" },
  { label: "Budget", href: "/budget", icon: "wallet" },
  { label: "Calendar", href: "/calendar", icon: "calendar" },
  { label: "Messages", href: "/messages", icon: "chat" },
  { label: "Reports", href: "/reports", icon: "chart" },
  { label: "Settings", href: "/settings", icon: "cog" },
];

const ICONS = {
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  "calendar-event": <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
  cube: <path d="M12 2l9 5v10l-9 5-9-5V7l9-5zM3 7l9 5 9-5M12 12v10" />,
  users: <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />,
  briefcase: <path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />,
  wallet: <path d="M3 6h15a3 3 0 013 3v9a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />,
  calendar: <path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4" />,
  chat: <path d="M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-4-1L3 21l1.5-4.5" />,
  chart: <path d="M3 3v18h18M9 17V9M14 17V5M19 17v-7" />,
  cog: <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
};

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileNavOpen, toggleMobileNav } = useSidebar();
  const [isAlphaTester, setIsAlphaTester] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    const ALPHA_LIST = ["kariukilewis04@gmail.com", "johnsimonwafula@gmail.com", "muttasheky@gmail.com", "giddyoseko35@gmail.com"];
    if (ALPHA_LIST.includes(email.toLowerCase())) {
      setIsAlphaTester(true);
    }
  }, []);

  return (
    <>
      {mobileNavOpen && <button onClick={toggleMobileNav} className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden" />}
      <nav className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-neutral-900 text-neutral-200 transition-all duration-300 ${collapsed ? "w-20" : "w-64"} ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
          <span className="h-7 w-7 shrink-0 rounded-full bg-primary-500" />
          {!collapsed && <span className="text-lg font-semibold text-white">Eventvista</span>}
        </div>

        <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary-600 text-white" : "text-neutral-300 hover:bg-neutral-800"}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">{ICONS[item.icon]}</svg>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}

          {/* Conditional Admin rendering strictly limited to system testing roles */}
          {isAlphaTester && (
            <li className="pt-4 mt-4 border-t border-white/10">
              <Link href="/admin" className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-amber-400 hover:bg-neutral-800`}>
                <span className="text-lg">🛠️</span>
                {!collapsed && <span>Admin Terminal</span>}
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}