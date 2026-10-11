import React, { useState, useEffect } from 'react';
import Header from './Header';
import { ToastNotification } from './SkeletonLoader';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  FileText,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  Activity,
  CreditCard,
  Building2,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { getMyLatestConsultation, createConsultation } from '../services/consultationService';
import { DEMO_CONSULTATION } from '../services/demoData';

export default function Home({ user, token, lang = 'en', onLangChange, onLogout, onStartConsultation, demoMode = false, queueState = { active:false, position:3, wait:8, ready:false }, onReturnToQueue }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [latestConsultation, setLatestConsultation] = useState(null);

  // Time-aware greeting generator (Good morning / afternoon / evening)
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper for initial avatar fallback
  const getInitials = (name) => {
    if (!name) return 'P';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Fetch recent activity on mount
  useEffect(() => {
    let active = true;
    async function loadActivityData() {
      if (demoMode) {
        setLatestConsultation(DEMO_CONSULTATION);
        return;
      }
      try {
        const res = await getMyLatestConsultation(token);
        if (active && res.success && res.data?.consultation) {
          setLatestConsultation(res.data.consultation);
        }
      } catch (err) {
        console.warn('Error loading recent consultation:', err);
      }
    }
    loadActivityData();
    return () => {
      active = false;
    };
  }, [token, demoMode]);

  const handleLaunchConsultation = async () => {
    if (demoMode) {
      onStartConsultation?.(null);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        onStartConsultation?.(null);
        return;
      }
      // Check if patient already has an ongoing consultation
      const res = await getMyLatestConsultation(token);

      if (res.status === 401) {
        // Handled by global apiClient 401 interceptor
        return;
      }

      const existingConsultation = res.data?.consultation || res.consultation;

      if (res.success && existingConsultation) {
        // Ongoing consultation found, jump directly into queue / journey
        if (onStartConsultation) {
          onStartConsultation(existingConsultation);
        }
      } else {
        // Create initial intake consultation
        const newConsultation = await createConsultation(
          {
            symptomsSummary: ['General Wellness & Routine Checkup'],
            priority: 'Medium',
            priorityLevel: 'Medium',
            aiDiagnosisBrief: 'Pending Doctor Evaluation',
          },
          token
        );

        const createdConsultation = newConsultation.data?.consultation || newConsultation.consultation;

        if (newConsultation.success && createdConsultation) {
          if (onStartConsultation) {
            onStartConsultation(createdConsultation);
          }
        } else {
          // Fallback to consultation flow
          if (onStartConsultation) {
            onStartConsultation(null);
          }
        }
      }
    } catch (err) {
      console.error('Error starting tele-consultation:', err);
      setErrorMessage(err.message || 'Failed to connect to consultation service.');
      if (onStartConsultation) {
        onStartConsultation(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecords = () => {
    setToastMessage('All past medical records are securely archived on your profile.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const timeGreeting = getTimeGreeting();
  const userName = user?.fullName || 'Patient';
  const welcomeSpeech = `${timeGreeting}, ${userName}. Your biometric face verification is complete. Welcome to Sanjeevani.`;

  const lastVisitFormatted = user?.lastConsultation
    ? new Date(user.lastConsultation).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Today (Initial Visit)';

  const maskedAadhaar = user?.aadhar
    ? `•••• •••• ${user.aadhar.slice(-4)}`
    : '•••• •••• 8492';

  return (
    <div className="dashboard-page-container">
      {/* Reusable Sanjeevani Brand Header */}
      <Header
        currentLang={lang}
        onLangChange={onLangChange}
        textToSpeak={welcomeSpeech}
        speechLabel="Listen"
        speechSub="Tap for voice readout"
        onLogout={onLogout}
        showLogout={true}
      />

      <main className="dashboard-main-content">
        {queueState?.active && (
          <div className="active-queue-banner animate-fade-in">
            <div className="active-queue-info">
              <div className="active-queue-icon"><Clock size={21} /></div>
              <div className="active-queue-copy">
                <strong>{queueState.ready ? 'Doctor is ready — your consultation is waiting' : `You are still in the queue — #${queueState.position}`}</strong>
                <span>{queueState.ready ? 'Return to the queue to join your secure video consultation.' : `Estimated wait: ~${queueState.wait} minutes. Your place is saved.`}</span>
              </div>
            </div>
            <button className="active-queue-button" onClick={onReturnToQueue}>
              Return to Queue <ArrowRight size={17} />
            </button>
          </div>
        )}
        {/* 1. Hero / Welcome Section — Visual Anchor */}
        <section className="dashboard-hero-v2 animate-fade-in">
          <div className="hero-avatar-area">
            <div className="hero-avatar-circle">
              <span>{getInitials(userName)}</span>
              <div className="avatar-online-dot" title="Biometric Session Active" />
            </div>
          </div>

          <div className="hero-content-area">
            <div className="hero-badge-row">
              <div className="verified-pill-v2">
                <span className="pulse-dot-green"></span>
                <CheckCircle2 size={14} />
                <span>Verified Patient</span>
              </div>
              <span className="hero-security-tag">
                <ShieldCheck size={13} /> Biometric Authenticated
              </span>
            </div>

            <h2 className="hero-greeting">
              {timeGreeting}, <span className="highlight-name">{userName}</span>!
            </h2>
            <p className="hero-subtitle">
              Welcome back to your Sanjeevani Health Portal. Your identity is verified via Biometric Face Recognition.
            </p>
          </div>
        </section>

        {/* 2. Quick-Stats Row — Substance & Data Anchorage */}
        <div className="quick-stats-row animate-fade-in stagger-1">
          <div className="stat-chip">
            <div className="stat-chip-icon teal">
              <Calendar size={18} />
            </div>
            <div className="stat-chip-info">
              <span className="stat-chip-label">Last Visit</span>
              <span className="stat-chip-value">{lastVisitFormatted}</span>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-chip-icon blue">
              <MapPin size={18} />
            </div>
            <div className="stat-chip-info">
              <span className="stat-chip-label">Village Code</span>
              <span className="stat-chip-value">{user?.villageCode || 'VIL-102'}</span>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-chip-icon green">
              <Activity size={18} />
            </div>
            <div className="stat-chip-info">
              <span className="stat-chip-label">Doctors Online</span>
              <span className="stat-chip-value live-green-text">
                <span className="live-mini-dot"></span> 4 Active & Ready
              </span>
            </div>
          </div>
        </div>

        {/* 3. Rebalanced 60/40 Two-Column Layout */}
        <div className="dashboard-layout-60-40">
          {/* Primary Column (60%): Core Actions & Activity */}
          <div className="dashboard-primary-col">
            {/* Primary Action Hero Card: Tele-Consultation */}
            <div className="dashboard-card primary-action-hero-card animate-fade-in stagger-2">
              <div className="hero-card-header">
                <div className="icon-badge-brand">
                  <Stethoscope size={24} />
                </div>
                <div className="hero-card-title-group">
                  <span className="status-kiosk-pill">24/7 Tele-Health Kiosk Active</span>
                  <h3 className="hero-card-title">Start Tele-Consultation</h3>
                </div>
              </div>

              <p className="hero-card-description">
                Connect directly with an attending specialist doctor via live HD video. Average queue wait time is ~5 minutes.
              </p>

              {errorMessage && (
                <div className="dashboard-error-banner" role="alert">
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="hero-card-actions">
                <button
                  className={`btn-primary-consultation-v2 ${isLoading ? 'loading' : ''}`}
                  onClick={handleLaunchConsultation}
                  disabled={isLoading}
                  aria-label="Start Tele-Consultation"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      <span>Connecting to Service...</span>
                    </>
                  ) : (
                    <>
                      <div className="btn-icon-circle-v2">
                        <Stethoscope size={22} />
                      </div>
                      <span className="btn-text-hero">Launch Consultation</span>
                      <ArrowRight size={20} className="btn-arrow-right" />
                    </>
                  )}
                </button>

                <button
                  className="btn-secondary-records-v2"
                  type="button"
                  onClick={handleViewRecords}
                >
                  <FileText size={18} />
                  <span>Medical History Records</span>
                </button>
              </div>
            </div>

            {/* Recent Activity / Consultation Card */}
            <div className="dashboard-card recent-activity-card animate-fade-in stagger-3">
              <div className="card-header-bar">
                <div className="icon-badge-sm">
                  <Clock size={20} />
                </div>
                <h3 className="card-title">Recent Activity & Consultations</h3>
              </div>

              {latestConsultation ? (
                <div className="activity-consultation-tile">
                  <div className="tile-top-row">
                    <span className="consultation-id-badge">
                      REF #{latestConsultation._id?.slice(-6).toUpperCase()}
                    </span>
                    <span className={`status-pill ${latestConsultation.status?.toLowerCase()}`}>
                      {latestConsultation.status || 'Active'}
                    </span>
                  </div>

                  <p className="tile-diagnosis">
                    "{latestConsultation.aiDiagnosisBrief || 'General Routine Intake'}"
                  </p>

                  <div className="tile-meta-row">
                    <span className="tile-meta-item">
                      <Calendar size={14} />
                      {new Date(latestConsultation.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="tile-meta-item priority-tag">
                      Priority: {latestConsultation.priority || 'Medium'}
                    </span>
                  </div>

                  <button
                    className="btn-tile-action"
                    onClick={() => onStartConsultation(latestConsultation)}
                  >
                    <span>View Consultation Record</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <div className="activity-empty-state">
                  <div className="empty-icon-circle">
                    <ShieldCheck size={28} className="empty-icon" />
                  </div>
                  <h4>No Previous Consultations</h4>
                  <p>
                    Your consultation history, digital prescriptions, and doctor notes will automatically appear here after your first visit.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Column (40%): Patient Profile Reference */}
          <div className="dashboard-secondary-col">
            <div className="dashboard-card profile-section-card-v2 animate-fade-in stagger-2">
              <div className="profile-card-header">
                <div className="profile-avatar-sm">
                  <span>{getInitials(userName)}</span>
                </div>
                <div className="profile-header-titles">
                  <h3 className="profile-name">{userName}</h3>
                  <span className="profile-verified-badge">
                    <CheckCircle size={13} /> Biometric Verified
                  </span>
                </div>
              </div>

              {/* Group 1: Contact & Identification */}
              <div className="profile-group">
                <h4 className="group-title">Contact & Identification</h4>
                <ul className="profile-info-grid-v2">
                  <li className="info-row-v2">
                    <div className="info-label-group-v2">
                      <Phone size={15} className="info-icon" />
                      <span>Mobile</span>
                    </div>
                    <span className="info-value-v2">{user?.mobile || 'N/A'}</span>
                  </li>

                  <li className="info-row-v2">
                    <div className="info-label-group-v2">
                      <CreditCard size={15} className="info-icon" />
                      <span>Aadhaar</span>
                    </div>
                    <span className="info-value-v2 highlight-code">{maskedAadhaar}</span>
                  </li>
                </ul>
              </div>

              {/* Group 2: Location & Access */}
              <div className="profile-group">
                <h4 className="group-title">Location & Access</h4>
                <ul className="profile-info-grid-v2">
                  <li className="info-row-v2">
                    <div className="info-label-group-v2">
                      <Building2 size={15} className="info-icon" />
                      <span>Village Code</span>
                    </div>
                    <span className="info-value-v2">{user?.villageCode || 'VIL-102'}</span>
                  </li>

                  <li className="info-row-v2">
                    <div className="info-label-group-v2">
                      <MapPin size={15} className="info-icon" />
                      <span>Address</span>
                    </div>
                    <span className="info-value-v2 truncate-text" title={user?.address}>
                      {user?.address || 'Health Kiosk Centre'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Security Affordance Badge */}
              <div className="profile-security-footer">
                <Sparkles size={16} className="security-icon" />
                <span>Face Template Encrypted & Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {toastMessage && (
        <ToastNotification
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
