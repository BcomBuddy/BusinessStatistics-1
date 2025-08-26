import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, BarChart3, Calculator, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Dataset {
  name: string;
  data: any[];
  columns: string[];
  numericalColumns: string[];
}

const DataUpload = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const sampleDatasets = [
    {
      name: 'Student Performance Analysis',
      description: 'Academic performance data with grades across multiple subjects',
      data: [
        { Student: 'Alice Johnson', Math: 92, Science: 88, English: 85, History: 90, GPA: 3.8 },
        { Student: 'Bob Smith', Math: 78, Science: 82, English: 76, History: 80, GPA: 3.2 },
        { Student: 'Carol Wilson', Math: 95, Science: 91, English: 89, History: 94, GPA: 4.0 },
        { Student: 'David Brown', Math: 82, Science: 85, English: 88, History: 83, GPA: 3.4 },
        { Student: 'Eva Davis', Math: 88, Science: 90, English: 92, History: 87, GPA: 3.7 },
        { Student: 'Frank Miller', Math: 75, Science: 78, English: 80, History: 77, GPA: 3.0 },
        { Student: 'Grace Lee', Math: 96, Science: 94, English: 91, History: 93, GPA: 3.9 },
        { Student: 'Henry Taylor', Math: 84, Science: 87, English: 83, History: 85, GPA: 3.5 }
      ],
      category: 'Academic'
    },
    {
      name: 'Sales Performance Data',
      description: 'Monthly sales data with profit margins and regional performance',
      data: [
        { Month: 'January', Sales: 45000, Profit: 9000, Region: 'North', Employees: 25 },
        { Month: 'February', Sales: 52000, Profit: 11500, Region: 'North', Employees: 28 },
        { Month: 'March', Sales: 48000, Profit: 10200, Region: 'South', Employees: 26 },
        { Month: 'April', Sales: 61000, Profit: 14000, Region: 'East', Employees: 32 },
        { Month: 'May', Sales: 55000, Profit: 12800, Region: 'West', Employees: 30 },
        { Month: 'June', Sales: 67000, Profit: 15500, Region: 'North', Employees: 35 },
        { Month: 'July', Sales: 59000, Profit: 13200, Region: 'South', Employees: 31 },
        { Month: 'August', Sales: 63000, Profit: 14800, Region: 'East', Employees: 33 }
      ],
      category: 'Business'
    },
    {
      name: 'Employee Survey Results',
      description: 'Satisfaction ratings and demographic data from employee survey',
      data: [
        { Department: 'Engineering', Satisfaction: 4.2, Experience: 5.5, Salary: 75000, Age: 32 },
        { Department: 'Marketing', Satisfaction: 3.8, Experience: 3.2, Salary: 58000, Age: 28 },
        { Department: 'Sales', Satisfaction: 4.0, Experience: 4.1, Salary: 52000, Age: 30 },
        { Department: 'HR', Satisfaction: 3.9, Experience: 6.2, Salary: 61000, Age: 35 },
        { Department: 'Finance', Satisfaction: 4.1, Experience: 4.8, Salary: 68000, Age: 33 },
        { Department: 'Operations', Satisfaction: 3.7, Experience: 3.5, Salary: 55000, Age: 29 },
        { Department: 'IT', Satisfaction: 4.3, Experience: 4.9, Salary: 72000, Age: 31 },
        { Department: 'Legal', Satisfaction: 3.6, Experience: 7.1, Salary: 85000, Age: 38 }
      ],
      category: 'Survey'
    },
    {
      name: 'Product Quality Metrics',
      description: 'Manufacturing quality control data with defect rates and costs',
      data: [
        { Product: 'Widget A', DefectRate: 2.1, Cost: 15.50, Production: 1200, Rating: 4.5 },
        { Product: 'Widget B', DefectRate: 1.8, Cost: 22.30, Production: 950, Rating: 4.2 },
        { Product: 'Widget C', DefectRate: 3.2, Cost: 18.75, Production: 1100, Rating: 3.8 },
        { Product: 'Widget D', DefectRate: 1.5, Cost: 28.90, Production: 850, Rating: 4.7 },
        { Product: 'Widget E', DefectRate: 2.7, Cost: 16.20, Production: 1300, Rating: 4.1 },
        { Product: 'Widget F', DefectRate: 2.0, Cost: 24.60, Production: 1000, Rating: 4.4 },
        { Product: 'Widget G', DefectRate: 1.9, Cost: 19.80, Production: 1150, Rating: 4.3 },
        { Product: 'Widget H', DefectRate: 2.4, Cost: 21.40, Production: 1075, Rating: 4.0 }
      ],
      category: 'Quality'
    }
  ];

  const handleFile = useCallback((file: File) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setError('The file appears to be empty.');
          setLoading(false);
          return;
        }

        const columns = Object.keys(jsonData[0] as object);
        const numericalColumns = columns.filter(col => 
          jsonData.some(row => typeof (row as any)[col] === 'number')
        );
        
        setDataset({
          name: file.name,
          data: jsonData,
          columns,
          numericalColumns
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error reading file. Please ensure it\'s a valid Excel or CSV file.');
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file && (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFile(file);
    } else {
      setError('Please upload a CSV or Excel file.');
    }
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const loadSampleDataset = (sampleData: any) => {
    const columns = Object.keys(sampleData.data[0]);
    const numericalColumns = columns.filter(col => 
      sampleData.data.some((row: any) => typeof row[col] === 'number')
    );
    
    setDataset({
      name: sampleData.name,
      data: sampleData.data,
      columns,
      numericalColumns
    });
  };

  const exportData = () => {
    if (!dataset) return;

    const ws = XLSX.utils.json_to_sheet(dataset.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${dataset.name}_processed.xlsx`);
  };

  const getDataInsights = (data: any[]) => {
    const insights = [];
    const sampleSize = data.length;
    const columnCount = Object.keys(data[0] || {}).length;
    
    if (sampleSize < 30) {
      insights.push({ type: 'warning', message: 'Small sample size - consider collecting more data for reliable analysis.' });
    }
    if (sampleSize >= 100) {
      insights.push({ type: 'success', message: 'Large sample size - excellent for statistical analysis.' });
    }
    if (columnCount > 10) {
      insights.push({ type: 'info', message: 'Multiple variables available - perfect for correlation analysis.' });
    }
    
    return insights;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-3">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Upload & Management</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload your datasets or explore our carefully curated sample data to practice statistical analysis across all modules.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Upload Section */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Upload className="h-6 w-6 mr-3 text-blue-600" />
            Upload Your Dataset
          </h2>

          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
          >
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-6 mb-6">
                <FileSpreadsheet className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                Drag & drop your file here
              </h3>
              <p className="text-gray-500 mb-6 text-lg">
                Supports CSV, XLS, and XLSX files up to 10MB
              </p>
              
              <label className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 cursor-pointer inline-block font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Choose File
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {loading && (
            <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 font-medium">Processing your file...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-6 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ready to Analyze?</h3>
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-green-100 mb-4">
              Once you upload data, you can use it across all statistical modules.
            </p>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm font-medium mb-2">Available Tools:</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  <span>Central Tendency</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span>Correlation Analysis</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span>Visualizations</span>
                </div>
              </div>
            </div>
          </div>

          {dataset && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">Data Loaded!</h3>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800">Quick Analysis:</div>
                  <div className="text-sm text-green-700 mt-1">
                    {dataset.data.length} records • {dataset.numericalColumns.length} numerical columns
                  </div>
                </div>
                {getDataInsights(dataset.data).map((insight, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm ${
                    insight.type === 'success' ? 'bg-green-50 text-green-700' :
                    insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {insight.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sample Datasets */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <FileSpreadsheet className="h-6 w-6 mr-3 text-green-600" />
          Explore Sample Datasets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleDatasets.map((sample, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {sample.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                    {sample.category}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {sample.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{sample.data.length}</span> records • 
                  <span className="font-medium ml-1">{Object.keys(sample.data[0]).length}</span> columns
                </div>
                <button
                  onClick={() => loadSampleDataset(sample)}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Load Dataset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Preview */}
      {dataset && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
              Dataset Preview: {dataset.name}
            </h2>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">{dataset.data.length}</p>
              <p className="text-sm text-blue-700 font-medium">Total Records</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <p className="text-3xl font-bold text-green-600">{dataset.columns.length}</p>
              <p className="text-sm text-green-700 font-medium">Total Columns</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">{dataset.numericalColumns.length}</p>
              <p className="text-sm text-purple-700 font-medium">Numerical Columns</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
              <p className="text-3xl font-bold text-orange-600">
                {((dataset.numericalColumns.length / dataset.columns.length) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-orange-700 font-medium">Numerical Data</p>
            </div>
          </div>

          {dataset.numericalColumns.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Numerical Columns Available for Analysis:</h3>
              <div className="flex flex-wrap gap-2">
                {dataset.numericalColumns.map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {dataset.columns.map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{col}</span>
                        {dataset.numericalColumns.includes(col) && (
                          <Calculator className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataset.data.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {dataset.columns.map((col) => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={dataset.numericalColumns.includes(col) ? 'font-mono' : ''}>
                          {row[col]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {dataset.data.length > 10 && (
              <div className="bg-gray-50 px-6 py-3 text-center">
                <p className="text-sm text-gray-500">
                  Showing first 10 of <span className="font-medium">{dataset.data.length}</span> records
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUpload;