import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import FinanceFlowLandingPage from './components/FinanceFlowLandingPage';
import Blog from './components/Blog';
import BlogPost1 from './components/blog/BlogPost1';
import BlogPost2 from './components/blog/BlogPost2';
import BlogPost3 from './components/blog/BlogPost3';
import BlogPost4 from './components/blog/BlogPost4';
import BlogPost5 from './components/blog/BlogPost5';
import BlogPost6 from './components/blog/BlogPost6';
import BlogPost7 from './components/blog/BlogPost7';
import BlogPost8 from './components/blog/BlogPost8';

const Navbar = () => (
  <nav className="bg-gray-800 p-4">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="text-white text-2xl font-bold">FinancialDocConverter</Link>
      <div>
        <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
        <Link to="/blog" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Blog</Link>
      </div>
    </div>
  </nav>
);

function App() {
  console.log("App component rendering...");
  
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<FinanceFlowLandingPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/1" element={<BlogPost1 />} />
          <Route path="/blog/2" element={<BlogPost2 />} />
          <Route path="/blog/3" element={<BlogPost3 />} />
          <Route path="/blog/4" element={<BlogPost4 />} />
          <Route path="/blog/5" element={<BlogPost5 />} />
          <Route path="/blog/6" element={<BlogPost6 />} />
          <Route path="/blog/7" element={<BlogPost7 />} />
          <Route path="/blog/8" element={<BlogPost8 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;