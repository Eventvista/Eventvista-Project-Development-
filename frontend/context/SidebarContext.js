"use client";

import { createContext, useContext, useState, useCallback } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggleCollapsed, mobileNavOpen, toggleMobileNav }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}