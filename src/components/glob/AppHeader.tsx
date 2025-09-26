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
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 h-header ${
          scrolled
            ? "bg-card/95 backdrop-blur-sm border-border shadow-sm"
            : "bg-card border-b border-border"
        }`}
      >
        <div className="container h-full">
          <div className="relative flex items-center justify-between h-full w-full">
            {/* --- Mobile left: only hamburger --- */}
            <div className="flex items-center md:hidden space-x-2">
              <button
                className="text-foreground p-2 transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
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
                className="ml-2 p-2 rounded-full bg-card text-foreground border border-border hover:bg-muted-10 dark:hover:bg-muted-20 transition-all duration-300 md:hidden"
                aria-label="Toggle theme"
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
                className="bg-transparent hover:bg-primary-10 text-foreground font-medium py-2 px-4 rounded-md transition-all duration-300 flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Link>
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-card text-foreground border border-border hover:bg-muted-10 dark:hover:bg-muted-20 transition-all duration-300"
                  aria-label="Toggle theme"
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
      </nav>

      {/* --- Mobile dropdown --- */}
      <div
        className={`md:hidden fixed left-0 right-0 z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          top: "var(--header-height)",
          backgroundColor: scrolled
            ? "rgba(var(--card), 0.95)"
            : "rgb(var(--card))",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        }}
      >
        <div className="border-t border-border p-4">
          {/* Card container for register and login buttons */}
          <div className="card p-2">
            <div className="flex gap-2">
              <Link
                href="center"
                className="flex-1 flex items-center justify-center bg-transparent hover:bg-primary-10 text-foreground font-medium py-2 px-3 rounded-md transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4 mr-2" /> Register
              </Link>

              <Link
                href="/login"
                className="flex-1 flex items-center justify-center bg-transparent hover:bg-primary-10 text-foreground font-medium py-2 px-3 rounded-md transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogInIcon className="w-4 h-4 mr-2" /> Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
