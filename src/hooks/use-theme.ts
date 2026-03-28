"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "flatmate_theme";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  // Read from DOM on mount (the inline script may have already set the class)
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    setIsDark(next);
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    setIsDark(dark);
  }, []);

  return { isDark, toggle, setTheme };
}
