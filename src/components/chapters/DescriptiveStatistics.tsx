import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, BarChart3, Upload, CheckCircle, FileText, Target, Activity } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BoxPlot } from 'recharts';
import * as XLSX from 'xlsx';

interface DataPoint {
  [key: string]: any;
  isOutlier?: boolean;
  outlierMethod?: string;
}

interface OutlierResult {
  index: number;
  value: number;
  method: string;
  zScore?: number;
  isOutlier: boolean;
}

const DescriptiveStatistics = () => {
  const [activeTab, setActiveTab] = useState('outlier-detection');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<DataPoint[]>([]);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [outlierMethod, setOutlierMethod] = useState<'zscore' | 'iqr'>('zscore');
  const [outlierResults, setOutlierResults] = useState<OutlierResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const tabs = [
    { id: 'outlier-detection', label: 'Outlier Detection', icon: AlertTriangle }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadStatus('idle');
      return;
    }

    setUploadStatus('loading');
    setUploadError('');
    setFileName(file.name);
    setDataPreview([]);
    setShowResults(false);

    try {
      // Validate file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        throw new Error(`Invalid file format "${fileExtension}". Please upload CSV (.csv) or Excel (.xlsx, .xls) files only.`);
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload files smaller than 10MB.');
      }

      // Read file
      const arrayBuffer = await file.arrayBuffer();
      let jsonData: any[] = [];

      if (fileExtension === '.csv') {
        // Handle CSV files
        const text = new TextDecoder().decode(arrayBuffer);
        const lines = text.trim().split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('File must contain at least a header row and one data row.');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        jsonData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            const value = values[index] || '';
            const numValue = parseFloat(value);
            obj[header] = !isNaN(numValue) && value !== '' ? numValue : value;
          });
          return obj;
        });
      } else {
        // Handle Excel files
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error('Excel file contains no worksheets.');
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      if (jsonData.length === 0) {
        throw new Error('The uploaded file appears to be empty.');
      }

      // Find numeric columns
      const columns = Object.keys(jsonData[0]);
      const numericColumns = columns.filter(col => {
        let numericCount = 0;
        for (const row of jsonData) {
          const rawValue = row[col];
          const value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
          if (!isNaN(value) && isFinite(value)) {
            numericCount++;
          }
        }
        return numericCount > jsonData.length * 0.5;
      });

      if (numericColumns.length === 0) {
        throw new Error(`No numeric columns found. Please ensure at least one column contains valid numbers. Available columns: ${columns.join(', ')}`);
      }

      // Success - update state
      setUploadedData(jsonData);
      setDataPreview(jsonData.slice(0, 5));
      setAvailableColumns(numericColumns);
      setSelectedColumn(numericColumns[0]);
      setUploadStatus('success');

    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'An error occurred while processing the file.');
      setUploadedData([]);
      setDataPreview([]);
      setAvailableColumns([]);
      console.error('File upload error:', error);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadError('');
    setFileName('');
    setDataPreview([]);
    setUploadedData([]);
    setAvailableColumns([]);
    setSelectedColumn('');
    setShowResults(false);
    setOutlierResults([]);
    setFileInputKey(prev => prev + 1);
  };

  const calculateZScoreOutliers = (data: number[], threshold: number = 2.5): OutlierResult[] => {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return data.map((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      return {
        index,
        value,
        method: 'Z-Score',
        zScore,
        isOutlier: zScore > threshold
      };
    });
  };

  const calculateIQROutliers = (data: number[]): OutlierResult[] => {
    const sortedData = [...data].sort((a, b) => a - b);
    const n = sortedData.length;
    
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sortedData[q1Index];
    const q3 = sortedData[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.map((value, index) => ({
      index,
      value,
      method: 'IQR',
      isOutlier: value < lowerBound || value > upperBound
    }));
  };

  const runOutlierDetection = () => {
    if (!selectedColumn || uploadedData.length === 0) return;

    const numericData = uploadedData
      .map(row => parseFloat(String(row[selectedColumn])))
      .filter(val => !isNaN(val) && isFinite(val));

    if (numericData.length === 0) {
      setUploadError('No valid numeric data found in selected column.');
      return;
    }

    let results: OutlierResult[];
    if (outlierMethod === 'zscore') {
      results = calculateZScoreOutliers(numericData);
    } else {
      results = calculateIQROutliers(numericData);
    }

    setOutlierResults(results);
    setShowResults(true);
  };

  const getOutlierStats = () => {
    if (outlierResults.length === 0) return null;

    const outlierCount = outlierResults.filter(r => r.isOutlier).length;
    const totalCount = outlierResults.length;
    const outlierPercentage = ((outlierCount / totalCount) * 100).toFixed(1);

    return {
      outlierCount,
      totalCount,
      outlierPercentage,
      cleanDataCount: totalCount - outlierCount
    };
  };

  const renderOutlierDetection = () => (
    <div className="space-y-8">
      {/* Outlier Detection Explanation */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">What are Outliers?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Definition:</h3>
              <p className="text-sm text-gray-700">
                Outliers are data points that significantly differ from other observations in a dataset. 
                They can be unusually high or low values that may indicate errors, special cases, or 
                important insights.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Types of Outliers:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Point Outliers:</strong> Individual data points that are anomalous</li>
                <li>• <strong>Contextual Outliers:</strong> Values that are unusual in specific contexts</li>
                <li>• <strong>Collective Outliers:</strong> Groups of data points that are anomalous together</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Detection Methods:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>IQR Method:</strong> Based on quartiles and interquartile range</li>
                <li>• <strong>Z-Score Method:</strong> Based on standard deviations from mean</li>
                <li>• <strong>Modified Z-Score:</strong> More robust version using median</li>
                <li>• <strong>Isolation Forest:</strong> Machine learning approach</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Upload className="h-6 w-6 mr-3 text-blue-600" />
          Upload Dataset for Outlier Analysis
        </h2>
        
        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          uploadStatus === 'loading' ? 'border-blue-400 bg-blue-50' :
          uploadStatus === 'success' ? 'border-green-400 bg-green-50' :
          uploadStatus === 'error' ? 'border-red-400 bg-red-50' :
          'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}>
          {uploadStatus === 'loading' ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-blue-700 font-medium">Processing {fileName}...</p>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-green-700 font-medium mb-2">Upload Successful ✅</p>
              <p className="text-green-600 text-sm mb-4">{fileName} - {uploadedData.length} records loaded</p>
              <div className="flex space-x-3">
                <button
                  onClick={resetUpload}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Upload Different File
                </button>
              </div>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
              <p className="text-red-700 font-medium mb-2">Upload Failed</p>
              <p className="text-red-600 text-sm mb-4">{uploadError}</p>
              <button
                onClick={resetUpload}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Upload CSV or Excel file</p>
              <p className="text-sm text-gray-500 mb-6">Your data will be analyzed for outliers</p>
              <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                Choose File
                <input
                  key={fileInputKey}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Data Preview */}
        {uploadStatus === 'success' && dataPreview.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Data Preview
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-blue-50">
                  <tr>
                    {Object.keys(dataPreview[0]).map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-sm font-medium text-blue-900">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataPreview.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-4 py-3 text-sm text-gray-900">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Showing first 5 rows of {uploadedData.length} total records
            </p>
          </div>
        )}

        {/* IQR Method Explanation */}
        <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📊 IQR Method for Outlier Detection</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">What is IQR?</h4>
                <p className="text-sm text-gray-700">
                  The Interquartile Range (IQR) is the difference between the 75th percentile (Q3) and 
                  the 25th percentile (Q1) of the data. It represents the spread of the middle 50% of the data.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Formula:</h4>
                <p className="font-mono bg-green-50 p-2 rounded text-sm">
                  IQR = Q3 - Q1
                </p>
                <p className="text-sm mt-2 text-gray-600">
                  Upper Fence = Q3 + (1.5 × IQR)<br/>
                  Lower Fence = Q1 - (1.5 × IQR)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Steps to Calculate:</h4>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Sort data in ascending order</li>
                  <li>2. Find Q1 (25th percentile)</li>
                  <li>3. Find Q3 (75th percentile)</li>
                  <li>4. Calculate IQR = Q3 - Q1</li>
                  <li>5. Set upper fence = Q3 + 1.5×IQR</li>
                  <li>6. Set lower fence = Q1 - 1.5×IQR</li>
                  <li>7. Identify outliers beyond fences</li>
                </ol>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Advantages:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Robust to extreme values</li>
                  <li>• Works well with skewed data</li>
                  <li>• Simple to understand and implement</li>
                  <li>• Standard method in statistics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Configuration */}
      {uploadStatus === 'success' && availableColumns.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Target className="h-6 w-6 mr-3 text-purple-600" />
            Configure Outlier Detection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Numeric Column
              </label>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detection Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="zscore"
                    checked={outlierMethod === 'zscore'}
                    onChange={(e) => setOutlierMethod(e.target.value as 'zscore')}
                    className="mr-2"
                  />
                  <span className="text-sm">Z-Score Method (|z| &gt; 2.5)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="iqr"
                    checked={outlierMethod === 'iqr'}
                    onChange={(e) => setOutlierMethod(e.target.value as 'iqr')}
                    className="mr-2"
                  />
                  <span className="text-sm">IQR Method (Q1 - 1.5×IQR, Q3 + 1.5×IQR)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={runOutlierDetection}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center"
            >
              <Activity className="h-5 w-5 mr-2" />
              Run Outlier Detection
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && outlierResults.length > 0 && (
        <div className="space-y-6">
          {/* Statistics Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-orange-600" />
              Outlier Detection Results
            </h2>

            {(() => {
              const stats = getOutlierStats();
              return stats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalCount}</p>
                    <p className="text-sm text-blue-700 font-medium">Total Records</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                    <p className="text-2xl font-bold text-red-600">{stats.outlierCount}</p>
                    <p className="text-sm text-red-700 font-medium">Outliers Found</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                    <p className="text-2xl font-bold text-green-600">{stats.cleanDataCount}</p>
                    <p className="text-sm text-green-700 font-medium">Clean Records</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{stats.outlierPercentage}%</p>
                    <p className="text-sm text-purple-700 font-medium">Outlier Rate</p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Index</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Method</th>
                    {outlierMethod === 'zscore' && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Z-Score</th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {outlierResults.map((result, index) => (
                    <tr 
                      key={index} 
                      className={`${result.isOutlier ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">{result.index + 1}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{result.value.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.method}</td>
                      {outlierMethod === 'zscore' && (
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">
                          {result.zScore?.toFixed(2)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm">
                        {result.isOutlier ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Outlier
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visualization */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Data Visualization</h3>
            <div className="h-80 bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="index" 
                    domain={[0, outlierResults.length]}
                    name="Index"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="value" 
                    name="Value"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Index: ${label}`}
                  />
                  <Scatter 
                    data={outlierResults.filter(r => !r.isOutlier)} 
                    fill="#10B981"
                    name="Normal Values"
                  />
                  <Scatter 
                    data={outlierResults.filter(r => r.isOutlier)} 
                    fill="#EF4444"
                    name="Outliers"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Normal Values</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Outliers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Method Information */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Outlier Detection Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Z-Score Method</h4>
            <p className="text-sm text-gray-600 mb-2">
              Identifies outliers based on how many standard deviations away from the mean a data point is.
            </p>
            <p className="text-xs text-gray-500">
              Formula: z = (x - μ) / σ<br/>
              Threshold: |z| &gt; 2.5 (configurable)
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">IQR Method</h4>
            <p className="text-sm text-gray-600 mb-2">
              Uses the interquartile range to identify outliers beyond Q1 - 1.5×IQR and Q3 + 1.5×IQR.
            </p>
            <p className="text-xs text-gray-500">
              More robust to extreme values<br/>
              Based on quartile positions
            </p>
          </div>
        </div>
      </div>

      {/* Business Applications Section */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-green-800 mb-3">💰 Financial & Fraud Detection</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>Credit Card Fraud:</strong> Detect unusual spending patterns and transactions</li>
              <li>• <strong>Insurance Claims:</strong> Identify suspicious or fraudulent claims</li>
              <li>• <strong>Stock Market:</strong> Detect unusual price movements and trading anomalies</li>
              <li>• <strong>Banking:</strong> Monitor for money laundering and unusual transactions</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-blue-800 mb-3">🏭 Manufacturing & Quality Control</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>Production Quality:</strong> Identify defective products and process issues</li>
              <li>• <strong>Equipment Monitoring:</strong> Detect machine failures and maintenance needs</li>
              <li>• <strong>Supply Chain:</strong> Monitor delivery times and inventory anomalies</li>
              <li>• <strong>Safety Monitoring:</strong> Detect workplace safety incidents</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Outlier Detection</h4>
          <p className="text-sm text-yellow-700">
            <strong>Best for:</strong> Data quality assessment, fraud detection, quality control, and identifying 
            unusual patterns that may indicate errors or important insights. <strong>Perfect for:</strong> 
            Financial monitoring, manufacturing quality control, customer behavior analysis, and any situation 
            where data consistency and quality are critical.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Outlier Detection</h1>
        <p className="text-lg text-gray-600">
          Advanced statistical analysis tools for data exploration and quality assessment.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
          {activeTab === 'outlier-detection' && renderOutlierDetection()}
        </div>
      </div>
    </div>
  );
};

export default DescriptiveStatistics;