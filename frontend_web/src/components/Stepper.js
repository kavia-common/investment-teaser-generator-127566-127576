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
   * @returns {JSX.Element}
   */
  return (
    <nav className="stepper">
      <ol>
        {steps.map((label, idx) => (
          <li
            key={label}
            className={`stepper-step${idx === currentStep ? ' active' : ''}${idx < currentStep ? ' completed' : ''}`}
          >
            <span className="circle">{idx + 1}</span>
            <span className="label">{label}</span>
            {idx < steps.length - 1 && <span className="divider">→</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Stepper;
