// components/AppHeader.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Moon, Sun, LogInIcon } from "lucide-react";

export default function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = saved || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 h-header ${
        scrolled
          ? "bg-card/95 backdrop-blur-sm border-background shadow-sm"
          : "bg-card border-b border-background"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="relative flex items-center justify-between h-full w-full">
          {/* --- Mobile left: only hamburger --- */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              className="text-foreground p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* --- Brand name (with theme button on mobile) --- */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center"
          >
            <span className="text-xl font-bold text-primary select-none block md:hidden">
              CEC eReg
            </span>
            <span className="hidden md:block text-xl font-bold text-primary select-none">
              CEC eRegistration
            </span>
          </Link>

          {/* Theme button on mobile, right of brand */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-full bg-card text-foreground border border-background hover:bg-background transition-colors md:hidden"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* --- Desktop right: login + theme --- */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="bg-transparent hover:bg-primary/10 text-foreground font-medium py-2 px-4 rounded-md transition flex items-center"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Link>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-card text-foreground border border-background hover:bg-background transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Mobile dropdown --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border mt-4 flex flex-col divide-y divide-gray-200 sm:hidden border border-card rounded-md shadow-sm p-4 space-y-4">
          <div className="flex gap-2">
            <Link
              href="center"
              className="flex-1 flex items-center justify-center bg-transparent hover:bg-primary/10 text-foreground font-medium py-2 px-3 rounded-md transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="w-4 h-4 mr-2" /> Register
            </Link>

            <Link
              href="/login"
              className="flex-1 flex items-center justify-center bg-transparent hover:bg-primary/10 text-foreground font-medium py-2 px-3 rounded-md transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LogInIcon className="w-4 h-4 mr-2" /> Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
