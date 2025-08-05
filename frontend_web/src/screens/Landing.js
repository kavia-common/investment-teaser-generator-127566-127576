import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function Landing() {
  /**
   * Landing page with app overview and start button.
   */
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-xl bg-white/80 dark:bg-[#1f2435] shadow-lg rounded-xl mx-auto mt-16 px-8 py-14 flex flex-col items-center text-center border border-gray-50">
      <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4 tracking-tight dark:text-[#e9ecef]">
        Investment Teaser Generator
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
        Welcome to the streamlined platform for AI-powered investment teaser creation.<br />
        Start by entering your company&apos;s website to begin!
      </p>
      <button
        className="mt-2 md:mt-3 px-8 py-3 bg-accent text-white rounded-lg font-bold text-lg shadow hover:bg-[#0e67ba] transition"
        onClick={() => navigate('/website')}
      >
        Start Now
      </button>
    </div>
  );
}

export default Landing;
