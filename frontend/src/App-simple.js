import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">FinanceFlow Test</h1>
        <p>If you can see this, React is working!</p>
      </header>
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl mb-4">Simple Test Page</h2>
          <p>This is a simplified version to test if the basic React app loads.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Test Button
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;