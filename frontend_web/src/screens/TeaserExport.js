import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/*
  PROFESSIONAL TEASER EXPORT & DOWNLOAD

  - Fetches the PDF from backend `/api/export/:teaserId`
  - Previews using an embedded PDF.js viewer
  - Allows direct download
  - Provides robust loading and error handling UI
*/

// Helper: Get session info and generated teaser (from localStorage, as in TeaserPreview.js)
function getTeaserInfo() {
  // Try to get latest teaser info (id, etc.) from localStorage set in previous steps.
  // This should match logic in TeaserPreview.js or be passed in location.state.
  let teaser = null;
  try {
    teaser = window.localStorage.getItem('teaser');
    if (teaser) teaser = JSON.parse(teaser);
  } catch {
    teaser = null;
  }
  // Fallback: Try last generated teaser_id
  let teaser_id = teaser && teaser.teaser_id ? teaser.teaser_id : null;
  if (!teaser_id) {
    // Look for previous step's teaser_id? (TeaserPreview puts teaser obj in localStorage...)
    // Try temp: scan for all keys: look for lastTeaserId or similar
    // NOTE: For this implementation, we recommend TeaserPreview.js place teaser to localStorage on navigation!
    if (window.localStorage.getItem('lastTeaserId')) {
      teaser_id = window.localStorage.getItem('lastTeaserId');
    }
  }
  return { teaser, teaser_id };
}

import { Document, Page, pdfjs } from 'react-pdf';

// Setup PDF.js worker from an external CDN for compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// PUBLIC_INTERFACE
function TeaserExport() {
  /**
   * Step 5: Export/download the generated professional teaser PDF.
   * Fetches PDF by teaserId from backend, previews with PDF.js,
   * and provides download. Handles errors and loading states.
   */
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [teaserTitle, setTeaserTitle] = useState('');
  const [teaserId, setTeaserId] = useState('');
  const downloadLinkRef = useRef(null);

  // On mount: get teaser ID and fetch PDF
  useEffect(() => {
    const { teaser, teaser_id } = getTeaserInfo();
    if (!teaser_id) {
      setError('Missing teaser ID. Please generate/preview your teaser before export.');
      setLoading(false);
      return;
    }
    setTeaserId(teaser_id);
    setTeaserTitle(teaser && teaser.title ? teaser.title : 'Investment_Teaser');
    fetchPdf(teaser_id);
    // eslint-disable-next-line
  }, []);

  // Fetch PDF from backend /api/export/:teaserId as blob
  async function fetchPdf(teaser_id) {
    setFetching(true);
    setLoading(true);
    setError('');
    setPdfBlob(null);
    try {
      const resp = await fetch(`/api/export/${encodeURIComponent(teaser_id)}`, {
        method: 'GET',
        headers: { Accept: 'application/pdf' }
      });
      if (resp.status === 404) {
        setError('Teaser not found. Please go back and re-generate.');
        setLoading(false);
        setFetching(false);
        return;
      }
      if (!resp.ok || resp.headers.get('content-type') !== 'application/pdf') {
        // It may be a JSON error response
        setError(`Failed to export teaser PDF (status ${resp.status}).`);
        setLoading(false);
        setFetching(false);
        return;
      }
      // Download as blob
      const blob = await resp.blob();
      setPdfBlob(blob);
    } catch (e) {
      setError('Network error while fetching teaser PDF. Please try again.');
    }
    setLoading(false);
    setFetching(false);
  }

  // Download handler
  function handleDownload() {
    if (!pdfBlob) return;
    // Create an anchor with download attribute and click it
    const url = URL.createObjectURL(pdfBlob);
    const link = downloadLinkRef.current;
    if (link) {
      link.href = url;
      link.download = `${teaserTitle.replace(/[^a-z0-9]/gi,'_') || 'Teaser'}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
  }

  // Navigation
  function handleBack() {
    navigate('/teaser');
  }
  function handleRegenerate() {
    navigate('/teaser');
  }

  // UI LOGIC BRANCHES
  if (loading || fetching) {
    return (
      <div className="container" style={{ marginTop: 64, maxWidth: 500 }}>
        <h2>Export Investment Teaser</h2>
        <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: '1.13em' }}>
          {fetching ? 'Fetching teaser PDF...' : 'Loading export interface...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: 64, maxWidth: 500 }}>
        <h2>Export Investment Teaser</h2>
        <div style={{
          background: '#f9ecec',
          color: '#b33a3a',
          border: '1.4px solid #e2bcbc',
          borderRadius: 7,
          margin: '30px 0',
          padding: 26,
          textAlign: 'center'
        }}>
          {error}
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn" onClick={handleBack}>Back</button>
          <button className="btn" style={{ marginLeft: 10 }} onClick={handleRegenerate}>Try Again</button>
        </div>
      </div>
    );
  }

  // MAIN PDF PREVIEW UI
  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 670 }}>
      <h2>Export Investment Teaser PDF</h2>
      <div style={{
        margin: '16px 0 18px 0',
        color: '#444',
        fontSize: '1.08em'
      }}>
        Your teaser is ready! Preview below and download the professionally-formatted PDF.<br/>
        For edits, return to the previous step and re-generate before exporting.
      </div>
      <div style={{ margin: '18px 0 28px', textAlign: 'center' }}>
        {/* PDF Preview */}
        {pdfBlob ? (
          <PDFPreview blob={pdfBlob} title={teaserTitle} />
        ) : (
          <div style={{ padding: 34, color: '#888' }}>PDF content unavailable.</div>
        )}
      </div>
      <div style={{ margin: '24px 0', textAlign: 'center' }}>
        <a ref={downloadLinkRef} style={{ display: 'none' }} />
        <button
          className="btn btn-large"
          onClick={handleDownload}
          disabled={!pdfBlob}
          style={{ minWidth: 178, fontWeight: 600 }}
        >
          <span role="img" aria-label="download" style={{ marginRight: 8 }}>⬇️</span>
          Download PDF
        </button>
      </div>
      <div style={{ marginTop: 20 }}>
        <button className="btn" type="button" onClick={handleBack}>
          Back to Edit
        </button>
      </div>
      <div style={{ color: "#999", marginTop: 20, fontSize: "0.97em" }}>
        <em>
          If the preview does not load, click "Download PDF" to save directly.<br/>
          PDF export is supported on most modern browsers.
        </em>
      </div>
    </div>
  );
}

/*
  PDFPreview subcomponent: renders PDF using react-pdf with pagination and error fallback
*/
function PDFPreview({ blob, title }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [err, setErr] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  function handlePrev() {
    setPageNumber((p) => Math.max(1, p - 1));
  }
  function handleNext() {
    setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));
  }
  function onError(e) {
    setErr(e?.message || "PDF preview failed.");
  }

  return (
    <div>
      {err ? (
        <div style={{ color: "#b33a3a", margin: 12 }}>
          {title ? <b>{title}</b> : null}
          <div style={{ marginTop: 8 }}>Could not preview PDF: {err}</div>
          <div style={{marginTop: 12, color:'#0074d9'}}>
            <span>Try downloading using the button below.</span>
          </div>
        </div>
      ) : (
        <Document
          file={blob}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onError}
          loading={<div style={{padding:24,color:'#888'}}>Loading PDF...</div>}
          error={<div style={{padding:24,color:'#b33a3a'}}>Unable to load PDF.</div>}
          renderMode="canvas"
          options={{
            // Any PDF.js options if needed
          }}
          externalLinkTarget="_blank"
        >
          <Page pageNumber={pageNumber} width={610} renderTextLayer={false} />
        </Document>
      )}
      {numPages && numPages > 1 && !err && (
        <div style={{ margin: "14px 0 0 0", display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
          <button className="btn" style={{ minWidth: 54 }} onClick={handlePrev} disabled={pageNumber <= 1}>Previous</button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button className="btn" style={{ minWidth: 54 }} onClick={handleNext} disabled={pageNumber >= numPages}>Next</button>
        </div>
      )}
    </div>
  );
}

export default TeaserExport;
