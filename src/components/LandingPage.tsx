import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, Calculator, TrendingUp, Users, Play, FileText, Award, Clock, Globe } from 'lucide-react';

const LandingPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const videoOptions = [
    { value: 'english', label: 'English', url: 'https://www.youtube.com/embed/Wk4-215Avfc' },
    { value: 'hindi-urdu', label: 'Hindi/Urdu', url: 'https://www.youtube.com/embed/Q2mO0P5Elx0' },
    { value: 'telugu', label: 'Telugu', url: 'https://www.youtube.com/embed/DTHpY78P16g' }
  ];

  const currentVideo = videoOptions.find(option => option.value === selectedLanguage) || videoOptions[0];

  const chapters = [
    {
      id: 1,
      title: 'Introduction to Statistics',
      description: 'Master the fundamentals: definitions, data types, and classification methods with interactive examples.',
      icon: BookOpen,
      path: '/chapter-1',
      color: 'from-blue-500 to-blue-600',
      duration: '~15 min',
      topics: ['Statistics Definition', 'Data Classification', 'Tabulation Methods']
    },
    {
      id: 2,
      title: 'Diagrams & Graphics',
      description: 'Create stunning visualizations with charts, graphs, and advanced diagram techniques.',
      icon: BarChart3,
      path: '/chapter-2',
      color: 'from-green-500 to-green-600',
      duration: '~25 min',
      topics: ['Bar & Pie Charts', 'Histograms', 'Time Series']
    },
    {
      id: 3,
      title: 'Central Tendency',
      description: 'Calculate mean, median, mode with step-by-step solutions and visual explanations.',
      icon: Calculator,
      path: '/chapter-3',
      color: 'from-purple-500 to-purple-600',
      duration: '~20 min',
      topics: ['Arithmetic Mean', 'Geometric & Harmonic', 'Quartiles']
    },
    {
      id: 4,
      title: 'Dispersion & Shape',
      description: 'Analyze data spread, skewness, and kurtosis with advanced statistical measures.',
      icon: TrendingUp,
      path: '/chapter-4',
      color: 'from-orange-500 to-orange-600',
      duration: '~30 min',
      topics: ['Standard Deviation', 'Skewness', 'Kurtosis']
    },
    {
      id: 5,
      title: 'Correlation Analysis',
      description: 'Study variable relationships using correlation methods and regression analysis.',
      icon: Users,
      path: '/chapter-5',
      color: 'from-red-500 to-red-600',
      duration: '~25 min',
      topics: ['Scatter Plots', 'Pearson Correlation', 'Rank Correlation']
    }
  ];

  const features = [
    {
      icon: Play,
      title: 'Interactive Learning',
      description: 'Step-by-step calculations with real-time feedback and visual demonstrations.'
    },
    {
      icon: BarChart3,
      title: 'Dynamic Visualizations',
      description: 'Beautiful charts that update instantly as you modify data and parameters.'
    },
    {
      icon: FileText,
      title: 'Data Import',
      description: 'Use our curated sample datasets for practice and analysis.'
    },
    {
      icon: FileText,
      title: 'Export Results',
      description: 'Download your analysis as PDF reports, Excel files, or high-quality images.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-700/30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Business Statistics Simulator
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100 font-medium">
              Interactive Learning Platform
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto text-blue-50 leading-relaxed">
              Master business statistics through hands-on simulations, real-time calculations, 
              and stunning visualizations. Perfect for B.Com students seeking excellence.
            </p>
            
            {/* Video Section */}
            <div className="mb-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-white text-center">
                🎥 Learn about this simulator
              </h3>
              
              {/* Language Selection Dropdown */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <label htmlFor="language-select" className="block text-sm font-medium text-blue-100 mb-2 text-center">
                    Select Video Language
                  </label>
                  <div className="relative">
                    <select
                      id="language-select"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pr-10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 hover:bg-white/20"
                    >
                      {videoOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Globe className="h-5 w-5 text-white/70" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Embed */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src={`${currentVideo.url}?rel=0&modestbranding=1`}
                  title={`Business Statistics Simulator Introduction - ${currentVideo.label}`}
                  className="w-full h-[400px] md:h-[450px] lg:h-[500px]"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/chapter-1"
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Start Learning Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Simulator?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of statistical education with our cutting-edge interactive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Learning Modules
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each chapter includes interactive tools, practice exercises, and real-world applications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {chapters.map((chapter) => {
              const Icon = chapter.icon;
              
              return (
                <Link
                  key={chapter.id}
                  to={chapter.path}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${chapter.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{chapter.duration}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm font-medium text-blue-600">Chapter {chapter.id}</span>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mt-1">
                        {chapter.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {chapter.description}
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Key Topics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {chapter.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            

          </div>
        </div>
      </div>


    </div>
  );
};

export default LandingPage;