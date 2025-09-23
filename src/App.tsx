import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ChapterOne from './components/chapters/ChapterOne';
import ChapterTwo from './components/chapters/ChapterTwo';
import ChapterThree from './components/chapters/ChapterThree';
import ChapterFour from './components/chapters/ChapterFour';
import ChapterFive from './components/chapters/ChapterFive';
import DescriptiveStatistics from './components/chapters/DescriptiveStatistics';

import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Component that uses the sidebar context
const AppContent = () => {
  const { sidebarWidth } = useSidebar();
  const location = useLocation();
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === '/login';
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      
      {!isLoginPage && (
        <ProtectedRoute>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Sidebar />
            <div className={`${sidebarWidth} transition-all duration-300 ease-in-out`}>
              <MobileHeader />
              <div className="p-4 lg:p-8">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/chapter-1" element={<ChapterOne />} />
                  <Route path="/diagrams" element={<ChapterTwo />} />
                  <Route path="/chapter-2" element={<ChapterTwo />} />
                  <Route path="/chapter-3" element={<ChapterThree />} />
                  <Route path="/chapter-4" element={<ChapterFour />} />
                  <Route path="/chapter-5" element={<ChapterFive />} />
                  <Route path="/descriptive-statistics" element={<DescriptiveStatistics />} />
                </Routes>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;