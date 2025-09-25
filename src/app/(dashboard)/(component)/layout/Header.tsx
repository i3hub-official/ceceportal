// src\app\(dashboard)\(component)\layout\Header.tsx
"use client";
import React from "react";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";
import { useNavigation } from "../context/NavigationContext";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { toggleSidebar, activeMenu } = useNavigation();
  const { darkMode, toggleTheme } = useTheme();

  const schoolName = "All Saints' Secondary School";
  const schoolAbbreviation = "ASSS";
  const schoolAddress = "Uboma";
  const centreNumber = "00145244";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-6 shadow-sm bg-card border-border lg:left-64 transition-all duration-300">
      {/* Left */}
      <div className="flex items-center space-x-4">
        {/* Sidebar toggle (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu size={20} />
        </button>

        <div className="mb-4 mt-7">
          <h1 className="text-lg sm:text-xl font-semibold capitalize text-foreground leading-snug">
            {/* Mobile: abbreviation only */}
            <span className="sm:hidden">
              {schoolAbbreviation}, {schoolAddress}
            </span>

            {/* Desktop: full name + address */}
            <span className="hidden sm:inline">
              {schoolName}, {schoolAddress}
            </span>

            {/* Desktop only: activeMenu */}
            {activeMenu !== "dashboard" && activeMenu && (
              <span className="hidden sm:inline text-sm font-medium text-muted-foreground sm:ml-2">
                –{" "}
                {activeMenu
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            )}
          </h1>

          {/* Centre number */}
          <h3 className="text-xs sm:text-sm text-foreground/70 mt-1">
            {/* Mobile: only digits */}
            <span className="sm:hidden font-medium">{centreNumber}</span>

            {/* Desktop: full label + digits */}
            <span className="hidden sm:inline">
              Centre Number: <span className="font-medium">{centreNumber}</span>
            </span>
          </h3>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <Search size={20} className="text-foreground" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun size={20} className="text-accent" />
          ) : (
            <Moon size={20} className="text-foreground" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
