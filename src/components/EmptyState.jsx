import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/EmptyState.css';

export const EmptyState = ({
  icon = '🎾',
  title = 'No data found',
  description = 'There doesn\'t seem to be anything here right now.',
  ctaText,
  ctaLink,
  ctaAction,
  className = ''
}) => {
  return (
    <div className={`empty-state card card--interactive ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>

      {ctaLink && (
        <Link to={ctaLink} className="btn empty-state-cta">
          {ctaText}
        </Link>
      )}

      {!ctaLink && ctaAction && (
        <button onClick={ctaAction} className="btn empty-state-cta">
          {ctaText}
        </button>
      )}
    </div>
  );
};
