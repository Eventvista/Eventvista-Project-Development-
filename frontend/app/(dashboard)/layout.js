// frontend/app/(dashboard)/layout.js
/**
 * @file frontend/app/(dashboard)/layout.js
 * @description Master dashboard layout orchestration layer.
 * Wraps all dashboard routes in structural providers to manage responsive 
 * UI collapse states, navbar visibility, and active event session state persistence[cite: 18].
 */

import { SidebarProvider } from "@/context/SidebarContext";
import { EventContextProvider } from "@/context/EventContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <EventContextProvider>
        <div className="flex min-h-screen bg-neutral-50">
          {/* Collapsible primary navigation sidebar[cite: 18] */}
          <Sidebar />
          
          {/* Main content stage: dynamically offsets layout depending on sidebar desktop state[cite: 18] */}
          <div className="flex flex-1 flex-col lg:ml-64 transition-all duration-300">
            {/* Context-aware global portal navbar[cite: 18] */}
            <Navbar />
            
            <main className="flex-1 p-4 sm:p-6">
              {/* Child panels (Dashboard, Budget, Events, etc.) render within this context window[cite: 18] */}
              {children}
            </main>
          </div>
        </div>
      </EventContextProvider>
    </SidebarProvider>
  );
}