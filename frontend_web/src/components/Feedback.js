import React from "react";

/**
 * Simple circular loading spinner (Tailwinded).
 */
// PUBLIC_INTERFACE
export function Spinner({ size = 32, className = "" }) {
  /** Renders a circular spinner */
  return (
    <span
      role="status"
      aria-live="polite"
      className={[
        "inline-block align-middle",
        className,
      ].join(" ")}
      style={{
        width: size, height: size,
        border: `${size > 24 ? 3 : 2}px solid #cbd5e1`,
        borderTop: `${size > 24 ? 3 : 2}px solid #0074d9`,
        borderRadius: "50%",
        animation: "spin .7s linear infinite"
      }}
    >
      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
      <span className="sr-only">Loading...</span>
    </span>
  );
}

// PUBLIC_INTERFACE
export function Alert({ type = "info", children, className = "", ...rest }) {
  /**
   * Renders an alert box using Tailwind; type: "success", "error", or "info"
   */
  let base =
    "my-2 rounded-lg px-5 py-3 font-medium text-sm border";
  let color =
    type === "success"
      ? "bg-[#eafaf2] border-[#abf1d2] text-[#20784a]"
      : type === "error"
      ? "bg-[#fbeaea] border-[#f2bcbc] text-[#b33a3a]"
      : "bg-[#eaf1fa] border-[#acc8e5] text-[#2456c2]";
  return (
    <div
      role="alert"
      className={`${base} ${color} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
