"use client";

import { create } from "zustand";

interface UIState {
  theme: "light" | "dark";
  searchOpen: boolean;
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  setSearchOpen: (open: boolean) => void;
}

/** Theme is hydrated by the ThemeScript in the root layout (prevents FOUC). */
export const useUI = create<UIState>((set, get) => ({
  theme: "light",
  searchOpen: false,
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    applyTheme(next);
    set({ theme: next });
  },
  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
  setSearchOpen: (open) => set({ searchOpen: open }),
}));

function applyTheme(t: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}
