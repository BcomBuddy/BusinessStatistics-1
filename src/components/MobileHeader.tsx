import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';

const MobileHeader = () => {
  const { toggleSidebar, isMobile } = useSidebar();

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <button
        onClick={toggleSidebar}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-colors"
        aria-label="Open sidebar menu"
      >
        <Menu className="h-6 w-6" />
        <span className="font-medium">Menu</span>
      </button>
    </div>
  );
};

export default MobileHeader;
