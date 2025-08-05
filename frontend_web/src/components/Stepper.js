import React from 'react';
import './Stepper.css';

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
   * Stepper navigation component.
   * @param {number} currentStep - Current step index (0-based).
   * Shows filled check circles for completed steps, color highlight for active, subtle state for pending.
   * @returns {JSX.Element}
   */
  return (
    <nav className="stepper" aria-label="Workflow progress">
      <ol>
        {steps.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <li
              key={label}
              className={`stepper-step${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="circle" aria-label={isCompleted ? "Completed" : isActive ? "Current" : "Upcoming"}>
                {isCompleted
                  ? (
                    <span role="img" aria-label="check" style={{ color: 'var(--button-text, #fff)' }}>✔</span>
                  )
                  : (idx + 1)}
              </span>
              <span className="label">{label}</span>
              {idx < steps.length - 1 && <span className="divider" aria-hidden="true">→</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
