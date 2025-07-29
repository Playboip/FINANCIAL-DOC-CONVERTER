import React from 'react';
import './App.css';
import FinanceFlowLandingPage from './components/FinanceFlowLandingPage';

function App() {
  console.log("App component rendering...");
  
  return (
    <div className="App">
      <FinanceFlowLandingPage />
    </div>
  );
}

export default App;