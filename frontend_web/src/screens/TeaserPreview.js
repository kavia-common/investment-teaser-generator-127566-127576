import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function TeaserPreview() {
  /**
   * Step 4: Preview and edit investment teaser (placeholder).
   */
  const navigate = useNavigate();

  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 700 }}>
      <h2>Teaser Preview & Edit</h2>
      <div style={{
        border: '1px solid #e9ecef',
        padding: 24,
        borderRadius: 10,
        marginBottom: 24,
        background: '#fff',
        textAlign: 'left'
      }}>
        <strong>Teaser Headline</strong><br />
        <input type="text" defaultValue="Acme Corp: Revolutionizing SaaS for Finance" style={{ width: '100%', margin: '8px 0' }} />
        <br />
        <strong>Content</strong><br />
        <textarea
          rows={8}
          defaultValue={"Acme Corp is a leading SaaS provider offering cutting-edge technology solutions for financial institutions..."}
          style={{ width: '100%', margin: '8px 0' }}
        /><br />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
        <button className="btn" type="button" onClick={() => navigate('/confirm')}>
          Back
        </button>
        <button className="btn" type="button" onClick={() => navigate('/export')}>
          Export Teaser
        </button>
      </div>
    </div>
  );
}

export default TeaserPreview;
