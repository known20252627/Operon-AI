/* eslint-disable react-hooks/set-state-in-effect */
"use client";
/* ──────────────────────────────────────────────
   useTheme — light / dark mode with persistence
   ────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import type { Theme } from "@/types";

const STORAGE_KEY = "quoteai_theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  // Sync to localStorage and <html> attribute
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { theme, setTheme, toggleTheme };
}
