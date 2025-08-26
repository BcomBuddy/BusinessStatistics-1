import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Calculator, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar, isMobile } = useSidebar();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/chapter-1', label: 'Introduction', icon: BookOpen },
    { path: '/diagrams', label: 'Diagrams & Graphics', icon: BarChart3 },
    { path: '/chapter-3', label: 'Central Tendency', icon: Calculator },
    { path: '/chapter-4', label: 'Dispersion & Shape', icon: TrendingUp },
    { path: '/chapter-5', label: 'Correlation', icon: BarChart3 },
    { path: '/descriptive-statistics', label: 'Outlier Detection', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          !isCollapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out z-50 ${
        isMobile ? 'w-64' : (isCollapsed ? 'w-16' : 'w-64')
      } lg:translate-x-0 ${
        isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}>
        {/* Header with Logo and Toggle Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {(!isCollapsed || isMobile) && (
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Stats Simulator</span>
            </Link>
          )}
          
          <div className="flex items-center space-x-2">
            {/* Mobile Close Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Desktop Toggle Button */}
            <button
              onClick={toggleSidebar}
              className={`hidden lg:block p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isCollapsed ? 'mx-auto' : ''
              }`}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    // Close sidebar on mobile when item is clicked
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                  className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                  }`}
                  title={isCollapsed && !isMobile ? item.label : undefined}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-3 transition-opacity duration-200 font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer with Collapsed State Info - Only show on desktop when collapsed */}
        {isCollapsed && !isMobile && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-200">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
