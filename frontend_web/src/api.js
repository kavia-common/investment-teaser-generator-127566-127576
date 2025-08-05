/**
 * Centralized API utility for backend requests.
 * Handles base URL, error normalization, JSON parsing, etc.
 * Adapt here if you need to add token auth, special headers, etc.
 */

const API_BASE = ""; // override to e.g. "/api" if proxied or add full host for local testing

// --- Helper: Handle response, normalize errors
async function handleResp(resp) {
  let data;
  const contentType = resp.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") > -1) {
    data = await resp.json();
  } else {
    data = await resp.text();
  }
  if (!resp.ok) {
    let errMsg = `(${resp.status}) `;
    if (data && data.detail) errMsg += data.detail;
    else if (typeof data === "string" && data.length < 300) errMsg += data;
    else if (resp.status === 422) errMsg += "Validation error.";
    else if (resp.status === 400) errMsg += "Invalid input or server error.";
    else errMsg += "Request failed.";
    throw new Error(errMsg);
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiScrape(url) {
  /** Call /api/scrape, POST {url}, returns {company, found} */
  const resp = await fetch(`${API_BASE}/api/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return handleResp(resp);
}

// PUBLIC_INTERFACE
export async function apiUploadFiles(files, company_id = null, onProgress = null) {
  /** POST /api/upload, FormData with list of files; onProgress(percent) called if provided */
  if (!files || !files.length) throw new Error("No files provided.");
  const url = company_id
    ? `${API_BASE}/api/upload?company_id=${encodeURIComponent(company_id)}`
    : `${API_BASE}/api/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest();
    xhr.open("POST", url);

    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error("Could not parse upload response."));
        }
      } else {
        let errMsg = xhr.status === 400
          ? "Server rejected the upload. Try different files."
          : `File upload failed (${xhr.status}).`;
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network error during file upload."));
    };

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100), event.loaded, event.total);
      }
    };

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    xhr.send(formData);
  });
}

// PUBLIC_INTERFACE
export async function apiCompanyConfirm(company) {
  /** POST /api/company/confirm {company} -> {session_id} */
  const resp = await fetch(`${API_BASE}/api/company/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company }),
  });
  return handleResp(resp);
}

// PUBLIC_INTERFACE
export async function apiGenerateTeaser(session_id, selected_files = undefined) {
  /** POST /api/generate {session_id, selected_files} -> {teaser, status} */
  const body = { session_id };
  if (selected_files !== undefined) body.selected_files = selected_files;
  const resp = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResp(resp);
}

// PUBLIC_INTERFACE
export async function apiUpdateTeaser(teaser_id, title, content) {
  /** POST /api/teaser/{teaser_id}/update {teaser_id, title, content} -> {teaser, status} */
  const resp = await fetch(`${API_BASE}/api/teaser/${encodeURIComponent(teaser_id)}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teaser_id, title, content }),
  });
  return handleResp(resp);
}

// PUBLIC_INTERFACE
export async function apiExportTeaserPdf(teaser_id) {
  /** GET /api/export/:teaser_id - returns PDF blob */
  const resp = await fetch(`${API_BASE}/api/export/${encodeURIComponent(teaser_id)}`, {
    method: "GET",
    headers: { Accept: "application/pdf" }
  });
  if (resp.ok && resp.headers.get("content-type") === "application/pdf") {
    return resp.blob();
  } else {
    throw new Error(
      `Failed to fetch teaser PDF (status ${resp.status}): ${await resp.text()}`
    );
  }
}

// Export API base if needed for custom endpoints/overrides
export default {
  apiScrape,
  apiUploadFiles,
  apiCompanyConfirm,
  apiGenerateTeaser,
  apiUpdateTeaser,
  apiExportTeaserPdf,
};
