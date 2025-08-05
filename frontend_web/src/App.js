import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

  useEffect(() => {
    // Handle basic theme switching if implemented (prefers Tailwind classes)
    if (theme === "dark") {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Find which step we are on based on path
  const currentPath = location.pathname;
  const currentStep = Math.max(
    stepRoutes.findIndex((r) => r === currentPath),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col transition-colors duration-300 dark:bg-[#141929] dark:text-gray-200">
      <header className="w-full shadow-sm z-10 bg-white dark:bg-[#191f31] transition relative flex flex-col items-center py-5 md:py-7">
        <button
          className="absolute top-5 right-5 md:top-6 md:right-7 rounded-lg border border-gray-200 bg-gray-100 dark:bg-[#242d3e] dark:border-[#232b3a] px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-100 shadow hover:bg-primary-50 hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-accent transition"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <div className="w-full max-w-3xl flex justify-center">
          <Stepper currentStep={currentStep} />
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center px-2 md:px-0 pt-2 pb-8 bg-transparent">
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
