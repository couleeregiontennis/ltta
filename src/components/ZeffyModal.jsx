import React from 'react';
import '../styles/ZeffyModal.css';

export const ZeffyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="zeffy-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="zeffy-modal-title">
      <div className="zeffy-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="zeffy-modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        
        <h2 id="zeffy-modal-title">Why we use Zeffy</h2>
        
        <div className="zeffy-modal-body">
          <p>
            We use Zeffy for our online payments because they are the only platform that allows 
            nonprofits to keep <strong>100% of the funds</strong>. They don't charge us any 
            transaction fees, ensuring your full contribution supports the association.
          </p>

          <div className="zeffy-warning-box">
            <h3>⚠️ Important Note</h3>
            <p>
              During checkout, Zeffy defaults to a "voluntary contribution" to their platform. 
              <strong> You can manually change this amount to $0</strong> if you prefer not to tip 
              their service.
            </p>
          </div>
        </div>

        <div className="zeffy-modal-actions">
          <a 
            href="https://www.zeffy.com/en-US/ticketing/2026-la-crosse-team-tennis" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-zeffy-continue"
            onClick={onClose}
          >
            Continue to Registration
          </a>
        </div>
      </div>
    </div>
  );
};
