import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "CreditCycle — Card Manager",
  description: "Personal credit card cycle manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50 font-sans antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar — desktop only */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar — mobile only */}
            <TopBar />

            <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7 pb-24 lg:pb-7 max-w-5xl w-full">
              {children}
            </main>
          </div>
        </div>

        {/* Bottom nav — mobile only */}
        <BottomNav />
      </body>
    </html>
  );
}
