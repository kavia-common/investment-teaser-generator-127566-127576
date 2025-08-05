import React from "react";

/**
 * Simple circular loading spinner.
 */
// PUBLIC_INTERFACE
export function Spinner({ size = 32, style = {} }) {
  /** Renders a circular spinner */
  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `3px solid #ccc`,
        borderTop: `3px solid #0074d9`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        verticalAlign: "middle",
        ...style
      }}
    >
      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
      <span style={{ display: "none" }}>Loading...</span>
    </span>
  );
}

// PUBLIC_INTERFACE
export function Alert({ type = "info", children, style = {}, ...rest }) {
  /**
   * Renders an alert box; type: "success", "error", or "info"
   */
  let color, bg, border;
  if (type === "success") {
    color = "#20784a"; bg = "#eafaf2"; border = "#abf1d2";
  } else if (type === "error") {
    color = "#b33a3a"; bg = "#fbeaea"; border = "#f2bcbc";
  } else {
    color = "#2456c2"; bg = "#eaf1fa"; border = "#acc8e5";
  }
  return (
    <div
      role="alert"
      style={{
        margin: "8px 0",
        borderRadius: 7,
        padding: "14px 18px",
        color,
        background: bg,
        border: `1.4px solid ${border}`,
        fontWeight: 500,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
