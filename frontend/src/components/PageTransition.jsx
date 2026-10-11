import React from 'react';

/**
 * PageTransition Wrapper
 * Provides a uniform, subtle fade-in and slight slide-up animation (200ms)
 * across all screen transitions in Sanjeevani.
 */
export default function PageTransition({ children, className = '' }) {
  return (
    <div className={`sanjeevani-page-transition ${className}`}>
      {children}
    </div>
  );
}
