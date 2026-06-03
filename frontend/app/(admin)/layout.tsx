"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // CORRECCIÓN B-01 (CWE-425 / CWE-862): Protección de Rutas en Cliente
    // Evita que un usuario no autenticado navegue directamente a /dashboard u otras rutas protegidas.
    const userRole = localStorage.getItem("userRole");
    if (!userRole) {
      router.push("/auth");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Prevenir que se renderice contenido sensible por una fracción de segundo (flicker)
  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LayoutBody>{children}</LayoutBody>
    </ThemeProvider>
  );
}
