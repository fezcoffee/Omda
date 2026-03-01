import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Omda | Coffee Catering Operations",
  description: "End-to-end event project management for Omda Coffee Catering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#3B1F0A",
              color: "#FDF8F3",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#6ee7b7", secondary: "#3B1F0A" } },
            error: { iconTheme: { primary: "#fca5a5", secondary: "#3B1F0A" } },
          }}
        />
      </body>
    </html>
  );
}
