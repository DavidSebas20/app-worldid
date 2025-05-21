"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Check, Moon, Sun, Laptop } from "lucide-react";
import CircularIcon from "./CircularIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <CircularIcon
        imageUrl="/images/logo.png"
        alt="Logo de la aplicación"
        size={40}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <CircularIcon
            imageUrl="/images/logo.png"
            alt="Logo de la aplicación"
            size={40}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">Tema</div>
        <DropdownMenuItem
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setTheme("light")}
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Claro</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setTheme("dark")}
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Oscuro</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setTheme("system")}
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            <span>Sistema</span>
          </div>
          {theme === "system" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
