import React from 'react';

export function SkeletonBox({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function HealthCardSkeleton() {
  return (
    <div className="card-wrapper skeleton-container">
      <div className="skeleton-header-row">
        <SkeletonBox width="64px" height="64px" borderRadius="20px" />
        <div className="skeleton-text-col">
          <SkeletonBox width="260px" height="28px" borderRadius="6px" />
          <SkeletonBox width="180px" height="18px" borderRadius="6px" />
        </div>
      </div>

      <div className="skeleton-info-strip">
        <SkeletonBox width="100%" height="60px" borderRadius="16px" />
      </div>

      <div className="skeleton-grid-2x2">
        <SkeletonBox width="100%" height="120px" borderRadius="16px" />
        <SkeletonBox width="100%" height="120px" borderRadius="16px" />
        <SkeletonBox width="100%" height="120px" borderRadius="16px" />
        <SkeletonBox width="100%" height="120px" borderRadius="16px" />
      </div>
    </div>
  );
}

export function QueueSkeleton() {
  return (
    <div className="card-wrapper skeleton-container text-center">
      <div className="skeleton-hero-center">
        <SkeletonBox width="72px" height="72px" borderRadius="50%" className="mx-auto" />
        <SkeletonBox width="240px" height="32px" borderRadius="8px" className="mx-auto mt-4" />
        <SkeletonBox width="300px" height="18px" borderRadius="6px" className="mx-auto mt-2" />
      </div>

      <div className="skeleton-grid-2x1 mt-6">
        <SkeletonBox width="100%" height="90px" borderRadius="20px" />
        <SkeletonBox width="100%" height="90px" borderRadius="20px" />
      </div>
    </div>
  );
}

export function ToastNotification({ message, type = 'info', onClose }) {
  if (!message) return null;
  return (
    <div className={`toast-notification toast-${type}`}>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          ✕
        </button>
      )}
    </div>
  );
}
