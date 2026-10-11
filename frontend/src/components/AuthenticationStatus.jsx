import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';

export default function AuthenticationStatus({ status, user, error, onRetry, onRegister }) {
  if (!status && !error) return null;

  if (status === 'success') {
    return (
      <div className="auth-status-card success-banner" role="alert">
        <CheckCircle2 className="status-icon text-success" size={24} />
        <div className="status-content">
          <p className="status-title">Identity Verified</p>
          <p className="status-message">
            Welcome back, <strong>{user?.fullName || 'Patient'}</strong>! Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unregistered') {
    return (
      <div className="auth-status-card unregistered-banner" role="alert">
        <UserPlus className="status-icon text-amber" size={24} />
        <div className="status-content">
          <p className="status-title">New Registration Required</p>
          <p className="status-message">
            {error || "We don't recognize this face yet — let's get you registered."}
          </p>
          {onRegister && (
            <button className="btn-status-register" onClick={onRegister}>
              <UserPlus size={16} />
              <span>Register Account & Face</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status === 'failure' || error) {
    return (
      <div className="auth-status-card failure-banner" role="alert">
        <AlertCircle className="status-icon text-danger" size={24} />
        <div className="status-content">
          <p className="status-title">Authentication Unsuccessful</p>
          <p className="status-message">
            {error || "We couldn't verify your identity. Please make sure your face is clearly visible and try again."}
          </p>
          {onRetry && (
            <button className="btn-status-retry" onClick={onRetry}>
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
