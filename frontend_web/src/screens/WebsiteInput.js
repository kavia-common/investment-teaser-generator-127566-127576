import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper: Validate URL to be secure and well-formed (http(s)://, domain, etc.)
function isValidCompanyUrl(url) {
  try {
    const u = new URL(url);
    // Only allow http or https (and not empty/localhost etc.)
    if (!(u.protocol === "http:" || u.protocol === "https:")) return false;
    // Must have a non-empty hostname with at least one period (e.g. acme.com)
    if (!u.hostname || u.hostname.split('.').length < 2 || u.hostname === "localhost") return false;
    return true;
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
function WebsiteInput() {
  /**
   * Step 1: Enter company website form, validate input, call /api/scrape.
   * Shows loading, errors, and displays preview of scraped company info if successful.
   */
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const [scraped, setScraped] = useState(null); // holds object from /api/scrape
  const navigate = useNavigate();

  // On form submit: validate and POST to /api/scrape
  const handleSubmit = async (e) => {
    e.preventDefault();
    setScraped(null);
    setStatus('idle');
    setError('');

    // Client URL validation first
    if (!url || !isValidCompanyUrl(url)) {
      setError("Please enter a valid company website starting with https:// (no localhost, no IP address).");
      return;
    }

    setStatus('loading');
    setError('');
    try {
      // POST {url} to backend /api/scrape endpoint
      const resp = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (resp.status === 422) {
        setError("Validation error: make sure the URL is correct.");
        setStatus('error');
        return;
      }
      if (resp.status === 400) {
        setError("URL is invalid or unreachable. Please check the company homepage and try again.");
        setStatus('error');
        return;
      }
      if (!resp.ok) {
        setError(`Server error (${resp.status}). Please try again later.`);
        setStatus('error');
        return;
      }

      const data = await resp.json();
      // data: { company: {...}, found: boolean }
      if (!data || !data.found) {
        setError("Could not extract company details from this website. Please try another URL.");
        setStatus('error');
        return;
      }

      setScraped(data.company);
      setStatus('success');
      // Optionally, auto proceed to next step after a brief delay
      // setTimeout(() => navigate('/upload'), 1200);

    } catch (e) {
      setError("Network or server error. Please check your connection and try again.");
      setStatus('error');
    }
  };

  // On proceed, e.g. after successful scrape
  const handleNext = () => {
    // In a real app, you'd want to persist scraped results to global state/context here
    navigate('/upload');
  };

  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 460 }}>
      <h2>Enter Company Website</h2>
      <form onSubmit={handleSubmit} autoComplete="off" noValidate>
        <label htmlFor="company-url"><b>Company Homepage URL</b></label>
        <input
          id="company-url"
          type="url"
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            setError('');
            setScraped(null);
            setStatus('idle');
          }}
          placeholder="https://example.com"
          required
          spellCheck="false"
          style={{
            width: '100%',
            padding: 10,
            marginTop: 8,
            marginBottom: 16,
            borderRadius: 6,
            border: error ? '1.5px solid #b33a3a' : '1px solid #ddd'
          }}
          autoFocus
          disabled={status === 'loading'}
        />
        <div style={{ color: "#b33a3a", minHeight: 22, marginBottom: 2, fontSize: '1em' }}>
          {error}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            className="btn"
            type="submit"
            disabled={status === 'loading'}
            style={{ minWidth: 90 }}
          >
            {status === 'loading' ? "Loading..." : "Next"}
          </button>
        </div>
      </form>

      {/* Result preview after a successful scrape */}
      {status === 'success' && scraped && (
        <div style={{
          background: "#f8fafb",
          border: '1px solid #e9ecef',
          padding: 20,
          borderRadius: 8,
          marginTop: 24,
          marginBottom: 8,
          textAlign: 'left',
        }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{
              display: 'inline-block',
              fontWeight: 800,
              color: '#0074d9',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              fontSize: "1.1em",
              marginBottom: 6
            }}>
              Scraped from website:
            </span>
          </div>
          <div style={{ marginBottom: 5 }}>
            <b>Name:</b> {scraped.name || <span style={{ color: "#888" }}>Not found</span>}
          </div>
          <div style={{ marginBottom: 5 }}>
            <b>Industry:</b> {scraped.industry || <span style={{ color: "#888" }}>Not found</span>}
          </div>
          <div style={{ marginBottom: 5 }}>
            <b>Headquarters:</b> {scraped.headquarters || <span style={{ color: "#888" }}>Not found</span>}
          </div>
          {scraped.description && (
            <div style={{ marginBottom: 5 }}>
              <b>Description:</b> <span style={{ color: "#333" }}>{scraped.description}</span>
            </div>
          )}
          {scraped.logo_url && (
            <div style={{ marginTop: 12 }}>
              <img src={scraped.logo_url} alt="Company logo" style={{ maxWidth: 80, display: "block" }} />
            </div>
          )}
          {/* Add other fields as needed (phone, email, employees, revenue...) */}
          <button
            className="btn"
            type="button"
            onClick={handleNext}
            style={{ marginTop: 12, float: "right" }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default WebsiteInput;
