import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Utility to format file size nicely
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024,
    dm = 1,
    sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Allowed file types
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/vnd.ms-excel", // legacy Excel
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/msword", // legacy Word
  "text/plain",
];
const EXT_REGEX = /\.(pdf|xlsx?|docx?|txt)$/i;

// PUBLIC_INTERFACE
function FileUpload() {
  /**
   * Step 2: Upload multiple files (PDF, Excel, Word, TXT) via drag-and-drop or click.
   * Shows progress and error states, uploads files to backend /api/upload, and displays server results.
   */
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState("");
  const [serverResponse, setServerResponse] = useState(null);

  // Validate file type
  function isAllowed(file) {
    return (
      ACCEPTED_TYPES.includes(file.type) ||
      EXT_REGEX.test(file.name)
    );
  }

  // Update file list
  function addFiles(selectedFiles) {
    let arr = Array.from(selectedFiles);
    // Validate
    const rejected = arr.filter((f) => !isAllowed(f));
    if (rejected.length) {
      setError(
        "Only PDF, Excel, Word, and TXT files are permitted."
      );
      arr = arr.filter(isAllowed);
      if (arr.length === 0) return; // No valid files
    } else {
      setError("");
    }
    // Add, but filter exact duplicates by name+size
    setFiles((prev) => {
      const newArr = [...prev];
      arr.forEach((file) => {
        if (
          !newArr.some(
            (f) => f.name === file.name && f.size === file.size
          )
        ) {
          newArr.push(file);
        }
      });
      return newArr;
    });
  }

  // Handle drag&drop events
  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  }

  function onFileSelect(e) {
    addFiles(e.target.files);
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // Upload handler
  async function handleUpload() {
    if (!files.length) {
      setError("Please select at least one file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress({});
    setError("");
    setServerResponse(null);

    // Compose multipart form-data
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    // (You could optionally add query param company_id, if needed)

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress({
            total: event.total,
            loaded: event.loaded,
            percent: Math.round((event.loaded / event.total) * 100),
          });
        }
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          setUploading(false);
          if (xhr.status === 200) {
            try {
              setServerResponse(JSON.parse(xhr.responseText));
              setFiles([]); // clear after upload
              setError("");
            } catch {
              setError("Upload succeeded, but server returned invalid response.");
              setServerResponse(null);
            }
          } else if (xhr.status === 400) {
            setError("The server rejected one or more files. Please try again.");
          } else if (xhr.status === 422) {
            setError("Validation error during upload.");
          } else {
            setError(
              `Upload failed: ${xhr.status || "Server Error"}`
            );
          }
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError("Network or server error. Please try again.");
      };

      xhr.send(formData);
    } catch (e) {
      setUploading(false);
      setError("Unexpected error occurred during upload.");
    }
  }

  // UI: Drag/drop area click opens file dialog
  function openFileDialog() {
    if (!uploading && fileInputRef.current) fileInputRef.current.click();
  }

  return (
    <div className="container" style={{ marginTop: 48, maxWidth: 480 }}>
      <h2>Upload Supporting Documents</h2>
      <p style={{ marginBottom: 16 }}>
        Drag and drop your PDF, Excel, Word, or TXT files here.<br />
        Accepted: .pdf, .docx, .xlsx, .txt
      </p>

      {/* Drag and drop zone */}
      <div
        style={{
          border: "2px dashed #ddd",
          borderRadius: 8,
          padding: 32,
          background: "#fafbfc",
          marginBottom: 24,
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.7 : 1,
          transition: "opacity 0.2s",
          textAlign: "center",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={onDrop}
        onClick={openFileDialog}
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === "Enter") openFileDialog(); }}
        aria-label="Upload files zone"
      >
        <input
          type="file"
          multiple
          style={{ display: "none" }}
          ref={fileInputRef}
          accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          onChange={onFileSelect}
          disabled={uploading}
          data-testid="file-input"
        />
        <span style={{ color: "#bbbbbb" }}>
          {uploading
            ? "Uploading..."
            : "Drop files here or click to select..."}
        </span>
      </div>

      {/* List selected files */}
      {files.length > 0 && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <b>Files to Upload:</b>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 10 }}>
            {files.map((file, idx) => (
              <li key={file.name + file.size} style={{ marginBottom: 3 }}>
                {file.name}{" "}
                <span style={{ color: "#888", marginLeft: 5, fontSize: "0.98em" }}>
                  {formatBytes(file.size)}
                </span>{" "}
                {!uploading && (
                  <button
                    type="button"
                    style={{
                      marginLeft: 8,
                      color: "#b00",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1em",
                      verticalAlign: "middle",
                    }}
                    aria-label="Remove file"
                    onClick={() => removeFile(idx)}
                    tabIndex={0}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress bar */}
      {uploading && uploadProgress && uploadProgress.percent >= 0 && (
        <div style={{ width: "100%", margin: "18px 0" }}>
          <div style={{
            height: 18,
            background: "#f4f5f8",
            borderRadius: 5,
            overflow: "hidden",
            border: "1px solid #eee"
          }}>
            <div
              style={{
                width: `${uploadProgress.percent}%`,
                background:
                  "linear-gradient(90deg,#0074d9 60%,#45a8ff 100%)",
                height: "100%",
                color: "white",
                textAlign: "center",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 5,
                transition: "width 0.3s"
              }}
            >
              {uploadProgress.percent > 8
                ? `${uploadProgress.percent}%`
                : ""}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
            {formatBytes(uploadProgress.loaded || 0)} / {formatBytes(uploadProgress.total || 0)}
          </div>
        </div>
      )}

      {/* Error or info message */}
      {error && (
        <div style={{
          color: "#b33a3a",
          marginBottom: 10,
          marginTop: 5,
          fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      {/* Upload/Next/Back buttons */}
      <div style={{
        display: "flex",
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        marginTop: 24,
        gap: 12,
      }}>
        <button
          className="btn"
          type="button"
          style={{
            minWidth: 90,
            opacity: uploading ? 0.75 : 1,
            pointerEvents: uploading ? "none" : "auto",
          }}
          disabled={uploading || files.length === 0}
          onClick={handleUpload}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        <button
          className="btn"
          style={{ opacity: uploading ? 0.65 : 1 }}
          disabled={uploading}
          type="button"
          onClick={() => navigate("/website")}
        >
          Back
        </button>
        <button
          className="btn"
          style={{ opacity: uploading ? 0.5 : 1 }}
          type="button"
          disabled={uploading}
          onClick={() => navigate("/confirm")}
        >
          Next
        </button>
      </div>

      {/* Server response, show file list & previews */}
      {serverResponse && serverResponse.files && (
        <div style={{
          marginTop: 24,
          padding: "18px 14px 10px 14px",
          borderRadius: 8,
          background: "#f5f8fb",
          border: "1px solid #e9ecef"
        }}>
          <b>Uploaded Files:</b>
          <ul style={{ paddingLeft: 22, marginTop: 8, marginBottom: 0 }}>
            {serverResponse.files.map((f, i) => (
              <li key={f.filename + i}>
                <span style={{ color: "#0074d9", fontWeight: 500 }}>{f.filename}</span>
                {" "}
                <span style={{ color: "#444", fontSize: "0.95em" }}>
                  ({formatBytes(f.size)}) [{f.content_type}]
                </span>
                {f.preview_text && (
                  <div style={{
                    background: "#f7fafc",
                    borderRadius: 5,
                    fontSize: "0.99em",
                    color: "#222",
                    marginTop: 6,
                    marginBottom: 6,
                    padding: "6px 12px"
                  }}>
                    <b>Preview:</b> <span style={{ color: "#555" }}>{f.preview_text.slice(0, 220)}{f.preview_text.length > 220 ? "..." : ""}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Info if user proceeds without uploading */}
      {serverResponse && !serverResponse.files?.length && (
        <div style={{ marginTop: 18, color: "#b33a3a" }}>
          No files were uploaded.
        </div>
      )}
    </div>
  );
}

export default FileUpload;
