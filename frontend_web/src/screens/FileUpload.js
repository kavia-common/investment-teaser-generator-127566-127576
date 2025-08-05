import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function FileUpload() {
  /**
   * Step 2: Upload files (placeholder for drag-and-drop).
   */
  const navigate = useNavigate();

  // Placeholder: UI only; file upload feature to be implemented
  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 480 }}>
      <h2>Upload Supporting Documents</h2>
      <p style={{ marginBottom: 16 }}>
        Drag and drop your PDF, Excel, Word, or TXT files here.<br/>
        <em>(File upload is not yet implemented.)</em>
      </p>
      <div style={{ border: '2px dashed #ddd', borderRadius: 8, padding: 32, background: '#fafbfc', marginBottom: 24 }}>
        <span style={{ color: '#bbbbbb' }}>Drop files here or click to select...</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button className="btn" onClick={() => navigate('/website')}>Back</button>
        <button className="btn" onClick={() => navigate('/confirm')}>Next</button>
      </div>
    </div>
  );
}

export default FileUpload;
