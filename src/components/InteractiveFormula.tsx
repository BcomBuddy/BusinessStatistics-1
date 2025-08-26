import React, { useState } from 'react';
import { Calculator, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface FormulaComponent {
  symbol: string;
  description: string;
  value?: number;
  color?: string;
}

interface InteractiveFormulaProps {
  title: string;
  formula: string;
  components: FormulaComponent[];
  result?: number;
  explanation?: string;
  steps?: string[];
}

const InteractiveFormula: React.FC<InteractiveFormulaProps> = ({
  title,
  formula,
  components,
  result,
  explanation,
  steps
}) => {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyFormula = async () => {
    try {
      await navigator.clipboard.writeText(formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy formula');
    }
  };

  const getComponentColor = (component: FormulaComponent) => {
    if (component.color) return component.color;
    
    const colors = [
      'text-blue-600 bg-blue-50 border-blue-200',
      'text-green-600 bg-green-50 border-green-200',
      'text-purple-600 bg-purple-50 border-purple-200',
      'text-orange-600 bg-orange-50 border-orange-200',
      'text-red-600 bg-red-50 border-red-200',
    ];
    
    const index = components.findIndex(c => c.symbol === component.symbol);
    return colors[index % colors.length];
  };

  const highlightFormula = (formula: string) => {
    let highlighted = formula;
    
    components.forEach((component, index) => {
      const colorClass = getComponentColor(component);
      const isHovered = hoveredComponent === component.symbol;
      
      highlighted = highlighted.replace(
        new RegExp(`\\b${component.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
        `<span class="px-2 py-1 rounded transition-all duration-200 cursor-pointer border ${colorClass} ${
          isHovered ? 'scale-110 font-semibold shadow-md' : ''
        }" data-symbol="${component.symbol}">${component.symbol}</span>`
      );
    });
    
    return highlighted;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calculator className="h-6 w-6 mr-2 text-blue-600" />
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyFormula}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${
              copied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          {steps && (
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              {showSteps ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showSteps ? 'Hide' : 'Show'} Steps</span>
            </button>
          )}
        </div>
      </div>

      {/* Formula Display */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-6 border">
        <div className="text-center">
          <div 
            className="text-2xl font-mono leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: highlightFormula(formula) 
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLElement;
              const symbol = target.getAttribute('data-symbol');
              if (symbol) setHoveredComponent(symbol);
            }}
            onMouseOut={() => setHoveredComponent(null)}
          />
        </div>
      </div>

      {/* Component Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {components.map((component, index) => {
          const colorClass = getComponentColor(component);
          const isHovered = hoveredComponent === component.symbol;
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${colorClass} ${
                isHovered ? 'scale-105 shadow-md' : 'hover:scale-102'
              }`}
              onMouseEnter={() => setHoveredComponent(component.symbol)}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-lg font-semibold">{component.symbol}</span>
                  <p className="text-sm mt-1">{component.description}</p>
                </div>
                {component.value !== undefined && (
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold">
                      {component.value.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result */}
      {result !== undefined && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white mb-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">Result</h4>
            <div className="text-3xl font-bold font-mono">{result.toFixed(4)}</div>
            {explanation && (
              <p className="text-blue-100 mt-2">{explanation}</p>
            )}
          </div>
        </div>
      )}

      {/* Step-by-step calculation */}
      {showSteps && steps && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Step-by-Step Calculation
          </h4>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="bg-white p-3 rounded-lg border flex-1">
                  <code className="text-sm text-gray-800">{step}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveFormula;