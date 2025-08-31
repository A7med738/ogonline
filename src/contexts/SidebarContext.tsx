import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextValue {
  isVisible: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebar-visible");
    return stored !== null ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-visible", JSON.stringify(isVisible));
  }, [isVisible]);

  const toggle = () => setIsVisible((v) => !v);
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return (
    <SidebarContext.Provider value={{ isVisible, toggle, show, hide }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};