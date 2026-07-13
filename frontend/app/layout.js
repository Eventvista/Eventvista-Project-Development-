// frontend/app/layout.js
import { SidebarProvider } from "@/context/SidebarContext";
import { EventContextProvider } from "@/context/EventContext";
import "@/styles/globals.css"; // Assuming you have global styles

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <EventContextProvider>
            {children}
          </EventContextProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
