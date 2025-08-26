import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  sidebarWidth: string;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On mobile, sidebar should be collapsed by default
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Calculate sidebar width based on state and device
  const getSidebarWidth = () => {
    if (isMobile) {
      return isCollapsed ? 'ml-0' : 'ml-0';
    }
    return isCollapsed ? 'ml-16' : 'ml-64';
  };

  const sidebarWidth = getSidebarWidth();

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, sidebarWidth, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};
