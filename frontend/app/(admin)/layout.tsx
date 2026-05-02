"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "../globals.css";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

function LayoutBody({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`flex h-screen font-sans transition-colors duration-300 ${
        isDark ? "bg-[#121212] text-white" : "bg-white text-gray-900"
      }`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutBody>{children}</LayoutBody>
    </ThemeProvider>
  );
}
