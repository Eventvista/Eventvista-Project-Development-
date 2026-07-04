import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:ml-64 transition-all duration-300">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}