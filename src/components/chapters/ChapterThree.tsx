import React, { useState } from 'react';
import { Calculator, BarChart3, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DataPoint {
  value: number;
  frequency?: number;
}

const ChapterThree = () => {
  const [activeTab, setActiveTab] = useState('arithmetic');
  const [dataInput, setDataInput] = useState('10, 12, 14, 16, 18, 20, 22, 24');
  const [frequencyInput, setFrequencyInput] = useState('2, 3, 5, 7, 6, 4, 2, 1');
  const [isGroupedData, setIsGroupedData] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showSteps, setShowSteps] = useState(false);

  const tabs = [
    { id: 'arithmetic', label: 'Arithmetic Mean', icon: Calculator },
    { id: 'geometric', label: 'Geometric Mean', icon: TrendingUp },
    { id: 'harmonic', label: 'Harmonic Mean', icon: TrendingUp },
    { id: 'median', label: 'Median & Mode', icon: BarChart3 },
    { id: 'quartiles', label: 'Quartiles & Percentiles', icon: FileText }
  ];

  const parseData = (): DataPoint[] => {
    const values = dataInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (isGroupedData && frequencyInput) {
      const frequencies = frequencyInput.split(',').map(f => parseInt(f.trim())).filter(f => !isNaN(f));
      return values.map((value, index) => ({
        value,
        frequency: frequencies[index] || 1
      }));
    }
    return values.map(value => ({ value, frequency: 1 }));
  };

  const calculateArithmeticMean = (data: DataPoint[]) => {
    const sum = data.reduce((acc, point) => acc + (point.value * point.frequency!), 0);
    const totalFreq = data.reduce((acc, point) => acc + point.frequency!, 0);
    return sum / totalFreq;
  };

  const calculateGeometricMean = (data: DataPoint[]) => {
    let product = 1;
    let totalFreq = 0;
    
    data.forEach(point => {
      for (let i = 0; i < point.frequency!; i++) {
        product *= point.value;
        totalFreq++;
      }
    });
    
    return Math.pow(product, 1 / totalFreq);
  };

  const calculateHarmonicMean = (data: DataPoint[]) => {
    const reciprocalSum = data.reduce((acc, point) => 
      acc + (point.frequency! / point.value), 0);
    const totalFreq = data.reduce((acc, point) => acc + point.frequency!, 0);
    return totalFreq / reciprocalSum;
  };

  const calculateMedian = (data: DataPoint[]) => {
    const expandedData = data.flatMap(point => 
      Array(point.frequency).fill(point.value)
    ).sort((a, b) => a - b);
    
    const n = expandedData.length;
    if (n % 2 === 0) {
      return (expandedData[n/2 - 1] + expandedData[n/2]) / 2;
    }
    return expandedData[Math.floor(n/2)];
  };

  const calculateMode = (data: DataPoint[]) => {
    const maxFreq = Math.max(...data.map(point => point.frequency!));
    const modes = data.filter(point => point.frequency === maxFreq);
    return modes.map(point => point.value);
  };

  const calculateQuartiles = (data: DataPoint[]) => {
    const expandedData = data.flatMap(point => 
      Array(point.frequency).fill(point.value)
    ).sort((a, b) => a - b);
    
    const n = expandedData.length;
    const q1Index = Math.floor((n + 1) / 4) - 1;
    const q3Index = Math.floor(3 * (n + 1) / 4) - 1;
    
    return {
      q1: expandedData[q1Index],
      q2: calculateMedian(data),
      q3: expandedData[q3Index]
    };
  };

  const calculatePercentile = (data: DataPoint[], percentile: number) => {
    const expandedData = data.flatMap(point => 
      Array(point.frequency).fill(point.value)
    ).sort((a, b) => a - b);
    
    const n = expandedData.length;
    const index = Math.floor((percentile / 100) * n);
    return expandedData[index];
  };

  const performCalculations = () => {
    const data = parseData();
    if (data.length === 0) return;

    const arithmeticMean = calculateArithmeticMean(data);
    const geometricMean = calculateGeometricMean(data);
    const harmonicMean = calculateHarmonicMean(data);
    const median = calculateMedian(data);
    const modes = calculateMode(data);
    const quartiles = calculateQuartiles(data);

    setResults({
      data,
      arithmeticMean,
      geometricMean,
      harmonicMean,
      median,
      modes,
      quartiles,
      percentiles: {
        p25: calculatePercentile(data, 25),
        p50: calculatePercentile(data, 50),
        p75: calculatePercentile(data, 75),
        p90: calculatePercentile(data, 90)
      }
    });
  };

  const renderArithmetic = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Arithmetic Mean Calculator</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={isGroupedData}
                  onChange={(e) => setIsGroupedData(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Grouped Data (with frequencies)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Values (comma-separated)
              </label>
              <input
                type="text"
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="10, 12, 14, 16, 18"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {isGroupedData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequencies (comma-separated)
                </label>
                <input
                  type="text"
                  value={frequencyInput}
                  onChange={(e) => setFrequencyInput(e.target.value)}
                  placeholder="2, 3, 5, 7, 6"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={performCalculations}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {showSteps ? 'Hide' : 'Show'} Steps
              </button>
            </div>
          </div>

          {results && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Results</h3>
              <div className="space-y-2 text-blue-800">
                <p><span className="font-medium">Arithmetic Mean:</span> {results.arithmeticMean.toFixed(2)}</p>
                <p><span className="font-medium">Geometric Mean:</span> {results.geometricMean.toFixed(2)}</p>
                <p><span className="font-medium">Harmonic Mean:</span> {results.harmonicMean.toFixed(2)}</p>
                <p><span className="font-medium">Median:</span> {results.median.toFixed(2)}</p>
                <p><span className="font-medium">Mode:</span> {results.modes.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {showSteps && results && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Step-by-Step Calculation</h3>
            <div className="space-y-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-blue-600 mb-2">Arithmetic Mean Formula:</h4>
                <p className="font-mono bg-blue-50 p-2 rounded">
                  Mean = Σ(f × x) / Σf
                </p>
                <p className="mt-2">
                  Where f = frequency, x = value
                </p>
                <div className="mt-2">
                  <p>Calculation:</p>
                  <p>Σ(f × x) = {results.data.map((d: any) => `${d.frequency} × ${d.value}`).join(' + ')} 
                     = {results.data.reduce((sum: number, d: any) => sum + (d.frequency * d.value), 0)}</p>
                  <p>Σf = {results.data.reduce((sum: number, d: any) => sum + d.frequency, 0)}</p>
                  <p>Mean = {results.arithmeticMean.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-green-800 mb-3">💰 Financial Analysis</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Average Revenue:</strong> Calculate mean monthly sales across different regions</li>
                <li>• <strong>Portfolio Returns:</strong> Determine average investment returns over time</li>
                <li>• <strong>Cost Analysis:</strong> Find average production costs per unit</li>
                <li>• <strong>Pricing Strategy:</strong> Set competitive prices based on market averages</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-800 mb-3">📈 Performance Metrics</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Employee Productivity:</strong> Measure average output per worker</li>
                <li>• <strong>Customer Satisfaction:</strong> Calculate mean ratings from surveys</li>
                <li>• <strong>Quality Control:</strong> Monitor average defect rates in manufacturing</li>
                <li>• <strong>Service Delivery:</strong> Track average response times</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Arithmetic Mean</h4>
            <p className="text-sm text-yellow-700">
              <strong>Best for:</strong> Data that is normally distributed, when you need a representative central value, 
              and when all values are equally important. <strong>Avoid when:</strong> Data has extreme outliers 
              or is heavily skewed, as the mean can be misleading.
            </p>
          </div>
        </div>
      </div>

      {results && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Data Visualization</h3>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="value" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#3B82F6" />
                <ReferenceLine 
                  x={results.arithmeticMean} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  label={{ value: "Mean", position: "top" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  const renderGeometric = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Geometric Mean</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Definition & Formula</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium mb-2">Formula:</h4>
                  <p className="font-mono bg-green-50 p-2 rounded text-sm">
                    GM = ⁿ√(x₁ × x₂ × ... × xₙ)
                  </p>
                  <p className="text-sm mt-2 text-gray-600">
                    Where n is the number of observations
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium mb-2">Key Characteristics:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Always ≤ Arithmetic Mean</li>
                    <li>• Best for multiplicative relationships</li>
                    <li>• Handles zero and negative values carefully</li>
                    <li>• Preserves relative changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {results && (
              <div className="bg-green-100 rounded-lg p-6 border border-green-300">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Calculation Result</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700 mb-2">
                    {results.geometricMean.toFixed(4)}
                  </p>
                  <p className="text-green-800">Geometric Mean</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Comparison with Other Means</h3>
              {results && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Arithmetic Mean:</span>
                    <span className="font-medium text-blue-700">{results.arithmeticMean.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Geometric Mean:</span>
                    <span className="font-medium text-green-700">{results.geometricMean.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Difference:</span>
                    <span className="font-medium text-gray-700">{(results.arithmeticMean - results.geometricMean).toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {results && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Mean Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <h4 className="font-medium text-blue-900">Arithmetic Mean</h4>
                <p className="text-2xl font-bold text-blue-700">{results.arithmeticMean.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <h4 className="font-medium text-green-900">Geometric Mean</h4>
                <p className="text-2xl font-bold text-green-700">{results.geometricMean.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <h4 className="font-medium text-purple-900">Harmonic Mean</h4>
                <p className="text-2xl font-bold text-purple-700">{results.harmonicMean.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Generally: Arithmetic Mean ≥ Geometric Mean ≥ Harmonic Mean
            </p>
          </div>
        )}

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-green-800 mb-3">📈 Growth & Investment Analysis</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Compound Growth Rates:</strong> Calculate average annual growth over multiple periods</li>
                <li>• <strong>Investment Returns:</strong> Determine geometric mean return for portfolio performance</li>
                <li>• <strong>Population Growth:</strong> Measure sustainable growth rates in demographics</li>
                <li>• <strong>Inflation Rates:</strong> Calculate average inflation over time periods</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-emerald-800 mb-3">🏭 Manufacturing & Quality</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Production Ratios:</strong> Average efficiency ratios across production lines</li>
                <li>• <strong>Quality Metrics:</strong> Geometric mean of quality scores over time</li>
                <li>• <strong>Yield Rates:</strong> Average yield percentages in manufacturing processes</li>
                <li>• <strong>Performance Indices:</strong> Composite performance measures</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Geometric Mean</h4>
            <p className="text-sm text-yellow-700">
              <strong>Best for:</strong> Multiplicative relationships, growth rates, ratios, and when dealing with 
              percentage changes. <strong>Perfect for:</strong> Financial returns, population growth, and any 
              situation where values multiply rather than add.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHarmonic = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Harmonic Mean</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Definition & Formula</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium mb-2">Formula:</h4>
                  <p className="font-mono bg-purple-50 p-2 rounded text-sm">
                    HM = n / Σ(1/xᵢ)
                  </p>
                  <p className="text-sm mt-2 text-gray-600">
                    Where n is the number of observations
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium mb-2">Key Characteristics:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Always ≤ Geometric Mean</li>
                    <li>• Best for rates and ratios</li>
                    <li>• Sensitive to extreme values</li>
                    <li>• Used for average speeds and rates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {results && (
              <div className="bg-purple-100 rounded-lg p-6 border border-purple-300">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Calculation Result</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-700 mb-2">
                    {results.harmonicMean.toFixed(4)}
                  </p>
                  <p className="text-purple-800">Harmonic Mean</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Comparison with Other Means</h3>
              {results && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Arithmetic Mean:</span>
                    <span className="font-medium text-blue-700">{results.arithmeticMean.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Geometric Mean:</span>
                    <span className="font-medium text-green-700">{results.geometricMean.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Harmonic Mean:</span>
                    <span className="font-medium text-purple-700">{results.harmonicMean.toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-purple-800 mb-3">🚗 Transportation & Logistics</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Average Speed:</strong> Calculate mean speed for round trips with different speeds</li>
                <li>• <strong>Delivery Times:</strong> Average delivery times across different routes</li>
                <li>• <strong>Fuel Efficiency:</strong> Average fuel consumption rates</li>
                <li>• <strong>Travel Time:</strong> Average time for multi-leg journeys</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-pink-800 mb-3">⚡ Rates & Efficiency</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Production Rates:</strong> Average production efficiency across shifts</li>
                <li>• <strong>Service Rates:</strong> Average customer service response times</li>
                <li>• <strong>Processing Rates:</strong> Average data processing speeds</li>
                <li>• <strong>Conversion Rates:</strong> Average conversion rates across campaigns</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Harmonic Mean</h4>
            <p className="text-sm text-yellow-700">
              <strong>Best for:</strong> Rates, speeds, and situations where you're dealing with reciprocals. 
              <strong>Perfect for:</strong> Average speeds, average rates, and when values represent 
              "per unit" measurements like miles per hour or items per hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedian = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Median & Mode Analysis</h2>
        
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">Median</h3>
              <p className="text-2xl font-bold text-orange-700 mb-4">{results.median.toFixed(2)}</p>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-2">Definition:</h4>
                <p className="text-sm text-gray-600">
                  The middle value when data is arranged in ascending order.
                </p>
                <div className="mt-2">
                  <p className="text-sm font-medium">Position Formula:</p>
                  <p className="font-mono bg-orange-50 p-2 rounded text-sm">
                    Position = (n + 1) / 2
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
              <h3 className="text-lg font-semibold text-pink-900 mb-4">Mode</h3>
              <p className="text-2xl font-bold text-pink-700 mb-4">
                {results.modes.length === 1 ? results.modes[0] : results.modes.join(', ')}
              </p>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-2">Definition:</h4>
                <p className="text-sm text-gray-600">
                  The value(s) that appear most frequently in the dataset.
                </p>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-medium">Type:</span> 
                    {results.modes.length === 1 ? ' Unimodal' : 
                     results.modes.length === 2 ? ' Bimodal' : 
                     ' Multimodal'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Sorted Data Visualization</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {results.data
                  .flatMap((point: any) => Array(point.frequency).fill(point.value))
                  .sort((a: number, b: number) => a - b)
                  .map((value: number, index: number) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        value === results.median ? 'bg-orange-200 text-orange-800' :
                        results.modes.includes(value) ? 'bg-pink-200 text-pink-800' :
                        'bg-blue-200 text-blue-800'
                      }`}
                    >
                      {value}
                    </span>
                  ))}
              </div>
              <div className="mt-4 flex space-x-4 text-sm">
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-orange-200 rounded mr-2"></span>
                  Median
                </span>
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-pink-200 rounded mr-2"></span>
                  Mode
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-orange-800 mb-3">📊 Median Applications</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Salary Analysis:</strong> Find typical employee compensation (resistant to outliers)</li>
                <li>• <strong>Real Estate:</strong> Determine median home prices in neighborhoods</li>
                <li>• <strong>Customer Spending:</strong> Identify typical customer purchase amounts</li>
                <li>• <strong>Performance Metrics:</strong> Find typical employee productivity levels</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-pink-800 mb-3">🎯 Mode Applications</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Product Preferences:</strong> Identify most popular product choices</li>
                <li>• <strong>Service Issues:</strong> Find most common customer complaints</li>
                <li>• <strong>Inventory Management:</strong> Stock most frequently ordered items</li>
                <li>• <strong>Marketing Campaigns:</strong> Target most common customer segments</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Median vs Mode</h4>
            <p className="text-sm text-yellow-700">
              <strong>Use Median:</strong> When data is skewed or has outliers, for ordinal data, and when you need 
              a representative central value. <strong>Use Mode:</strong> For categorical data, to identify 
              most common occurrences, and when you need to understand frequency patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuartiles = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Quartiles & Percentiles</h2>
        
        {results && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-200">
                <h3 className="font-medium text-indigo-900">Q1 (25th Percentile)</h3>
                <p className="text-2xl font-bold text-indigo-700">{results.quartiles.q1}</p>
              </div>
              <div className="bg-indigo-100 rounded-lg p-4 text-center border border-indigo-300">
                <h3 className="font-medium text-indigo-900">Q2 (Median)</h3>
                <p className="text-2xl font-bold text-indigo-700">{results.quartiles.q2.toFixed(2)}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-200">
                <h3 className="font-medium text-indigo-900">Q3 (75th Percentile)</h3>
                <p className="text-2xl font-bold text-indigo-700">{results.quartiles.q3}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Common Percentiles</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">25th Percentile</p>
                  <p className="text-xl font-bold text-gray-900">{results.percentiles.p25}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">50th Percentile</p>
                  <p className="text-xl font-bold text-gray-900">{results.percentiles.p50}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">75th Percentile</p>
                  <p className="text-xl font-bold text-gray-900">{results.percentiles.p75}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">90th Percentile</p>
                  <p className="text-xl font-bold text-gray-900">{results.percentiles.p90}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Interquartile Range (IQR)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-green-800 mb-2">
                    <span className="font-medium">IQR = Q3 - Q1 = </span>
                    {results.quartiles.q3} - {results.quartiles.q1} = {results.quartiles.q3 - results.quartiles.q1}
                  </p>
                  <p className="text-sm text-green-700">
                    The IQR represents the range of the middle 50% of the data.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium mb-2">Uses of IQR:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Measure of spread</li>
                    <li>• Outlier detection</li>
                    <li>• Box plot construction</li>
                    <li>• Robust to extreme values</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-indigo-800 mb-3">📊 Quartile Analysis</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Performance Ranking:</strong> Classify employees into performance quartiles</li>
                <li>• <strong>Customer Segmentation:</strong> Divide customers by spending levels</li>
                <li>• <strong>Quality Control:</strong> Identify products in top/bottom quality quartiles</li>
                <li>• <strong>Risk Assessment:</strong> Categorize investments by risk levels</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-800 mb-3">🎯 Percentile Applications</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Salary Benchmarking:</strong> Compare compensation to industry percentiles</li>
                <li>• <strong>Academic Performance:</strong> Rank students by percentile scores</li>
                <li>• <strong>Market Analysis:</strong> Position products in market percentiles</li>
                <li>• <strong>Service Standards:</strong> Set response time targets by percentiles</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Quartiles & Percentiles</h4>
            <p className="text-sm text-yellow-700">
              <strong>Best for:</strong> Understanding data distribution, identifying outliers, ranking and 
              benchmarking, and creating performance categories. <strong>Perfect for:</strong> Performance 
              evaluations, customer segmentation, quality control, and any analysis requiring relative positioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 3: Measures of Central Tendency</h1>
        <p className="text-lg text-gray-600">
          Calculate and understand different measures of central tendency and position.
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
          {activeTab === 'arithmetic' && renderArithmetic()}
          {activeTab === 'geometric' && renderGeometric()}
          {activeTab === 'harmonic' && renderHarmonic()}
          {activeTab === 'median' && renderMedian()}
          {activeTab === 'quartiles' && renderQuartiles()}
        </div>
      </div>
    </div>
  );
};

export default ChapterThree;