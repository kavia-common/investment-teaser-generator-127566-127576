import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function WebsiteInput() {
  /**
   * Step 1: Enter company website form.
   */
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for validation and API call (to be added)
    navigate('/upload');
  };

  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 440 }}>
      <h2>Enter Company Website</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="company-url">Company Homepage URL</label>
        <input
          id="company-url"
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          style={{ width: '100%', padding: 10, marginTop: 8, marginBottom: 16, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn" type="submit">Next</button>
        </div>
      </form>
    </div>
  );
}

export default WebsiteInput;
