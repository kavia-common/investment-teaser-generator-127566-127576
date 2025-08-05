import React from 'react';

const steps = [
  'Welcome',
  'Company Website',
  'File Upload',
  'Confirm/Edit Company',
  'Teaser Preview/Edit',
  'Export'
];

// PUBLIC_INTERFACE
function Stepper({ currentStep }) {
  /**
   * Stepper navigation component (Tailwind, no separate CSS).
   * @param {number} currentStep - Current step index (0-based).
   */
  return (
    <nav
      className="w-full"
      aria-label="Workflow progress"
    >
      <ol className="flex flex-wrap justify-center items-center gap-x-2 gap-y-3 p-0 m-0 list-none">
        {steps.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <li
              key={label}
              aria-current={isActive ? 'step' : undefined}
              className={
                [
                  "flex items-center gap-2 font-medium",
                  isCompleted
                    ? "opacity-100 text-accent"
                    : isActive
                    ? "opacity-95 text-primary"
                    : "opacity-70 text-gray-500 dark:text-gray-400",
                  "transition"
                ].join(" ")
              }
            >
              <span
                className={[
                  "inline-flex items-center justify-center",
                  "w-8 h-8 rounded-full border-2 shrink-0 font-bold",
                  isCompleted
                    ? "bg-accent border-accent text-white"
                    : isActive
                    ? "bg-primary-50 border-accent text-primary dark:bg-[#34405b] dark:text-accent"
                    : "bg-gray-100 border-gray-300 text-gray-500 dark:bg-[#232938] dark:border-[#373a46] dark:text-gray-400",
                  "transition"
                ].join(" ")}
                aria-label={isCompleted ? "Completed" : isActive ? "Current" : "Upcoming"}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M5.5 13.5l4.5 4.5 8-10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span className="min-w-[80px] text-sm md:text-base">{label}</span>
              {idx < steps.length - 1 && (
                <span
                  className="mx-2 text-lg text-gray-300 dark:text-gray-600"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
