"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Determine initial theme
    const initialTheme = saved || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed top-24 right-4 z-50 p-3 rounded-full bg-background/80 backdrop-blur-sm 
                 text-foreground border border-border shadow-lg hover:scale-110 transition-all 
                 duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
                 focus:ring-offset-background"
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
      {children}
    </>
  );
}
