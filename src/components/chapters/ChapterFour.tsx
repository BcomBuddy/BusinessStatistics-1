import React, { useState } from 'react';
import { TrendingUp, BarChart3, Activity, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface DataPoint {
  value: number;
  frequency: number;
}

const ChapterFour = () => {
  const [activeTab, setActiveTab] = useState('dispersion');
  const [dataInput, setDataInput] = useState('10, 15, 20, 25, 30, 35, 40');
  const [frequencyInput, setFrequencyInput] = useState('2, 4, 6, 8, 6, 4, 2');
  const [results, setResults] = useState<any>(null);
  const [showCalculations, setShowCalculations] = useState(false);

  const tabs = [
    { id: 'dispersion', label: 'Measures of Dispersion', icon: TrendingUp },
    { id: 'skewness', label: 'Skewness', icon: BarChart3 },
    { id: 'kurtosis', label: 'Kurtosis', icon: Activity },
    { id: 'analysis', label: 'Distribution Analysis', icon: Target }
  ];

  const parseData = (): DataPoint[] => {
    const values = dataInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const frequencies = frequencyInput.split(',').map(f => parseInt(f.trim())).filter(f => !isNaN(f));
    
    return values.map((value, index) => ({
      value,
      frequency: frequencies[index] || 1
    }));
  };

  const calculateMean = (data: DataPoint[]): number => {
    const sum = data.reduce((acc, point) => acc + (point.value * point.frequency), 0);
    const totalFreq = data.reduce((acc, point) => acc + point.frequency, 0);
    return sum / totalFreq;
  };

  const calculateVariance = (data: DataPoint[], mean: number): number => {
    const sumSquaredDeviations = data.reduce((acc, point) => 
      acc + (point.frequency * Math.pow(point.value - mean, 2)), 0);
    const totalFreq = data.reduce((acc, point) => acc + point.frequency, 0);
    return sumSquaredDeviations / totalFreq;
  };

  const calculateStandardDeviation = (variance: number): number => {
    return Math.sqrt(variance);
  };

  const calculateRange = (data: DataPoint[]): number => {
    const values = data.map(point => point.value);
    return Math.max(...values) - Math.min(...values);
  };

  const calculateMeanDeviation = (data: DataPoint[], mean: number): number => {
    const sumAbsDeviations = data.reduce((acc, point) => 
      acc + (point.frequency * Math.abs(point.value - mean)), 0);
    const totalFreq = data.reduce((acc, point) => acc + point.frequency, 0);
    return sumAbsDeviations / totalFreq;
  };

  const calculateSkewness = (data: DataPoint[], mean: number, stdDev: number): any => {
    const totalFreq = data.reduce((acc, point) => acc + point.frequency, 0);
    
    // Karl Pearson's coefficient of skewness (using mean and mode)
    const mode = data.reduce((a, b) => a.frequency > b.frequency ? a : b).value;
    const pearsonSkewness = (mean - mode) / stdDev;
    
    // Moment coefficient of skewness
    const sumCubedDeviations = data.reduce((acc, point) => 
      acc + (point.frequency * Math.pow(point.value - mean, 3)), 0);
    const momentSkewness = sumCubedDeviations / (totalFreq * Math.pow(stdDev, 3));
    
    return {
      pearson: pearsonSkewness,
      moment: momentSkewness,
      mode: mode
    };
  };

  const calculateKurtosis = (data: DataPoint[], mean: number, stdDev: number): number => {
    const totalFreq = data.reduce((acc, point) => acc + point.frequency, 0);
    const sumFourthPowerDeviations = data.reduce((acc, point) => 
      acc + (point.frequency * Math.pow(point.value - mean, 4)), 0);
    
    return (sumFourthPowerDeviations / (totalFreq * Math.pow(stdDev, 4))) - 3;
  };

  const performCalculations = () => {
    const data = parseData();
    if (data.length === 0) return;

    const mean = calculateMean(data);
    const variance = calculateVariance(data, mean);
    const stdDev = calculateStandardDeviation(variance);
    const range = calculateRange(data);
    const meanDeviation = calculateMeanDeviation(data, mean);
    const coefficientOfVariation = (stdDev / mean) * 100;
    const skewness = calculateSkewness(data, mean, stdDev);
    const kurtosis = calculateKurtosis(data, mean, stdDev);

    // Quartile calculations
    const expandedData = data.flatMap(point => 
      Array(point.frequency).fill(point.value)
    ).sort((a, b) => a - b);
    
    const n = expandedData.length;
    const q1 = expandedData[Math.floor((n + 1) / 4) - 1];
    const q3 = expandedData[Math.floor(3 * (n + 1) / 4) - 1];
    const quartileDeviation = (q3 - q1) / 2;

    setResults({
      data,
      mean,
      variance,
      stdDev,
      range,
      meanDeviation,
      quartileDeviation,
      coefficientOfVariation,
      skewness,
      kurtosis,
      q1,
      q3
    });
  };

  const getSkewnessType = (skewness: number): string => {
    if (Math.abs(skewness) < 0.5) return 'Approximately Symmetric';
    if (skewness > 0.5) return 'Positively Skewed (Right-skewed)';
    return 'Negatively Skewed (Left-skewed)';
  };

  const getKurtosisType = (kurtosis: number): string => {
    if (Math.abs(kurtosis) < 0.5) return 'Mesokurtic (Normal)';
    if (kurtosis > 0.5) return 'Leptokurtic (Peaked)';
    return 'Platykurtic (Flat)';
  };

  const renderDispersion = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Measures of Dispersion Calculator</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Values (comma-separated)
              </label>
              <input
                type="text"
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="10, 15, 20, 25, 30"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequencies (comma-separated)
              </label>
              <input
                type="text"
                value={frequencyInput}
                onChange={(e) => setFrequencyInput(e.target.value)}
                placeholder="2, 4, 6, 8, 6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={performCalculations}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={() => setShowCalculations(!showCalculations)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {showCalculations ? 'Hide' : 'Show'} Steps
              </button>
            </div>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Absolute Measures</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="font-medium">Range:</span> {results.range.toFixed(2)}</p>
                  <p><span className="font-medium">Mean Deviation:</span> {results.meanDeviation.toFixed(2)}</p>
                  <p><span className="font-medium">Quartile Deviation:</span> {results.quartileDeviation.toFixed(2)}</p>
                  <p><span className="font-medium">Standard Deviation:</span> {results.stdDev.toFixed(2)}</p>
                  <p><span className="font-medium">Variance:</span> {results.variance.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Relative Measure</h3>
                <p className="text-sm text-green-800">
                  <span className="font-medium">Coefficient of Variation:</span> {results.coefficientOfVariation.toFixed(2)}%
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {results.coefficientOfVariation < 15 ? 'Low variability' :
                   results.coefficientOfVariation < 30 ? 'Moderate variability' : 'High variability'}
                </p>
              </div>
            </div>
          )}
        </div>

        {showCalculations && results && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Step-by-Step Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-blue-600 mb-2">Standard Deviation</h4>
                <div className="text-sm space-y-1">
                  <p className="font-mono bg-blue-50 p-2 rounded">σ = √[Σf(x-μ)² / Σf]</p>
                  <p>Mean (μ) = {results.mean.toFixed(2)}</p>
                  <p>Variance (σ²) = {results.variance.toFixed(2)}</p>
                  <p>Standard Deviation (σ) = {results.stdDev.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-green-600 mb-2">Coefficient of Variation</h4>
                <div className="text-sm space-y-1">
                  <p className="font-mono bg-green-50 p-2 rounded">CV = (σ/μ) × 100</p>
                  <p>σ = {results.stdDev.toFixed(2)}</p>
                  <p>μ = {results.mean.toFixed(2)}</p>
                  <p>CV = {results.coefficientOfVariation.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-800 mb-3">📈 Financial & Investment Analysis</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Risk Assessment:</strong> Measure investment volatility and uncertainty</li>
                <li>• <strong>Portfolio Management:</strong> Diversify based on return variability</li>
                <li>• <strong>Market Analysis:</strong> Understand price fluctuations and trends</li>
                <li>• <strong>Credit Scoring:</strong> Assess borrower reliability and consistency</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-green-800 mb-3">🏭 Operations & Quality Management</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Process Control:</strong> Monitor manufacturing consistency and quality</li>
                <li>• <strong>Supply Chain:</strong> Manage inventory variability and lead times</li>
                <li>• <strong>Service Delivery:</strong> Ensure consistent customer experience</li>
                <li>• <strong>Performance Metrics:</strong> Track employee productivity variations</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Understanding Dispersion in Business</h4>
            <p className="text-sm text-yellow-700">
              <strong>Low Variability (CV &lt; 15%):</strong> Consistent, predictable performance - good for 
              quality control and customer satisfaction. <strong>High Variability (CV &gt; 30%):</strong> 
              Unpredictable outcomes - may indicate process issues or market volatility requiring attention.
            </p>
          </div>
        </div>
      </div>

      {results && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Data Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="value" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="frequency" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  const renderSkewness = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Skewness Analysis</h2>
        
        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Karl Pearson's Coefficient</h3>
                <p className="text-2xl font-bold text-purple-700 mb-2">
                  {results.skewness.pearson.toFixed(4)}
                </p>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-mono text-sm bg-purple-50 p-2 rounded mb-2">
                    Sk = (Mean - Mode) / σ
                  </p>
                  <div className="text-sm space-y-1">
                    <p>Mean = {results.mean.toFixed(2)}</p>
                    <p>Mode = {results.skewness.mode}</p>
                    <p>σ = {results.stdDev.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">Moment Coefficient</h3>
                <p className="text-2xl font-bold text-indigo-700 mb-2">
                  {results.skewness.moment.toFixed(4)}
                </p>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-mono text-sm bg-indigo-50 p-2 rounded mb-2">
                    γ₁ = μ₃ / σ³
                  </p>
                  <p className="text-sm">
                    Based on the third moment about the mean
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Skewness Interpretation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Distribution Type:</h4>
                  <p className="text-lg font-semibold text-blue-600">
                    {getSkewnessType(results.skewness.moment)}
                  </p>
                  <div className="mt-4 bg-white rounded-lg p-4">
                    <h5 className="font-medium mb-2">Skewness Scale:</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Symmetric:</span> -0.5 to 0.5</p>
                      <p><span className="font-medium">Moderate:</span> ±0.5 to ±1.0</p>
                      <p><span className="font-medium">High:</span> Beyond ±1.0</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white rounded-lg p-4">
                    <h5 className="font-medium mb-2">Karl Pearson's Coefficient:</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Formula:</span> Sk = (Mean - Mode) / σ</p>
                      <p><span className="font-medium">Interpretation:</span> Positive = right-skewed, Negative = left-skewed</p>
                    </div>
                  </div>
                </div>

                <div className="h-48 bg-white rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={results.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="value" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="frequency" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Business Applications Section */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-purple-800 mb-3">💰 Financial & Economic Analysis</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Income Distribution:</strong> Analyze salary skewness in organizations</li>
                    <li>• <strong>Stock Returns:</strong> Understand market return distributions</li>
                    <li>• <strong>Real Estate:</strong> Study property price distributions</li>
                    <li>• <strong>Investment Risk:</strong> Assess portfolio return skewness</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-indigo-800 mb-3">🏭 Operations & Quality Control</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Production Times:</strong> Analyze manufacturing process distributions</li>
                    <li>• <strong>Service Delivery:</strong> Study customer service response times</li>
                    <li>• <strong>Quality Metrics:</strong> Understand defect rate distributions</li>
                    <li>• <strong>Inventory Levels:</strong> Analyze stock level variations</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Understanding Skewness in Business</h4>
                <p className="text-sm text-yellow-700">
                  <strong>Right-Skewed (Positive):</strong> Most values are low, with some high outliers. Common in 
                  income, house prices, and sales data. <strong>Left-Skewed (Negative):</strong> Most values are high, 
                  with some low outliers. Common in test scores and quality metrics.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderKurtosis = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Kurtosis Analysis</h2>
        
        {results && (
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">Kurtosis Coefficient</h3>
              <p className="text-3xl font-bold text-orange-700 mb-2">
                {results.kurtosis.toFixed(4)}
              </p>
              <p className="text-lg font-medium text-orange-800 mb-4">
                {getKurtosisType(results.kurtosis)}
              </p>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-2">Formula:</h4>
                <p className="font-mono bg-orange-50 p-2 rounded text-sm">
                  γ₂ = (μ₄ / σ⁴) - 3
                </p>
                <p className="text-sm mt-2">
                  Where μ₄ is the fourth moment about the mean
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Kurtosis Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`bg-white rounded-lg p-4 border-2 ${
                  results.kurtosis < -0.5 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}>
                  <h4 className="font-medium text-red-600 mb-2">Platykurtic</h4>
                  <p className="text-sm text-gray-600">Flatter than normal distribution</p>
                  <p className="text-xs text-gray-500 mt-2">Kurtosis &lt; -0.5</p>
                </div>

                <div className={`bg-white rounded-lg p-4 border-2 ${
                  Math.abs(results.kurtosis) <= 0.5 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}>
                  <h4 className="font-medium text-green-600 mb-2">Mesokurtic</h4>
                  <p className="text-sm text-gray-600">Similar to normal distribution</p>
                  <p className="text-xs text-gray-500 mt-2">-0.5 &le; Kurtosis &le; 0.5</p>
                </div>

                <div className={`bg-white rounded-lg p-4 border-2 ${
                  results.kurtosis > 0.5 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}>
                  <h4 className="font-medium text-blue-600 mb-2">Leptokurtic</h4>
                  <p className="text-sm text-gray-600">More peaked than normal distribution</p>
                  <p className="text-xs text-gray-500 mt-2">Kurtosis &gt; 0.5</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribution Characteristics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Shape Analysis:</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Peakedness:</span> {
                      results.kurtosis > 0.5 ? 'High (Sharp peak)' :
                      results.kurtosis < -0.5 ? 'Low (Flat top)' : 'Normal'
                    }</p>
                    <p><span className="font-medium">Tail Weight:</span> {
                      results.kurtosis > 0.5 ? 'Heavy tails' :
                      results.kurtosis < -0.5 ? 'Light tails' : 'Normal tails'
                    }</p>
                    <p><span className="font-medium">Outlier Probability:</span> {
                      results.kurtosis > 0.5 ? 'Higher' :
                      results.kurtosis < -0.5 ? 'Lower' : 'Normal'
                    }</p>
                  </div>
                </div>

                <div className="h-32 bg-gray-50 rounded-lg p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.data}>
                      <XAxis dataKey="value" hide />
                      <YAxis hide />
                      <Line type="monotone" dataKey="frequency" stroke="#F97316" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Business Applications Section */}
            <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-orange-800 mb-3">📈 Financial Risk Management</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Portfolio Risk:</strong> Assess tail risk and extreme event probability</li>
                    <li>• <strong>Market Volatility:</strong> Understand price movement distributions</li>
                    <li>• <strong>Credit Risk:</strong> Analyze default rate distributions</li>
                    <li>• <strong>Insurance Pricing:</strong> Set premiums based on claim distributions</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-red-800 mb-3">🏭 Quality & Process Control</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Manufacturing:</strong> Monitor process consistency and outlier frequency</li>
                    <li>• <strong>Service Quality:</strong> Analyze customer satisfaction distributions</li>
                    <li>• <strong>Supply Chain:</strong> Understand delivery time variations</li>
                    <li>• <strong>Performance Metrics:</strong> Assess employee productivity distributions</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Understanding Kurtosis in Business</h4>
                <p className="text-sm text-yellow-700">
                  <strong>Leptokurtic (High):</strong> Sharp peaks with heavy tails - indicates frequent extreme values. 
                  <strong>Platykurtic (Low):</strong> Flat peaks with light tails - indicates consistent, predictable values. 
                  <strong>Mesokurtic (Normal):</strong> Standard bell curve - indicates normal business variation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Complete Distribution Analysis</h2>
        
        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-1">Mean</h3>
                <p className="text-xl font-bold text-blue-700">{results.mean.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                <h3 className="font-medium text-green-900 mb-1">Std Deviation</h3>
                <p className="text-xl font-bold text-green-700">{results.stdDev.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                <h3 className="font-medium text-purple-900 mb-1">Skewness</h3>
                <p className="text-xl font-bold text-purple-700">{results.skewness.moment.toFixed(2)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
                <h3 className="font-medium text-orange-900 mb-1">Kurtosis</h3>
                <p className="text-xl font-bold text-orange-700">{results.kurtosis.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribution Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shape Characteristics:</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Symmetry:</span> {getSkewnessType(results.skewness.moment)}</p>
                      <p><span className="font-medium">Peakedness:</span> {getKurtosisType(results.kurtosis)}</p>
                      <p><span className="font-medium">Variability:</span> {
                        results.coefficientOfVariation < 15 ? 'Low' :
                        results.coefficientOfVariation < 30 ? 'Moderate' : 'High'
                      } ({results.coefficientOfVariation.toFixed(1)}%)</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Dispersion Measures:</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Range:</span> {results.range.toFixed(2)}</p>
                      <p><span className="font-medium">IQR:</span> {(results.q3 - results.q1).toFixed(2)}</p>
                      <p><span className="font-medium">Variance:</span> {results.variance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="h-64 bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Distribution Visualization</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={results.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="value" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="frequency" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">Statistical Interpretation</h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <p>
                  <span className="font-medium">Distribution Type:</span> This dataset shows a {getSkewnessType(results.skewness.moment).toLowerCase()} 
                  distribution with {getKurtosisType(results.kurtosis).toLowerCase()} characteristics.
                </p>
                <p>
                  <span className="font-medium">Variability:</span> The coefficient of variation of {results.coefficientOfVariation.toFixed(1)}% 
                  indicates {results.coefficientOfVariation < 15 ? 'relatively consistent' : 
                             results.coefficientOfVariation < 30 ? 'moderate variation in' : 'high variability in'} the data.
                </p>
                <p>
                  <span className="font-medium">Central Tendency:</span> The mean ({results.mean.toFixed(2)}) {
                    Math.abs(results.skewness.moment) < 0.5 ? 'closely represents the typical value' :
                    results.skewness.moment > 0 ? 'is pulled higher by extreme values' :
                    'is pulled lower by extreme values'
                  }.
                </p>
              </div>
            </div>

            {/* Business Applications Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Comprehensive Business Applications & Strategic Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-blue-800 mb-3">🎯 Strategic Decision Making</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Market Positioning:</strong> Understand customer behavior distributions</li>
                    <li>• <strong>Risk Management:</strong> Assess operational and financial risks</li>
                    <li>• <strong>Resource Allocation:</strong> Optimize based on performance variability</li>
                    <li>• <strong>Competitive Analysis:</strong> Benchmark against industry standards</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-purple-800 mb-3">📈 Performance Optimization</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Process Improvement:</strong> Identify areas needing standardization</li>
                    <li>• <strong>Quality Assurance:</strong> Set realistic quality targets</li>
                    <li>• <strong>Customer Experience:</strong> Ensure consistent service delivery</li>
                    <li>• <strong>Employee Development:</strong> Target training for performance gaps</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">💡 Key Business Insights</h4>
                <p className="text-sm text-green-700">
                  <strong>Distribution Shape:</strong> Understanding skewness and kurtosis helps predict extreme events, 
                  set realistic targets, and develop appropriate risk mitigation strategies. 
                  <strong>Variability Analysis:</strong> Low variability suggests stable processes, while high variability 
                  indicates opportunities for improvement or areas requiring special attention.
                </p>
              </div>
            </div>
          </div>
        )}

        {!results && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Please calculate dispersion measures first to see the complete analysis.</p>
            <button
              onClick={() => setActiveTab('dispersion')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dispersion Tab
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 4: Measures of Dispersion, Skewness & Kurtosis</h1>
        <p className="text-lg text-gray-600">
          Analyze data spread, distribution shape, and tail behavior characteristics.
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
          {activeTab === 'dispersion' && renderDispersion()}
          {activeTab === 'skewness' && renderSkewness()}
          {activeTab === 'kurtosis' && renderKurtosis()}
          {activeTab === 'analysis' && renderAnalysis()}
        </div>
      </div>
    </div>
  );
};

export default ChapterFour;