// frontend/app/layout.js
import "./globals.css"; // Ensure you have your Tailwind/Global CSS here

export const metadata = {
  title: "Eventvista | Plan, Manage, Celebrate",
  description: "Eventvista helps you organise events seamlessly and create unforgettable experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Next.js automatically injects standard head elements here */}
      </head>
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        {/* Your route pages (like login or dashboard) will render inside {children} */}
        {children}
      </body>
    </html>
  );
}