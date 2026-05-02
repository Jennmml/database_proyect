"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useTheme } from "../../context/ThemeContext";

const api = "https://api.mytry.dev";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const cerrarSesion = async () => {
    const response = await fetch(`${api}/connection/disconnect`, {
      method: "POST",
    });

    if (response.ok) {
      localStorage.removeItem("toastMaquinasMostrado");
      localStorage.removeItem("toastSesionesMostrado");
      router.push("/");
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        theme === "light" ? "bg-white" : "bg-[#121212]"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div />

        <Button
          size="sm"
          onClick={toggleTheme}
          className={`font-medium transition ${
            theme === "light"
              ? "text-gray-800 hover:text-black"
              : "text-white hover:text-gray-300"
          }`}
        >
          {theme === "light" ? "Modo oscuro" : "Modo claro"}
        </Button>

        <Button
          size="sm"
          onClick={cerrarSesion}
          className={`font-medium transition ${
            theme === "light"
              ? "text-gray-800 hover:text-black"
              : "text-white hover:text-gray-300"
          }`}
        >
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
