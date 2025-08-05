import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function Landing() {
  /**
   * Landing page with app overview and start button.
   */
  const navigate = useNavigate();

  return (
    <div className="container" style={{ marginTop: 48 }}>
      <h1>Investment Teaser Generator</h1>
      <p>
        Welcome to the streamlined platform for AI-powered investment teaser creation. Start by entering your company's website to begin!
      </p>
      <button
        className="btn btn-large"
        style={{ marginTop: 24 }}
        onClick={() => navigate('/website')}
      >
        Start Now
      </button>
    </div>
  );
}

export default Landing;
