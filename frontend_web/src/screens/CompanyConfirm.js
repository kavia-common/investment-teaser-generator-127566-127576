import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Loads current company info from backend (/api/scrape has already run),
 * allows user to edit/confirm, and submits via /api/company/confirm.
 * Handles errors and feedback within a responsive, user-friendly UI.
 */

// Field config to control which fields are shown and labels/placeholders
const FIELD_CONFIG = [
  { name: "name", label: "Company Name", type: "text", required: true, placeholder: "e.g. Acme Corp" },
  { name: "industry", label: "Industry", type: "text", required: false, placeholder: "e.g. Software" },
  { name: "headquarters", label: "Headquarters", type: "text", required: false, placeholder: "e.g. San Francisco, CA" },
  { name: "description", label: "Description", type: "textarea", required: false, placeholder: "What does this company do?", rows: 3 },
  { name: "website", label: "Website", type: "url", required: false, placeholder: "https://company.com" },
  { name: "email", label: "Email", type: "email", required: false, placeholder: "contact@company.com" },
  { name: "phone", label: "Phone", type: "text", required: false, placeholder: "+1 800-555..." },
  { name: "founded_year", label: "Founded Year", type: "number", required: false, placeholder: "e.g. 2010" },
  { name: "employees", label: "Employees", type: "number", required: false, placeholder: "e.g. 150" },
  { name: "revenue", label: "Revenue (USD)", type: "number", required: false, placeholder: "e.g. 5000000" },
];

// Helper: load company profile (GET) for prefill, expecting {companyInfo}
async function fetchCompanyInfo() {
  // There is no direct GET for just "current company" -- assume it's from /api/scrape with step tracking.
  // Try to get recently scraped company from backend. Fallback: POST empty to /api/scrape or show message.
  // We'll pull from /api/scrape with the last submitted URL. Or, for simplicity, POST with null or empty body.
  // NOTE: Production would track company in app context/session! Here, we demonstrate optimistic fetch.
  try {
    // Try from /api/scrape?profile_latest=1 (not in openapi), fallback: show static defaults
    // To strictly conform to the provided API, no GET for /api/scrape or /api/company/confirm; in real world, would use context/global state.
    // For this implementation, user is expected to have just come from WebsiteInput, which performed /api/scrape.
    // To provide actual functionality, we will make an inert fetch to '/api/scrape' with the last used url if present in localStorage or:
    // look for 'companyProfile' in localStorage set by /api/scrape step.

    const storedProfile = window.localStorage.getItem("companyProfile");
    if (storedProfile) {
      return JSON.parse(storedProfile);
    } else {
      // Fallback static default for user to edit
      return {
        name: "",
        industry: "",
        headquarters: "",
        description: "",
        website: "",
        email: "",
        phone: "",
        founded_year: "",
        employees: "",
        revenue: "",
        logo_url: "",
      };
    }
  } catch {
    return {
      name: "",
      industry: "",
      headquarters: "",
      description: "",
      website: "",
      email: "",
      phone: "",
      founded_year: "",
      employees: "",
      revenue: "",
      logo_url: "",
    };
  }
}

// Helper: Store confirmed profile for other screens (like teaser gen), implicitly tracks session
function storeProfileAndSession(company, session_id) {
  window.localStorage.setItem("companyProfile", JSON.stringify(company || {}));
  if (session_id) window.localStorage.setItem("session_id", session_id);
}

// PUBLIC_INTERFACE
function CompanyConfirm() {
  /**
   * Step 3: Confirm or edit company details.
   * Loads company info, enables user edits, validates input, submits to /api/company/confirm,
   * displays backend and client-side errors, and provides clear next actions.
   */
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState({});
  const [error, setError] = useState(""); // General error
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(""); // Confirmation
  const [logoUrl, setLogoUrl] = useState(null);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCompanyInfo().then(info => {
      if (mounted) {
        setCompany(info || {});
        setLogoUrl(info.logo_url || "");
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Handle field changes
  function handleFieldChange(e) {
    const { name, value } = e.target;
    setCompany(prev => ({
      ...prev,
      [name]: value
    }));
    setFieldErrors(prev => ({ ...prev, [name]: null }));
  }

  // Basic local validation for required fields (mostly only name required)
  function validateCompany(c) {
    const errs = {};
    FIELD_CONFIG.forEach(fld => {
      if (fld.required && !c[fld.name]?.toString().trim()) {
        errs[fld.name] = `${fld.label} is required`;
      }
      if (fld.name === "website" && c.website && c.website.length > 0) {
        try {
          // Allow empty or valid http(s) url
          const u = new URL(c.website);
          if (!(u.protocol === "http:" || u.protocol === "https:"))
            errs.website = "Only http:// or https:// URLs allowed";
        } catch {
          errs.website = "Invalid URL";
        }
      }
      if (fld.name === "email" && c.email) {
        // Naive email regex
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(c.email)) {
          errs.email = "Invalid email format";
        }
      }
      if (fld.name === "founded_year" && c.founded_year) {
        if (!/^\d{4}$/.test(c.founded_year.toString())) {
          errs.founded_year = "Enter a 4-digit year";
        }
      }
    });
    return errs;
  }

  // Submit handler
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    const errs = validateCompany(company);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitting(false);
      return;
    }
    try {
      // Prepare POST body (wrap in company object)
      const payload = { company };
      const resp = await fetch("/api/company/confirm", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.status === 422) {
        setError("Validation error: Please check your input and try again.");
        setSubmitting(false);
        return;
      }
      if (!resp.ok) {
        setError(`Server error (${resp.status}). Please try again later.`);
        setSubmitting(false);
        return;
      }
      const data = await resp.json();
      if (!data || !data.session_id) {
        setError("Unexpected response from backend.");
        setSubmitting(false);
        return;
      }
      setSuccess("Company details confirmed! Proceeding...");
      storeProfileAndSession(company, data.session_id);
      setTimeout(() => navigate("/teaser"), 600);
    } catch (e) {
      setError("Network or server error. Please try again.");
    }
    setSubmitting(false);
  }

  function handleBack() {
    navigate("/upload");
  }

  // Render UI
  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 620 }}>
      <h2>Confirm or Edit Company Details</h2>
      <div style={{ color: "#333", marginBottom: 12, fontSize: "1.08em" }}>
        Please review and edit your company profile below. All fields can be changed. This information will be used to generate your investment teaser.
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Loading company information...</div>
      ) : (
        <form 
          onSubmit={handleSubmit}
          style={{ opacity: submitting ? 0.8 : 1, pointerEvents: submitting ? "none" : "auto" }}
        >
          {/* Optional logo image if available */}
          {logoUrl && (
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <img src={logoUrl} alt="Company Logo" style={{ maxHeight: 60, maxWidth: 180, borderRadius: "10px", boxShadow: "0 1px 4px #eee" }} />
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: "2 1 260px" }}>
              {FIELD_CONFIG.map(f => (
                <div key={f.name} style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 600 }}>
                    {f.label}
                    {f.required && <span style={{ color: "#b33a3a", marginLeft: 2 }}>*</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      name={f.name}
                      rows={f.rows || 3}
                      value={company[f.name] ?? ""}
                      onChange={handleFieldChange}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%",
                        borderRadius: 5,
                        border: fieldErrors[f.name] ? "1.5px solid #b33a3a" : "1px solid #ccc",
                        padding: 8,
                        fontSize: "1em",
                        marginTop: 5
                      }}
                      disabled={submitting}
                    />
                  ) : (
                    <input
                      type={f.type}
                      name={f.name}
                      value={company[f.name] ?? ""}
                      onChange={handleFieldChange}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%",
                        borderRadius: 5,
                        border: fieldErrors[f.name] ? "1.5px solid #b33a3a" : "1px solid #ccc",
                        padding: 8,
                        fontSize: "1em",
                        marginTop: 5
                      }}
                      disabled={submitting}
                    />
                  )}
                  {fieldErrors[f.name] && (
                    <div style={{ color: "#b33a3a", minHeight: 20, fontSize: "0.97em", fontWeight: 500 }}>{fieldErrors[f.name]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* General error display */}
          {error && (
            <div style={{
              color: "#b33a3a",
              margin: "16px 0",
              fontWeight: 500
            }}>
              {error}
            </div>
          )}
          {/* Success confirm message */}
          {success && (
            <div style={{
              color: "#2ba671",
              margin: "16px 0",
              fontWeight: 500
            }}>
              {success}
            </div>
          )}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 22
          }}>
            <button
              className="btn"
              type="button"
              onClick={handleBack}
              disabled={submitting}
              style={{ minWidth: 90 }}
            >
              Back
            </button>
            <button
              className="btn btn-large"
              type="submit"
              disabled={submitting || loading}
              style={{ minWidth: 138, fontWeight: 700 }}
              aria-busy={submitting}
            >
              {submitting ? "Submitting..." : "Confirm & Next"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CompanyConfirm;
