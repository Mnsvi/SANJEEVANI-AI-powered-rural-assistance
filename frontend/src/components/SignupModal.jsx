import React, { useState } from 'react';
import { signUpUser } from '../services/authService';
import { UserPlus, X, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupModal({ isOpen, onClose, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    aadhar: '',
    address: '',
    villageCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUpUser(formData);
      if (result.success && result.data?.token && result.data?.user) {
        onSignupSuccess(result.data.token, result.data.user);
      } else {
        setError(result.message || 'Failed to create account. Please check your details.');
      }
    } catch (err) {
      setError(err.message || 'Server error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-icon-badge">
            <UserPlus size={24} />
          </div>
          <h2>Create Sanjeevni Account</h2>
          <p>Enter your details below to begin face registration</p>
        </div>

        {error && (
          <div className="modal-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              placeholder="e.g. Dr. Ananya Sharma"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="ananya@sanjeevni.org"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                required
                placeholder="9876543210"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="aadhar">Aadhaar Number *</label>
              <input
                type="text"
                id="aadhar"
                name="aadhar"
                required
                placeholder="123456789012"
                value={formData.aadhar}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                required
                placeholder="Village Health Centre, Block A"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="villageCode">Village Code *</label>
              <input
                type="text"
                id="villageCode"
                name="villageCode"
                required
                placeholder="VIL-104"
                value={formData.villageCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-modal-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Proceed to Face Registration</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
