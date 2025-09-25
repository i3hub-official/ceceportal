// src/contexts/HeaderContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

interface HeaderContextType {
  setCustomHeader: (header: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [customHeader, setCustomHeader] = useState<ReactNode | null>(null);

  // Use useCallback to memoize the setter function
  const stableSetCustomHeader = useCallback((header: ReactNode | null) => {
    setCustomHeader(header);
  }, []);

  return (
    <HeaderContext.Provider value={{ setCustomHeader: stableSetCustomHeader }}>
      {children}
      {customHeader}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}
