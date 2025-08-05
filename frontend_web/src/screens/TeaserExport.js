import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function TeaserExport() {
  /**
   * Step 5: Export/download teaser (placeholder).
   */
  const navigate = useNavigate();

  return (
    <div className="container" style={{ marginTop: 64, maxWidth: 400 }}>
      <h2>Export Investment Teaser</h2>
      <p style={{ marginBottom: 16 }}>
        Your teaser is ready for export.<br />
        <button className="btn btn-large" style={{ marginTop: 18, marginBottom: 24 }} disabled>
          <span role="img" aria-label="download" style={{ marginRight: 8 }}>⬇️</span>
          Download PDF (Coming Soon)
        </button>
      </p>
      <p>
        <button className="btn" type="button" onClick={() => navigate('/teaser')}>
          Back to Edit
        </button>
      </p>
      <p style={{ color: "#999", marginTop: 16 }}>
        <em>PDF export and advanced features will be available soon.</em>
      </p>
    </div>
  );
}

export default TeaserExport;
