import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function CompanyConfirm() {
  /**
   * Step 3: Confirm or edit company details (placeholder form).
   */
  const navigate = useNavigate();

  // To be replaced with actual scraped data fields; static for now
  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 600 }}>
      <h2>Confirm/Edit Company Details</h2>
      <form>
        <label>Company Name: <input type="text" defaultValue="Acme Corp" /></label><br /><br />
        <label>Industry: <input type="text" defaultValue="Software" /></label><br /><br />
        <label>Headquarters: <input type="text" defaultValue="San Francisco, CA" /></label><br /><br />
        <label>Description: <textarea defaultValue={"Innovative tech provider"} rows={3} style={{ width: '100%' }} /></label><br /><br />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
          <button className="btn" type="button" onClick={() => navigate('/upload')}>
            Back
          </button>
          <button className="btn" type="button" onClick={() => navigate('/teaser')}>
            Confirm & Next
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanyConfirm;
