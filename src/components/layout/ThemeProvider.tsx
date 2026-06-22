"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/store/ui";

/**
 * Syncs the Zustand UI store with the theme class already applied by the
 * inline script in the root layout, and persists user choices to localStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useUI((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, [setTheme]);

  // Subscribe to store changes and persist.
  useEffect(() => {
    if (!mounted) return;
    return useUI.subscribe((state) => {
      localStorage.setItem("lumen-theme", state.theme);
    });
  }, [mounted]);

  return <>{children}</>;
}
