import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Stepper from './components/Stepper';

// Step screens
import Landing from './screens/Landing';
import WebsiteInput from './screens/WebsiteInput';
import FileUpload from './screens/FileUpload';
import CompanyConfirm from './screens/CompanyConfirm';
import TeaserPreview from './screens/TeaserPreview';
import TeaserExport from './screens/TeaserExport';

// --- Route mapping for step logic ---
const stepRoutes = [
  '/',
  '/website',
  '/upload',
  '/confirm',
  '/teaser',
  '/export'
];

function MainAppContent() {
  const [theme, setTheme] = useState('light');
  const location = useLocation();

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Find which step we are on based on path
  const currentPath = location.pathname;
  const currentStep = Math.max(
    stepRoutes.findIndex((r) => r === currentPath),
    0
  );

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 0, paddingBottom: 0 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <Stepper currentStep={currentStep} />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/website" element={<WebsiteInput />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/confirm" element={<CompanyConfirm />} />
          <Route path="/teaser" element={<TeaserPreview />} />
          <Route path="/export" element={<TeaserExport />} />
        </Routes>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Entry point App - Provides router and multi-step UI context.
   */
  return (
    <BrowserRouter>
      <MainAppContent />
    </BrowserRouter>
  );
}

export default App;
