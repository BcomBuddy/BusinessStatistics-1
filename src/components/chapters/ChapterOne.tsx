import React, { useState } from 'react';
import { BookOpen, CheckCircle, AlertTriangle, BarChart } from 'lucide-react';

const ChapterOne = () => {
  const [activeTab, setActiveTab] = useState('introduction');
  const [classificationData, setClassificationData] = useState('');
  const [classificationResults, setClassificationResults] = useState<any>(null);

  const tabs = [
    { id: 'introduction', label: 'Introduction to Statistics', icon: BookOpen },
    { id: 'classification', label: 'Data Classification', icon: BarChart },
    { id: 'tabulation', label: 'Data Tabulation', icon: CheckCircle }
  ];

  const handleClassification = () => {
    const data = classificationData.split('\n').filter(line => line.trim());
    
    const results = {
      primaryData: [],
      secondaryData: [],
      continuousData: [],
      discreteData: []
    };

    // Simple classification logic (for demonstration)
    data.forEach(item => {
      const trimmed = item.trim();
      if (trimmed.includes('survey') || trimmed.includes('interview')) {
        results.primaryData.push(trimmed);
      } else {
        results.secondaryData.push(trimmed);
      }

      if (trimmed.match(/\d+\.\d+/) || trimmed.includes('height') || trimmed.includes('weight')) {
        results.continuousData.push(trimmed);
      } else {
        results.discreteData.push(trimmed);
      }
    });

    setClassificationResults(results);
  };

  const renderIntroduction = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">What is Statistics?</h2>
        <p className="text-blue-800 text-lg leading-relaxed">
          Statistics is the science of collecting, analyzing, interpreting, and presenting data. 
          It provides tools and methods to make sense of numerical information and draw meaningful 
          conclusions from complex datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">Importance of Statistics</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Decision making in business and research</li>
            <li>• Quality control and process improvement</li>
            <li>• Market research and customer analysis</li>
            <li>• Risk assessment and management</li>
            <li>• Scientific research validation</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">Scope of Statistics</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Business and economics</li>
            <li>• Healthcare and medicine</li>
            <li>• Social sciences and psychology</li>
            <li>• Engineering and technology</li>
            <li>• Government and public policy</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">Limitations</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Does not deal with individual cases</li>
            <li>• Results are true on average</li>
            <li>• Can be misused or misinterpreted</li>
            <li>• Requires adequate sample size</li>
            <li>• Subject to sampling errors</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">Types of Statistics</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-blue-600">Descriptive Statistics</h4>
              <p className="text-sm text-gray-600">Summarizes and describes data</p>
            </div>
            <div>
              <h4 className="font-medium text-green-600">Inferential Statistics</h4>
              <p className="text-sm text-gray-600">Makes predictions and inferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClassification = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Classification Practice</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter sample data items (one per line):
          </label>
          <textarea
            value={classificationData}
            onChange={(e) => setClassificationData(e.target.value)}
            placeholder="Example:
Height: 175.5 cm
Number of students: 25
Survey responses from customers
Government census data
Weight: 68.2 kg"
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleClassification}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Classify Data
          </button>
        </div>

        {classificationResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Primary Data</h3>
                <ul className="text-sm text-blue-800">
                  {classificationResults.primaryData.length > 0 
                    ? classificationResults.primaryData.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))
                    : <li className="text-gray-500">No primary data identified</li>
                  }
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Secondary Data</h3>
                <ul className="text-sm text-green-800">
                  {classificationResults.secondaryData.length > 0
                    ? classificationResults.secondaryData.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))
                    : <li className="text-gray-500">No secondary data identified</li>
                  }
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Continuous Data</h3>
                <ul className="text-sm text-purple-800">
                  {classificationResults.continuousData.length > 0
                    ? classificationResults.continuousData.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))
                    : <li className="text-gray-500">No continuous data identified</li>
                  }
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2">Discrete Data</h3>
                <ul className="text-sm text-orange-800">
                  {classificationResults.discreteData.length > 0
                    ? classificationResults.discreteData.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))
                    : <li className="text-gray-500">No discrete data identified</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Data Types Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-600 mb-2">By Source</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Primary Data:</span> Original data collected firsthand
              </div>
              <div>
                <span className="font-medium">Secondary Data:</span> Data obtained from existing sources
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-green-600 mb-2">By Nature</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Continuous Data:</span> Can take any value within a range
              </div>
              <div>
                <span className="font-medium">Discrete Data:</span> Takes distinct, separate values
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabulation = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Tabulation & Frequency Distribution</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Sample Frequency Distribution</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Age Group</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Frequency</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { group: '18-25', frequency: 15, percentage: 30 },
                    { group: '26-35', frequency: 20, percentage: 40 },
                    { group: '36-45', frequency: 10, percentage: 20 },
                    { group: '46-55', frequency: 5, percentage: 10 }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.group}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.frequency}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">50</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600">Key Concepts</h3>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Class Interval</h4>
                <p className="text-sm text-green-800">
                  The range of values that defines each group (e.g., 18-25, 26-35)
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Frequency</h4>
                <p className="text-sm text-blue-800">
                  The number of observations in each class interval
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Relative Frequency</h4>
                <p className="text-sm text-purple-800">
                  The proportion or percentage of total observations in each class
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 1: Introduction to Statistics</h1>
        <p className="text-lg text-gray-600">
          Learn the fundamentals of statistics, data types, and basic organization methods.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'introduction' && renderIntroduction()}
          {activeTab === 'classification' && renderClassification()}
          {activeTab === 'tabulation' && renderTabulation()}
        </div>
      </div>
    </div>
  );
};

export default ChapterOne;