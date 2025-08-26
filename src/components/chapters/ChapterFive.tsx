import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChapterFive: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scatter');
  const [xValues, setXValues] = useState('');
  const [yValues, setYValues] = useState('');
  const [results, setResults] = useState<any>(null);

  const performAnalysis = () => {
    const xArray = xValues.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
    const yArray = yValues.split(',').map(y => parseFloat(y.trim())).filter(y => !isNaN(y));

    if (xArray.length !== yArray.length || xArray.length === 0) {
      alert('Please enter equal numbers of valid X and Y values');
      return;
    }

    const data = xArray.map((x, i) => ({ x, y: yArray[i] }));
    
    // Calculate Pearson correlation
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
    const sumY2 = data.reduce((sum, point) => sum + point.y * point.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const correlation = denominator === 0 ? 0 : numerator / denominator;

    // Calculate Spearman rank correlation
    const rankX = getRanks(xArray);
    const rankY = getRanks(yArray);
    
    const sumDR2 = rankX.reduce((sum, rx, i) => {
      const d = rx - rankY[i];
      return sum + d * d;
    }, 0);
    
    const spearmanRho = 1 - (6 * sumDR2) / (n * (n * n - 1));

    setResults({
      data,
      pearson: { correlation },
      spearman: { rho: spearmanRho }
    });
  };

  const getRanks = (values: number[]): number[] => {
    const sorted = [...values].sort((a, b) => a - b);
    return values.map(value => sorted.indexOf(value) + 1);
  };

  const getCorrelationStrength = (correlation: number): string => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const getCorrelationType = (correlation: number): string => {
    if (correlation > 0) return 'Positive';
    if (correlation < 0) return 'Negative';
    return 'No Correlation';
  };

  const renderScatter = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Scatter Diagram Analysis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Data Input Section */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Data Input</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    X Values (comma-separated)
                  </label>
                  <textarea
                    value={xValues}
                    onChange={(e) => setXValues(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter X values separated by commas..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Y Values (comma-separated)
                  </label>
                  <textarea
                    value={yValues}
                    onChange={(e) => setYValues(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter Y values separated by commas..."
                  />
                </div>
              </div>
              
              <button
                onClick={performAnalysis}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Analyze Correlation
              </button>
            </div>

            {/* Scatter Diagram Explanation */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">What is a Scatter Diagram?</h3>
              <div className="space-y-3 text-sm text-green-800">
                <p>
                  <strong>Definition:</strong> A scatter diagram (or scatter plot) is a graphical representation 
                  that shows the relationship between two quantitative variables.
                </p>
                <p>
                  <strong>Purpose:</strong> To visually identify patterns, trends, and relationships between 
                  two variables and detect potential outliers.
                </p>
                <div className="bg-white rounded-lg p-3 mt-3">
                  <h4 className="font-medium mb-2">Key Components:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>X-axis:</strong> Independent variable (horizontal)</li>
                    <li>• <strong>Y-axis:</strong> Dependent variable (vertical)</li>
                    <li>• <strong>Data Points:</strong> Each point represents one observation</li>
                    <li>• <strong>Trend Line:</strong> Shows the general direction of relationship</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {results && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Quick Summary</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-medium">Correlation (r):</span> {results.pearson.correlation.toFixed(4)}</p>
                <p><span className="font-medium">Strength:</span> {getCorrelationStrength(results.pearson.correlation)}</p>
                <p><span className="font-medium">Direction:</span> {getCorrelationType(results.pearson.correlation)}</p>
                <p><span className="font-medium">Data Points:</span> {results.data.length}</p>
              </div>
            </div>
          )}
        </div>

        {results && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">Scatter Plot</h3>
              <div className="h-80 bg-gray-50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      name="X Variable"
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      name="Y Variable"
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                      data={results.data} 
                      fill="#3B82F6"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Each point represents a pair of X and Y values
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Scatter Plot Interpretation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-green-600 mb-2">Positive Correlation</h4>
                  <p className="text-sm text-gray-600">Points trend upward from left to right. As X increases, Y tends to increase.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">Negative Correlation</h4>
                  <p className="text-sm text-gray-600">Points trend downward from left to right. As X increases, Y tends to decrease.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-600 mb-2">No Correlation</h4>
                  <p className="text-sm text-gray-600">Points are scattered randomly with no clear pattern.</p>
                </div>
              </div>
            </div>

            {/* Business Applications Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-blue-800 mb-3">💰 Financial & Marketing Analysis</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Price vs. Demand:</strong> Analyze how price changes affect sales volume</li>
                    <li>• <strong>Advertising vs. Sales:</strong> Measure marketing campaign effectiveness</li>
                    <li>• <strong>Investment vs. Returns:</strong> Study risk-return relationships</li>
                    <li>• <strong>Customer Age vs. Spending:</strong> Target marketing strategies</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-green-800 mb-3">🏭 Operations & Quality Control</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Production Time vs. Quality:</strong> Optimize manufacturing processes</li>
                    <li>• <strong>Training Hours vs. Performance:</strong> Evaluate training effectiveness</li>
                    <li>• <strong>Temperature vs. Defect Rate:</strong> Control production conditions</li>
                    <li>• <strong>Experience vs. Productivity:</strong> Plan workforce development</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Scatter Diagrams</h4>
                <p className="text-sm text-yellow-700">
                  <strong>Best for:</strong> Exploring relationships between two continuous variables, identifying trends, 
                  detecting outliers, and making predictions. <strong>Perfect for:</strong> Initial data exploration, 
                  hypothesis testing, and presenting findings to stakeholders in an intuitive visual format.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderPearson = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Pearson Correlation Analysis</h2>
        
        {results ? (
          <>
            {/* Results Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
                <h3 className="font-medium text-blue-900 mb-2">Correlation Coefficient</h3>
                <p className="text-3xl font-bold text-blue-700 mb-2">
                  {results.pearson.correlation.toFixed(4)}
                </p>
                <p className="text-sm text-blue-800">
                  {getCorrelationStrength(results.pearson.correlation)} {getCorrelationType(results.pearson.correlation)}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200 text-center">
                <h3 className="font-medium text-green-900 mb-2">Coefficient of Determination</h3>
                <p className="text-3xl font-bold text-green-700 mb-2">
                  {(results.pearson.correlation * results.pearson.correlation).toFixed(4)}
                </p>
                <p className="text-sm text-green-800">
                  {((results.pearson.correlation * results.pearson.correlation) * 100).toFixed(1)}% of variation explained
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 text-center">
                <h3 className="font-medium text-purple-900 mb-2">Probable Error</h3>
                <p className="text-3xl font-bold text-purple-700 mb-2">
                  ±{(0.6745 * (1 - results.pearson.correlation * results.pearson.correlation) / Math.sqrt(results.data.length)).toFixed(4)}
                </p>
                <p className="text-sm text-purple-800">
                  Margin of error in r
                </p>
              </div>
            </div>

            {/* Calculation Steps */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Calculation Steps</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium mb-2">Pearson's Formula:</h4>
                  <p className="font-mono bg-blue-50 p-3 rounded text-sm">
                    r = (n∑xy - ∑x∑y) / √[(n∑x² - (∑x)²)(n∑y² - (∑y)²)]
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium mb-2">Calculations:</h4>
                    <div className="text-sm space-y-1">
                      <p>n = {results.data.length}</p>
                      <p>∑X = {results.data.reduce((sum, point) => sum + point.x, 0).toFixed(2)}</p>
                      <p>∑Y = {results.data.reduce((sum, point) => sum + point.y, 0).toFixed(2)}</p>
                      <p>∑XY = {results.data.reduce((sum, point) => sum + point.x * point.y, 0).toFixed(2)}</p>
                      <p>∑X² = {results.data.reduce((sum, point) => sum + point.x * point.x, 0).toFixed(2)}</p>
                      <p>∑Y² = {results.data.reduce((sum, point) => sum + point.y * point.y, 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium mb-2">Results:</h4>
                    <div className="text-sm space-y-1">
                      <p>Mean X = {(results.data.reduce((sum, point) => sum + point.x, 0) / results.data.length).toFixed(2)}</p>
                      <p>Mean Y = {(results.data.reduce((sum, point) => sum + point.y, 0) / results.data.length).toFixed(2)}</p>
                      <p>r = {results.pearson.correlation.toFixed(4)}</p>
                      <p>r² = {(results.pearson.correlation * results.pearson.correlation).toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Enter data in the Scatter Diagram tab and click "Analyze Correlation" to see results here.</p>
            <button
              onClick={() => setActiveTab('scatter')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Scatter Diagram
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            {/* Pearson Correlation Explanation */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What is Pearson Correlation?</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  <strong>Definition:</strong> Pearson's correlation coefficient (r) measures the strength and direction 
                  of the linear relationship between two continuous variables.
                </p>
                <p>
                  <strong>Range:</strong> The coefficient ranges from -1 to +1, where:
                </p>
                <div className="bg-white rounded-lg p-3 mt-3">
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>+1:</strong> Perfect positive linear relationship</li>
                    <li>• <strong>0:</strong> No linear relationship</li>
                    <li>• <strong>-1:</strong> Perfect negative linear relationship</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formula Section */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Formula & Calculation</h3>
              <div className="space-y-3 text-sm text-green-800">
                <p>
                  <strong>Pearson's Formula:</strong>
                </p>
                <div className="bg-white rounded-lg p-3 mt-3 text-center">
                  <code className="text-sm">
                    r = (n∑xy - ∑x∑y) / √[(n∑x² - (∑x)²)(n∑y² - (∑y)²)]
                  </code>
                </div>
                <p className="mt-3">
                  <strong>Where:</strong>
                </p>
                <ul className="text-xs space-y-1">
                  <li>• <strong>n:</strong> Number of data points</li>
                  <li>• <strong>∑xy:</strong> Sum of products of X and Y values</li>
                  <li>• <strong>∑x, ∑y:</strong> Sum of X and Y values respectively</li>
                  <li>• <strong>∑x², ∑y²:</strong> Sum of squared X and Y values</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interpretation Guide */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Interpretation Guide</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">Strength of Relationship</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>0.00 - 0.19:</span>
                    <span className="text-gray-600">Very Weak</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0.20 - 0.39:</span>
                    <span className="text-gray-600">Weak</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0.40 - 0.59:</span>
                    <span className="text-gray-600">Moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0.60 - 0.79:</span>
                    <span className="text-gray-600">Strong</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0.80 - 1.00:</span>
                    <span className="text-gray-600">Very Strong</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">Direction</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span><strong>Positive:</strong> As X increases, Y tends to increase</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span><strong>Negative:</strong> As X increases, Y tends to decrease</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-800 mb-3">💰 Financial Analysis</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Stock Price vs. Volume:</strong> Analyze trading patterns and market behavior</li>
                <li>• <strong>Interest Rates vs. Investment:</strong> Study monetary policy effects</li>
                <li>• <strong>GDP vs. Unemployment:</strong> Understand economic relationships</li>
                <li>• <strong>Exchange Rates vs. Trade Balance:</strong> Monitor international trade</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-green-800 mb-3">🏭 Business Operations</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Employee Satisfaction vs. Productivity:</strong> Improve workplace culture</li>
                <li>• <strong>Customer Satisfaction vs. Loyalty:</strong> Enhance customer retention</li>
                <li>• <strong>Quality Score vs. Customer Complaints:</strong> Monitor product quality</li>
                <li>• <strong>Training Investment vs. Performance:</strong> Optimize training programs</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Pearson Correlation</h4>
            <p className="text-sm text-yellow-700">
              <strong>Best for:</strong> Linear relationships between continuous variables, parametric data analysis, 
              and when you need a precise numerical measure of relationship strength. <strong>Perfect for:</strong> 
              Research studies, quality control, financial analysis, and any scenario requiring quantitative 
              relationship assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRank = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Rank Correlation (Spearman's Rho) Analysis</h2>
        
        {results ? (
          <>
            {/* Results Display */}
            <div className="bg-indigo-100 rounded-lg p-6 border border-indigo-300 text-center mb-8">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">Spearman's Rho (ρ)</h3>
              <p className="text-3xl font-bold text-indigo-700 mb-2">
                {results.spearman.rho.toFixed(4)}
              </p>
              <p className="text-sm text-indigo-800">
                {getCorrelationStrength(results.spearman.rho)} {getCorrelationType(results.spearman.rho)} Rank Correlation
              </p>
            </div>

            {/* Rank Calculation Table */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold mb-4">Rank Calculation Table</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">X Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Y Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">X Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Y Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">d = Rx - Ry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">d²</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(() => {
                      const xArray = results.data.map((point: any) => point.x);
                      const yArray = results.data.map((point: any) => point.y);
                      const rankX = getRanks(xArray);
                      const rankY = getRanks(yArray);
                      
                      return results.data.map((point: any, index: number) => {
                        const d = rankX[index] - rankY[index];
                        const d2 = d * d;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{point.x}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{point.y}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{rankX[index]}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{rankY[index]}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{d}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{d2}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        ∑d² =
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {(() => {
                          const xArray = results.data.map((point: any) => point.x);
                          const yArray = results.data.map((point: any) => point.y);
                          const rankX = getRanks(xArray);
                          const rankY = getRanks(yArray);
                          return rankX.reduce((sum, rx, i) => {
                            const d = rx - rankY[i];
                            return sum + d * d;
                          }, 0);
                        })()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Calculation Steps */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Calculation Steps</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium mb-2">Spearman's Formula:</h4>
                  <p className="font-mono bg-indigo-50 p-3 rounded text-sm">
                    ρ = 1 - [6∑d²] / [n(n²-1)]
                  </p>
                  <p className="text-sm mt-2 text-gray-600">
                    Where d = difference between ranks, n = number of observations
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium mb-2">Calculations:</h4>
                    <div className="text-sm space-y-1">
                      <p>n = {results.data.length}</p>
                      <p>∑d² = {(() => {
                        const xArray = results.data.map((point: any) => point.x);
                        const yArray = results.data.map((point: any) => point.y);
                        const rankX = getRanks(xArray);
                        const rankY = getRanks(yArray);
                        return rankX.reduce((sum, rx, i) => {
                          const d = rx - rankY[i];
                          return sum + d * d;
                        }, 0);
                      })()}</p>
                      <p>n(n²-1) = {results.data.length * (results.data.length * results.data.length - 1)}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium mb-2">Results:</h4>
                    <div className="text-sm space-y-1">
                      <p>ρ = {results.spearman.rho.toFixed(4)}</p>
                      <p>Strength: {getCorrelationStrength(results.spearman.rho)}</p>
                      <p>Direction: {getCorrelationType(results.spearman.rho)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison with Pearson */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">Comparison: Pearson vs Spearman</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-blue-600 mb-2">Pearson's r</h4>
                  <p className="text-2xl font-bold text-blue-700 mb-1">
                    {results.pearson.correlation.toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-600">Measures linear relationship using actual values</p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-indigo-600 mb-2">Spearman's ρ</h4>
                  <p className="text-2xl font-bold text-indigo-700 mb-1">
                    {results.spearman.rho.toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-600">Measures monotonic relationship using ranks</p>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-lg p-4">
                <h4 className="font-medium mb-2">When to use Rank Correlation:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• When data is ordinal (ranks, ratings, preferences)</li>
                  <li>• When the relationship is non-linear but monotonic</li>
                  <li>• When data contains outliers</li>
                  <li>• For small sample sizes</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Enter data in the Scatter Diagram tab and click "Analyze Correlation" to see results here.</p>
            <button
              onClick={() => setActiveTab('scatter')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Scatter Diagram
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            {/* Spearman's Rho Explanation */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What is Spearman's Rank Correlation?</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  <strong>Definition:</strong> Spearman's rank correlation coefficient (ρ) measures the strength 
                  and direction of the monotonic relationship between two variables using their ranks.
                </p>
                <p>
                  <strong>Key Advantage:</strong> Unlike Pearson's correlation, Spearman's rho works with 
                  non-linear relationships and ordinal data.
                </p>
                <div className="bg-white rounded-lg p-3 mt-3">
                  <h4 className="font-medium mb-2">When to Use:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Non-linear but monotonic relationships</li>
                    <li>• Ordinal or ranked data</li>
                    <li>• Data with outliers</li>
                    <li>• Non-parametric analysis</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formula Section */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Formula & Calculation</h3>
              <div className="space-y-3 text-sm text-green-800">
                <p>
                  <strong>Spearman's Formula:</strong>
                </p>
                <div className="bg-white rounded-lg p-3 mt-3 text-center">
                  <code className="text-sm">
                    ρ = 1 - (6∑d²) / (n(n² - 1))
                  </code>
                </div>
                <p className="mt-3">
                  <strong>Where:</strong>
                </p>
                <ul className="text-xs space-y-1">
                  <li>• <strong>ρ (rho):</strong> Spearman's rank correlation coefficient</li>
                  <li>• <strong>d:</strong> Difference between ranks of corresponding variables</li>
                  <li>• <strong>∑d²:</strong> Sum of squared rank differences</li>
                  <li>• <strong>n:</strong> Number of data points</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Calculation Steps */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Calculation Steps</h3>
            <div className="space-y-4 text-sm">
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium text-purple-800 mb-2">Step 1: Rank the Data</h4>
                <p className="text-xs text-gray-700">Assign ranks to each value in both variables (1 for lowest, n for highest)</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium text-purple-800 mb-2">Step 2: Calculate Rank Differences</h4>
                <p className="text-xs text-gray-700">Find the difference (d) between corresponding ranks</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium text-purple-800 mb-2">Step 3: Square the Differences</h4>
                <p className="text-xs text-gray-700">Square each rank difference (d²)</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium text-purple-800 mb-2">Step 4: Apply the Formula</h4>
                <p className="text-xs text-gray-700">Use the formula to calculate ρ</p>
              </div>
            </div>
          </div>
        </div>

        {/* When to Use Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 When to Use Spearman's Rank Correlation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-800 mb-3">✅ Perfect For:</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Non-linear relationships:</strong> When variables have curved relationships</li>
                <li>• <strong>Ordinal data:</strong> Rankings, ratings, or ordered categories</li>
                <li>• <strong>Data with outliers:</strong> Robust against extreme values</li>
                <li>• <strong>Non-parametric analysis:</strong> When data doesn't meet normality assumptions</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-green-800 mb-3">⚠️ Consider Alternatives For:</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Linear relationships:</strong> Pearson's correlation may be more precise</li>
                <li>• <strong>Large datasets:</strong> Ranking can be computationally intensive</li>
                <li>• <strong>Continuous normal data:</strong> Pearson's correlation provides more information</li>
                <li>• <strong>Multiple variables:</strong> Consider multivariate correlation methods</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Business Applications Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Business Applications & Real-World Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-800 mb-3">🏆 Performance & Rankings</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Employee Rankings vs. Performance:</strong> Evaluate promotion criteria</li>
                <li>• <strong>Customer Satisfaction vs. Loyalty:</strong> Measure service quality</li>
                <li>• <strong>Product Ratings vs. Sales:</strong> Analyze market preferences</li>
                <li>• <strong>Quality Scores vs. Rankings:</strong> Assess evaluation systems</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-green-800 mb-3">📈 Market Research & Surveys</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Survey Responses vs. Demographics:</strong> Understand customer segments</li>
                <li>• <strong>Brand Perception vs. Market Share:</strong> Analyze brand positioning</li>
                <li>• <strong>Price Sensitivity vs. Income Level:</strong> Develop pricing strategies</li>
                <li>• <strong>Service Quality vs. Customer Retention:</strong> Improve customer experience</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 When to Use Spearman's Rank Correlation</h4>
            <p className="text-sm text-yellow-700">
              <strong>Best for:</strong> Non-linear relationships, ordinal data, data with outliers, and when you need 
              a robust measure that doesn't assume linearity. <strong>Perfect for:</strong> Customer satisfaction surveys, 
              performance evaluations, market research, and any analysis involving rankings or ratings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMethods = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Correlation Analysis Methods</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Method Comparison */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Method Comparison</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Pearson vs. Spearman</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Pearson:</span>
                      <span className="text-gray-600">Linear relationships</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Spearman:</span>
                      <span className="text-gray-600">Monotonic relationships</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Best Practices</h3>
            <div className="space-y-3 text-sm text-green-800">
              <ul className="space-y-2">
                <li>• Always visualize data with scatter plots first</li>
                <li>• Check for outliers and their impact</li>
                <li>• Consider the nature of your variables</li>
                <li>• Interpret correlation in context</li>
                <li>• Remember: correlation ≠ causation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter 5: Correlation Analysis</h1>
          <p className="text-lg text-gray-600">
            Explore relationships between variables using various correlation methods and visualization techniques.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('scatter')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'scatter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Scatter Diagram
            </button>
            <button
              onClick={() => setActiveTab('pearson')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pearson'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pearson Correlation
            </button>
            <button
              onClick={() => setActiveTab('rank')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'rank'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rank Correlation
            </button>
            <button
              onClick={() => setActiveTab('methods')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'methods'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Methods & Best Practices
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'scatter' && renderScatter()}
        {activeTab === 'pearson' && renderPearson()}
        {activeTab === 'rank' && renderRank()}
        {activeTab === 'methods' && renderMethods()}
      </div>
    </div>
  );
};

export default ChapterFive;