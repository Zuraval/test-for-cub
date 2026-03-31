import { useState, useEffect } from "react";

type ThemeMode = "light" | "dark";

const THEME_KEY = "order-dashboard-theme";

export const useThemeMode = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return {
    isDark,
    toggleTheme,
    theme: (isDark ? "dark" : "light") as ThemeMode,
  };
};
