import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">FinanceFlow - Simple Test</h1>
        <p>If you can see this, React is working!</p>
      </header>
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl mb-4">Testing Basic React App</h2>
          <p className="mb-4">This is a simplified version to test if the basic React app loads on Netlify.</p>
          <div className="bg-green-100 p-4 rounded">
            <p className="text-green-800">✅ React is rendering successfully</p>
            <p className="text-green-800">✅ Tailwind CSS is working</p>
            <p className="text-green-800">✅ Build process completed</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4">
            Test Button
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;