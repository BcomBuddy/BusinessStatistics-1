import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChapterOne from './components/chapters/ChapterOne';
import ChapterTwo from './components/chapters/ChapterTwo';
import ChapterThree from './components/chapters/ChapterThree';
import ChapterFour from './components/chapters/ChapterFour';
import ChapterFive from './components/chapters/ChapterFive';
import DescriptiveStatistics from './components/chapters/DescriptiveStatistics';

import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';

// Component that uses the sidebar context
const AppContent = () => {
  const { sidebarWidth } = useSidebar();
  
  return (
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
  );
};

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;