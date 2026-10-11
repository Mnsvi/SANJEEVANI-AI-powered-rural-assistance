import React, { useState, useEffect } from 'react';
import Header from './Header';
import PrivacyNotice from './PrivacyNotice';
import { HealthCardSkeleton } from './SkeletonLoader';
import { translations } from '../utils/translations';
import { getMyLatestConsultation } from '../services/consultationService';
import { CheckCircle2, User, Clock, FileText, ArrowLeft, ArrowRight, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { DEMO_CONSULTATION } from '../services/demoData';

export default function HealthCardScreen({
  user,
  token,
  lang = 'en',
  onLangChange,
  onBack,
  onNext,
  consultation: initialConsultation = null,
  demoMode = false
}) {
  const t = translations[lang] || translations.en;
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      if (demoMode) {
        setConsultation(initialConsultation || DEMO_CONSULTATION);
        return;
      }
      const res = await getMyLatestConsultation(token);
      if (res.success && res.data?.consultation) {
        setConsultation(res.data.consultation);
      } else if (res.data?.consultation === null) {
        // Fallback default structure for logged-in user if no consultation created yet
        setConsultation({
          _id: `CARD-${Date.now().toString().slice(-6)}`,
          patientId: user,
          symptomsSummary: ["Fever", "Headache", "Mild Fatigue"],
          aiDiagnosisBrief: "Patient reports acute onset fever accompanied by head throbbing.",
          priority: "Medium",
          status: "Pending_AI",
          createdAt: new Date().toISOString()
        });
      } else {
        setError(res.message || "Failed to load health card record");
      }
    } catch (err) {
      setError("Network error loading health card details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [token, demoMode, initialConsultation]);

  const patientIdFormatted = consultation?.patientId?._id
    ? `PAT-${consultation.patientId._id.slice(-6).toUpperCase()}`
    : user?._id
    ? `PAT-${user._id.slice(-6).toUpperCase()}`
    : 'PAT-804921';

  const patientAgeGender = user?.age && user?.gender
    ? `${user.age} Yrs / ${user.gender}`
    : 'Age/Gender: Not specified on profile';

  const dateFormatted = consultation?.createdAt
    ? new Date(consultation.createdAt).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString();

  const summaryText = `Health Card Generated for ${user?.fullName || 'Patient'}. Patient ID ${patientIdFormatted}. Symptoms reported: ${(consultation?.symptomsSummary || []).join(', ')}. Priority level ${consultation?.priority || 'Medium'}.`;

  return (
    <div className="screen-container health-card-screen">
      <Header
        currentLang={lang}
        onLangChange={onLangChange}
        textToSpeak={summaryText}
        speechLabel={t.listenSummary}
      />

      <main className="main-content">
        {loading ? (
          <HealthCardSkeleton />
        ) : error ? (
          <div className="state-card error-state animate-fade-in">
            <AlertTriangle className="error-icon" size={32} />
            <p>{error}</p>
            <button className="btn-secondary sm" onClick={fetchRecord}>
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="card-wrapper animate-fade-in">
            {/* Top Success Badge & Heading */}
            <div className="card-header-banner">
              <div className="card-header-icon-wrapper signature-badge-shine">
                <CheckCircle2 size={36} className="card-header-icon" />
              </div>
              <div className="card-header-titles">
                <h2>{t.healthCardTitle}</h2>
                <p>{t.healthCardSub}</p>
              </div>
            </div>

            {/* Metadata Info Strip */}
            <div className="info-strip animate-fade-in stagger-1">
              <div className="info-item">
                <span className="info-label">{t.patientId}</span>
                <span className="info-value highlight">{patientIdFormatted}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t.ageGender}</span>
                <span className="info-value">{patientAgeGender}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t.dateTime}</span>
                <span className="info-value">{dateFormatted}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t.language}</span>
                <span className="info-value">{lang === 'hi' ? 'हिंदी (Hindi)' : 'English'}</span>
              </div>
            </div>

            {/* 2-Column Clinical Intake Grid */}
            <div className="intake-grid">
              {/* Column 1: Bothering You (Chief Complaint) */}
              <div className="intake-card animate-fade-in stagger-1">
                <div className="intake-card-title">
                  <FileText size={18} className="intake-icon" />
                  <span>{t.botheringYou}</span>
                </div>
                <blockquote className="patient-quote">
                  "{consultation?.aiDiagnosisBrief || "Feeling unwell with high fever and body ache since yesterday evening."}"
                </blockquote>
              </div>

              {/* Column 2: Symptoms Reported */}
              <div className="intake-card animate-fade-in stagger-2">
                <div className="intake-card-title">
                  <Activity size={18} className="intake-icon" />
                  <span>{t.symptomsReported}</span>
                </div>
                <ul className="symptoms-bullet-list">
                  {consultation?.symptomsSummary && consultation.symptomsSummary.length > 0 ? (
                    consultation.symptomsSummary.map((symptom, idx) => (
                      <li key={idx}>
                        <span className="bullet-dot" />
                        <span>{symptom}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li><span className="bullet-dot" /><span>Fever & Chills</span></li>
                      <li><span className="bullet-dot" /><span>Severe Headache</span></li>
                      <li><span className="bullet-dot" /><span>Body Weakness</span></li>
                    </>
                  )}
                </ul>
              </div>

              {/* Column 3: History & Background */}
              <div className="intake-card animate-fade-in stagger-3">
                <div className="intake-card-title">
                  <User size={18} className="intake-icon" />
                  <span>{t.historyBackground}</span>
                </div>
                <div className="background-tags">
                  <span className="badge-tag">No known drug allergies</span>
                  <span className="badge-tag">No chronic hypertension</span>
                  <span className="badge-tag neutral">Vaccination Up-to-date</span>
                </div>
              </div>

              {/* Column 4: Other Information */}
              <div className="intake-card animate-fade-in stagger-4">
                <div className="intake-card-title">
                  <Clock size={18} className="intake-icon" />
                  <span>{t.otherInfo}</span>
                </div>
                <p className="intake-text-sub">
                  Priority level assigned: <strong className="priority-tag">{consultation?.priority || 'Medium'}</strong>. Cough or breathing difficulty not severe. Patient requested Hindi consultation.
                </p>
              </div>
            </div>

            {/* Bottom Status + Actions: always visible on a normal laptop viewport */}
            <div className="card-footer-banner health-card-footer-actions">
              <div className="health-card-footer-message">
                <span className="pulse-indicator" />
                <p>{t.sentToDoctor}</p>
              </div>
              <div className="health-card-footer-buttons">
                <button className="btn-secondary btn-footer" onClick={onBack}>
                  <ArrowLeft size={17} />
                  <span>{t.goBack}</span>
                </button>
                <button className="btn-primary btn-footer" onClick={onNext}>
                  <span>{t.seeQueue}</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            {/* Kept for responsive layouts where the footer actions may wrap. */}
            <div className="screen-actions health-card-secondary-actions">
              <button className="btn-secondary" onClick={onBack}>
                <ArrowLeft size={18} />
                <span>{t.goBack}</span>
              </button>
              <button className="btn-primary" onClick={onNext}>
                <span>{t.seeQueue}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        <PrivacyNotice lang={lang} />
      </main>
    </div>
  );
}
