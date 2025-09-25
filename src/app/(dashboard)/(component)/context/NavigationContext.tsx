// NavigationContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

interface NavigationContextType {
  sidebarOpen: boolean;
  activeMenu: string; // active child or parent without submenu
  activeParent: string | null; // track parent separately
  menuClickKey: number; // unique key to force reloads
  toggleSidebar: () => void;
  setActiveMenu: (menuId: string) => void;
  setActiveParent: (parentId: string | null) => void;
  forceMenuUpdate: () => void; // New function to force update on any click
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [menuClickKey, setMenuClickKey] = useState<number>(Date.now());

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleSetActiveMenu = (menuId: string) => {
    setActiveMenu(menuId);
    setMenuClickKey(Date.now()); // ✅ update key every click
  };

  const handleSetActiveParent = (parentId: string | null) => {
    setActiveParent(parentId);
    setMenuClickKey(Date.now()); // ✅ update key every click
  };

  const forceMenuUpdate = () => {
    setMenuClickKey(Date.now()); // ✅ update key on any click
  };

  return (
    <NavigationContext.Provider
      value={{
        sidebarOpen,
        activeMenu,
        activeParent,
        menuClickKey,
        toggleSidebar,
        setActiveMenu: handleSetActiveMenu,
        setActiveParent: handleSetActiveParent,
        forceMenuUpdate, // Add the new function
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};