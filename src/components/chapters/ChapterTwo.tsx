import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, LineChart, Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart as RechartsLineChart, Line, Histogram, Pie } from 'recharts';
import * as XLSX from 'xlsx';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

const ChapterTwo = () => {
  const [activeTab, setActiveTab] = useState('one-dimensional');
  const [chartType, setChartType] = useState('bar');
  const [data, setData] = useState<ChartData[]>([
    { name: 'Product A', value: 400 },
    { name: 'Product B', value: 300 },
    { name: 'Product C', value: 300 },
    { name: 'Product D', value: 200 },
  ]);
  const [customData, setCustomData] = useState('');
  const [frequencyData, setFrequencyData] = useState<ChartData[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<ChartData[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const tabs = [
    { id: 'one-dimensional', label: 'One-Dimensional Diagrams', icon: BarChart3 },
    { id: 'two-dimensional', label: 'Two-Dimensional Diagrams', icon: PieChart },
    { id: 'frequency', label: 'Frequency Distributions', icon: LineChart },
    { id: 'upload', label: 'Upload Data', icon: Upload }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // User cancelled file selection - reset state but don't show error
      setUploadStatus('idle');
      return;
    }

    setUploadStatus('loading');
    setUploadError('');
    setFileName(file.name);
    setDataPreview([]);

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
            // Try to parse as number, otherwise keep as string
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

      // Validate data structure
      const columns = Object.keys(jsonData[0]);
      if (columns.length < 2) {
        throw new Error('Data must have at least 2 columns. Expected format: Category,Value or Class,Frequency');
      }

      // Process data for charts
      const processedData: ChartData[] = [];
      
      // Dynamically find the first numeric column
      let numericCol = '';
      let categoryCol = '';
      
      // Check each column to find the first one with numeric data
      for (const col of columns) {
        let numericCount = 0;
        for (const row of jsonData) {
          const rawValue = row[col];
          const value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
          if (!isNaN(value) && isFinite(value)) {
            numericCount++;
          }
        }
        
        // If more than 50% of values in this column are numeric, use it as the value column
        if (numericCount > jsonData.length * 0.5 && !numericCol) {
          numericCol = col;
        }
      }
      
      // Find a suitable category column (preferably non-numeric)
      for (const col of columns) {
        if (col !== numericCol) {
          categoryCol = col;
          break;
        }
      }
      
      // Fallback: if no separate category column found, use the first column
      if (!categoryCol) {
        categoryCol = columns[0];
      }
      
      // If no numeric column found, throw error
      if (!numericCol) {
        throw new Error(`No numeric data found in any column. Please ensure at least one column contains valid numbers. Available columns: ${columns.join(', ')}`);
      }

      // Process the data using the identified columns
      let hasNumericData = false;
      let numericCount = 0;
      
      for (const row of jsonData) {
        const rawValue = row[numericCol];
        const value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
        
        if (!isNaN(value) && isFinite(value)) {
          hasNumericData = true;
          numericCount++;
          processedData.push({
            name: String(row[categoryCol] || 'Unknown'),
            value: value,
            ...row
          });
        } else if (rawValue !== null && rawValue !== undefined && String(rawValue).trim() !== '') {
          // Include non-numeric data but with value 0 for visualization
          processedData.push({
            name: String(row[categoryCol] || 'Unknown'),
            value: 0,
            originalValue: rawValue,
            ...row
          });
        }
      }

      if (numericCount < jsonData.length * 0.5) {
        console.warn(`Warning: Only ${numericCount} out of ${jsonData.length} rows contain numeric data in column "${numericCol}"`);
      }

      // Success - update state
      setUploadedData(processedData);
      setData(processedData);
      setDataPreview(jsonData.slice(0, 5)); // Show first 5 rows
      setUploadStatus('success');

      // Auto-switch to chart view after a brief delay
      setTimeout(() => {
        setActiveTab('one-dimensional');
      }, 2000);

    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'An error occurred while processing the file.');
      setUploadedData([]);
      setDataPreview([]);
      console.error('File upload error:', error);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadError('');
    setFileName('');
    setDataPreview([]);
    setUploadedData([]);
    // Force re-render of file input by changing key
    setFileInputKey(prev => prev + 1);
  };

  const processCustomData = () => {
    const lines = customData.split('\n').filter(line => line.trim());
    const processed = lines.map((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        return { name: parts[0], value: parseFloat(parts[1]) || 0 };
      }
      return { name: `Item ${index + 1}`, value: parseFloat(parts[0]) || 0 };
    });
    setData(processed);
  };

  const generateFrequencyData = () => {
    // Sample frequency distribution data
    const freqData = [
      { class: '10-20', frequency: 5, midpoint: 15 },
      { class: '20-30', frequency: 12, midpoint: 25 },
      { class: '30-40', frequency: 18, midpoint: 35 },
      { class: '40-50', frequency: 15, midpoint: 45 },
      { class: '50-60', frequency: 8, midpoint: 55 },
      { class: '60-70', frequency: 2, midpoint: 65 }
    ];
    setFrequencyData(freqData);
  };

  useEffect(() => {
    generateFrequencyData();
  }, []);

  const renderOneDimensional = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              chartType === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pie Chart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Chart Visualization</h3>
            <div className="h-80 bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' && data.length > 0 ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                ) : chartType === 'line' && data.length > 0 ? (
                  <RechartsLineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                  </RechartsLineChart>
                ) : chartType === 'pie' && data.length > 0 ? (
                  <RechartsPieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">No Data Available</p>
                      <p className="text-sm">Please add data using the input area or upload a file</p>
                    </div>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Data Input</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter data (Format: Label, Value per line)
                </label>
                <textarea
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                  placeholder="Product A, 400
Product B, 300
Product C, 300
Product D, 200"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={processCustomData}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Chart
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Chart Analysis</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Total Values: {data.length}</p>
                  <p>Sum: {data.reduce((sum, item) => sum + item.value, 0)}</p>
                  <p>Average: {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(2)}</p>
                  <p>Max: {Math.max(...data.map(item => item.value))}</p>
                  <p>Min: {Math.min(...data.map(item => item.value))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Chart Types Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-blue-600 mb-2">Bar Charts</h4>
            <p className="text-sm text-gray-600">Best for comparing quantities across categories. Shows discrete data clearly.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-green-600 mb-2">Line Charts</h4>
            <p className="text-sm text-gray-600">Ideal for showing trends over time or continuous data patterns.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-purple-600 mb-2">Pie Charts</h4>
            <p className="text-sm text-gray-600">Perfect for showing parts of a whole, proportions, and percentages.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTwoDimensional = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Two-Dimensional Diagrams</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Area-Based Representations</h3>
            <div className="space-y-4">
              {data.map((item, index) => {
                const maxValue = Math.max(...data.map(d => d.value));
                const width = (item.value / maxValue) * 200;
                const height = (item.value / maxValue) * 100;
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium">{item.name}</div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${width}px`, height: '30px' }}
                      >
                        {item.value}
                      </div>
                      <div className="text-sm text-gray-500">
                        {((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Pictogram Representation</h3>
            <div className="space-y-3">
              {data.map((item, index) => {
                const symbols = Math.ceil(item.value / 50); // Each symbol = 50 units
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium">{item.name}</div>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: symbols }, (_, i) => (
                        <div key={i} className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs">
                          ■
                        </div>
                      ))}
                      <span className="text-sm text-gray-600 ml-2">({item.value})</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">Each square represents 50 units</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Two-Dimensional Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-600 mb-2">Rectangles & Squares</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Area proportional to data values</li>
              <li>• Width and height both vary with data</li>
              <li>• Better visual impact than linear charts</li>
              <li>• Useful for comparative analysis</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-600 mb-2">Pictograms</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Uses pictures or symbols to represent data</li>
              <li>• Each symbol represents a fixed quantity</li>
              <li>• Easy to understand and appealing</li>
              <li>• Effective for public presentations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFrequency = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Frequency Distribution Graphs</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Histogram</h3>
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                {frequencyData.length > 0 ? (
                  <BarChart data={frequencyData} barCategoryGap={0}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#10B981" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Loading frequency data...</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Frequency Polygon</h3>
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                {frequencyData.length > 0 ? (
                  <RechartsLineChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="midpoint" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="frequency" stroke="#F59E0B" strokeWidth={3} />
                  </RechartsLineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Loading frequency data...</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Frequency Distribution Table</h3>
          {frequencyData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Class Interval</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Frequency</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Relative Frequency</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-900">Cumulative Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {frequencyData.map((row, index) => {
                    const total = frequencyData.reduce((sum, item) => sum + item.frequency, 0);
                    const relativeFreq = ((row.frequency / total) * 100).toFixed(1);
                    const cumulativeFreq = frequencyData
                      .slice(0, index + 1)
                      .reduce((sum, item) => sum + item.frequency, 0);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{row.class}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{row.frequency}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{relativeFreq}%</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{cumulativeFreq}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Loading frequency distribution table...</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Frequency Graph Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-green-600 mb-2">Histogram</h4>
            <p className="text-sm text-gray-600">Shows frequency distribution with adjacent bars. No gaps between bars for continuous data.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-orange-600 mb-2">Frequency Polygon</h4>
            <p className="text-sm text-gray-600">Line graph connecting midpoints of class intervals. Shows distribution shape clearly.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-purple-600 mb-2">Ogive (Cumulative)</h4>
            <p className="text-sm text-gray-600">Shows cumulative frequencies. Useful for finding median and percentiles.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Upload Data for Visualization</h2>
        
        {/* Upload Area */}
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
                  onClick={() => setActiveTab('one-dimensional')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  View Charts
                </button>
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
              <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
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
              <p className="text-sm text-gray-500 mb-6">Your data will be automatically processed for visualization</p>
              <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                Choose File
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && (
                <p className="text-sm text-gray-600 mt-2">Selected: {fileName}</p>
              )}
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
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Data Format Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">For Simple Charts:</h4>
            <div className="bg-white rounded-lg p-3 text-sm">
              <pre className="text-gray-700">
Category,Value
Product A,400
Product B,300
Product C,250
              </pre>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">For Frequency Distribution:</h4>
            <div className="bg-white rounded-lg p-3 text-sm">
              <pre className="text-gray-700">
Class,Frequency
10-20,5
20-30,12
30-40,18
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 2: Diagrams &amp; Graphic Presentation</h1>
        <p className="text-lg text-gray-600">
          Create visual representations of data using various charts, graphs, and diagrams.
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
          {activeTab === 'one-dimensional' && renderOneDimensional()}
          {activeTab === 'two-dimensional' && renderTwoDimensional()}
          {activeTab === 'frequency' && renderFrequency()}
          {activeTab === 'upload' && renderUpload()}
        </div>
      </div>
    </div>
  );
};

export default ChapterTwo;