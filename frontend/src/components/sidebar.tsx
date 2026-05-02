"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  UserCheck,
  Shield,
  Dumbbell,
  Calendar,
  CreditCard,
  Settings,
  BarChart3,
  UserPlus,
  ClipboardList
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Entrenadores", href: "/entrenadores", icon: UserCheck },
  { name: "Administradores", href: "/administradores", icon: Shield },
  { name: "Clases", href: "/clases", icon: Dumbbell },
  { name: "Sesiones", href: "/sesiones", icon: Calendar },
  { name: "Inscripciones", href: "/inscripciones", icon: ClipboardList },
  { name: "Asistencia", href: "/asistencia", icon: UserPlus },
  { name: "Pagos", href: "/pagos", icon: CreditCard },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside
      className={cn(
        "w-64 h-full transition-colors duration-300",
        isDark ? "bg-[#121212]" : "bg-white"
      )}
    >
      <div className="p-6">
        <h1
          className={cn(
            "text-xl font-bold",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          FastFitness
        </h1>
        <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
          Sistema de Administración
        </p>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all",
                  isActive
                    ? isDark
                      ? "bg-gray-700 text-white shadow-sm"
                      : "bg-gray-200 text-gray-900 shadow-sm"
                    : isDark
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
