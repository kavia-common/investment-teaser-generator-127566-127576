import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGenerateTeaser, apiUpdateTeaser } from "../api";

// Helper to get session ID and company from local storage.
function getSessionAndCompany() {
  const session_id = window.localStorage.getItem("session_id");
  const companyProfile = window.localStorage.getItem("companyProfile");
  let company = null;
  try {
    company = companyProfile ? JSON.parse(companyProfile) : null;
  } catch {
    company = null;
  }
  return { session_id, company };
}

// PUBLIC_INTERFACE
function TeaserPreview() {
  /**
   * Live teaser preview and in-app editing.
   * Fetches the investment teaser, enables headline/content in-line editing,
   * syncs changes to backend using /api/generate and /api/teaser/{id}/update,
   * and manages loading/error/dirty states.
   */
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teaser, setTeaser] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false); // Editing mode
  const [editableTitle, setEditableTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [dirty, setDirty] = useState(false); // Content changed, not saved
  const [saving, setSaving] = useState(false); // Submission in progress
  const contentRef = useRef(null);

  // Fetch the teaser on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    const { session_id } = getSessionAndCompany();
    if (!session_id) {
      setError("Missing session. Please confirm company before generating teaser.");
      setLoading(false);
      return;
    }
    apiGenerateTeaser(session_id)
      .then(data => {
        if (!mounted) return;
        setTeaser(data.teaser);
        setStatus(data.status);
        setEditableTitle(data.teaser.title || "");
        setEditableContent(data.teaser.content || "");
        setDirty(false);
        setLoading(false);
      })
      .catch(e => {
        if (!mounted) return;
        setError(e.message || "Error fetching teaser.");
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Handle in-line edit fields
  function handleTitleChange(e) {
    setEditableTitle(e.target.value);
    setDirty(true);
  }

  function handleContentChange(e) {
    setEditableContent(e.target.value);
    setDirty(true);
  }

  // Save/sync to backend
  async function handleSave(e) {
    e.preventDefault();
    if (!teaser) return;
    setSaving(true);
    setError('');
    try {
      const resp = await apiUpdateTeaser(
        teaser.teaser_id,
        editableTitle.trim(),
        editableContent.trim()
      );
      setTeaser(resp.teaser);
      setStatus(resp.status || '');
      setEditableTitle(resp.teaser.title || "");
      setEditableContent(resp.teaser.content || "");
      setDirty(false);
    } catch (e) {
      setError(e.message || "Error saving changes.");
    }
    setSaving(false);
  }

  // Re-generate teaser (send another /api/generate call)
  async function handleRegenerate(e) {
    e.preventDefault();
    const { session_id } = getSessionAndCompany();
    setLoading(true);
    setError('');
    setStatus('pending');
    try {
      const data = await apiGenerateTeaser(session_id);
      setTeaser(data.teaser);
      setStatus(data.status);
      setEditableTitle(data.teaser.title || "");
      setEditableContent(data.teaser.content || "");
      setDirty(false);
    } catch (e) {
      setError(e.message || "Error re-generating teaser.");
    }
    setLoading(false);
  }

  // Keyboard shortcut: save on CMD+Enter / Ctrl+Enter
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && dirty && !saving) {
      handleSave(e);
    }
  }

  function handleBack() {
    navigate("/confirm");
  }

  function handleNext() {
    navigate("/export");
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 48, maxWidth: 700 }}>
        <h2>Teaser Preview & Edit</h2>
        <div style={{
          textAlign: 'center',
          padding: 44,
          color: '#888',
          fontSize: "1.17em"
        }}>
          Loading teaser...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: 48, maxWidth: 700 }}>
        <h2>Teaser Preview & Edit</h2>
        <div style={{
          color: "#b33a3a",
          background: "#f9eaea",
          border: "1.5px solid #e7bcbc",
          borderRadius: 7,
          padding: 28,
          marginTop: 24,
        }}>
          {error}
        </div>
        <div style={{ marginTop: 28 }}>
          <button className="btn" type="button" onClick={handleBack} style={{ minWidth: 90 }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!teaser) {
    return (
      <div className="container" style={{ marginTop: 48, maxWidth: 700 }}>
        <h2>Teaser Preview & Edit</h2>
        <div style={{ color: "#b33a3a", marginTop: 34 }}>
          No teaser content available.
        </div>
        <button className="btn" type="button" style={{ marginTop: 28 }} onClick={handleBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 700 }}>
      <h2>Teaser Preview &amp; Edit</h2>
      <form
        onSubmit={handleSave}
        autoComplete="off"
        style={{
          border: '1px solid #e9ecef',
          padding: 24,
          borderRadius: 10,
          marginBottom: 24,
          background: 'var(--bg-primary, #fff)',
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(50,60,80,0.03)'
        }}
      >
        <label style={{ fontWeight: 600, fontSize: "1.16em", color: "#162347" }}>
          Teaser Headline
        </label>
        <input
          type="text"
          value={editableTitle}
          onChange={handleTitleChange}
          onBlur={() => setEditing(false)}
          maxLength={128}
          spellCheck="true"
          style={{
            width: '100%',
            margin: '8px 0 16px 0',
            fontSize: "1.07em",
            borderRadius: 6,
            border: dirty ? "1.6px solid #0074d9" : "1px solid #ddd",
            background: "#fbfcfd",
            padding: 10,
            fontWeight: 500
          }}
          disabled={saving}
          autoFocus
        />

        <label style={{ fontWeight: 600, fontSize: "1.06em", marginTop: 20, color: "#162347" }}>
          Content <span style={{ fontWeight: 400, color: "#888", fontSize: "0.96em" }}>(edit as needed)</span>
        </label>
        <textarea
          ref={contentRef}
          value={editableContent}
          onChange={handleContentChange}
          rows={9}
          maxLength={9000}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            margin: '8px 0 8px 0',
            fontFamily: "inherit",
            fontSize: "1.04em",
            borderRadius: 6,
            border: dirty ? "1.6px solid #0074d9" : "1px solid #ddd",
            background: "#fcfdff",
            padding: "10px 9px 10px 10px",
            minHeight: 170,
            resize: "vertical",
            transition: "border 0.13s"
          }}
          disabled={saving}
        />

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 18,
          gap: 10,
        }}>
          <div>
            <button
              className="btn"
              type="button"
              onClick={handleRegenerate}
              disabled={loading || saving}
              style={{ marginRight: 10, minWidth: 110, fontWeight: 500, background: "#ffc107", color: "#191a1f" }}
            >
              {loading ? "Re-generating..." : "Re-generate"}
            </button>
            <button
              className="btn"
              type="submit"
              disabled={!dirty || saving}
              style={{ minWidth: 145, background: "#0074d9" }}
              aria-busy={saving}
            >
              {saving ? "Saving..." : (dirty ? "Save Changes" : "Saved")}
            </button>
            {dirty && !saving && (
              <span style={{ color: "#0074d9", fontWeight: 500, marginLeft: 10, fontSize: "0.98em" }}>(Unsaved changes)</span>
            )}
          </div>
          <div style={{ fontSize: "0.96em", color: "#737a8c", marginTop: 6 }}>
            Status:&nbsp;
            <span style={{
              color: status === "success" ? "#2ba671"
                : status === "pending" ? "#8d8d00"
                : "#c02d2d"
            }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </form>
      {error && (
        <div style={{
          color: "#b33a3a",
          background: "#fff4f1",
          border: "1.2px solid #ecc9c8",
          borderRadius: 5,
          padding: "12px 16px",
          marginBottom: 14,
        }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
        <button className="btn" type="button" onClick={handleBack}>
          Back
        </button>
        <button className="btn" type="button" onClick={handleNext}>
          Export Teaser
        </button>
      </div>
      <div style={{ marginTop: 28, color: "#555", fontSize: "0.98em" }}>
        <b>Tip:</b> Click "Re-generate" to fully refresh the teaser content with the latest AI logic.<br />
        Press <b>Ctrl+Enter</b> (or Cmd+Enter) in the content box to quickly save your edits.
      </div>
    </div>
  );
}

export default TeaserPreview;
