import React from 'react';
import './App.css';

function App() {
  console.log("App component rendering...");
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            FinanceFlow
          </h1>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ React App is loading successfully!
          </div>
          <p className="text-lg text-gray-700 mb-8">
            AI-Powered Financial Document Converter & Analyzer
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="text-left space-y-2">
                <li>📄 Convert financial documents</li>
                <li>🤖 AI-powered analysis</li>
                <li>📊 Expense categorization</li>
                <li>📈 Trend analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;