import React, { useState, useEffect } from 'react';
import Header from './Header';
import PrivacyNotice from './PrivacyNotice';
import { translations } from '../utils/translations';
import { CheckCircle2, FileText, Calendar, Clock, Home, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function ThankYouScreen({
  user,
  consultation,
  lang = 'en',
  onLangChange,
  onViewPrescription,
  onFinish
}) {
  const t = translations[lang] || translations.en;
  const [countdown, setCountdown] = useState(15);

  // Real 15-second ticking countdown that automatically logs out / returns home
  useEffect(() => {
    if (countdown <= 0) {
      onFinish();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onFinish]);

  const doctorName = consultation?.ashaWorkerAssigned?.fullName || "Dr. Sanjeevani Specialist";
  const hasFollowUp = Boolean(consultation?.followUpDate);

  const speechText = `Thank you! Your consultation with Sanjeevani is complete. Your prescription is ready for viewing. This session will auto end in ${countdown} seconds.`;

  return (
    <div className="screen-container thank-you-page">
      <Header
        currentLang={lang}
        onLangChange={onLangChange}
        textToSpeak={speechText}
        speechLabel={t.listen}
      />

      <main className="main-content">
        <div className="card-wrapper animate-fade-in text-center">
          {/* Confetti Accent Icon & Checkmark Header */}
          <div className="thank-you-hero">
            <div className="sparkle-backdrop">
              <Sparkles size={28} className="sparkle-icon-left" />
              <div className="check-badge-circle signature-badge-shine">
                <CheckCircle2 size={54} className="check-main-icon" />
              </div>
              <Sparkles size={28} className="sparkle-icon-right" />
            </div>
            <h2 className="thank-you-title">{t.thankYouTitle}</h2>
            <p className="thank-you-sub">{t.thankYouSub}</p>
          </div>

          {/* Cards Grid: Prescription Ready & Next Appointment */}
          <div className="cards-two-column-grid">
            {/* Prescription Ready Card */}
            <div className="action-card rx-ready-card animate-fade-in stagger-1">
              <div className="action-card-header">
                <div className="action-icon-wrapper green">
                  <FileText size={24} />
                </div>
                <h3>{t.prescriptionReady}</h3>
              </div>
              <p className="action-card-desc">
                Your medical prescription has been generated, signed, and saved to your health portal profile.
              </p>
              <button className="btn-secondary sm wide" onClick={onViewPrescription}>
                <span>{t.viewPrescription}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Next Appointment Card */}
            <div className="action-card appointment-card animate-fade-in stagger-2">
              <div className="action-card-header">
                <div className="action-icon-wrapper blue">
                  <Calendar size={24} />
                </div>
                <h3>{t.nextAppointment}</h3>
              </div>
              {hasFollowUp ? (
                <div className="appointment-details">
                  <p><strong>Doctor:</strong> {doctorName}</p>
                  <p><strong>Date:</strong> {new Date(consultation.followUpDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="action-card-desc empty-state-text">
                  {t.noFollowUp}
                </p>
              )}
            </div>
          </div>

          {/* Guidelines Reminder Strip */}
          <div className="reminder-strip">
            <ShieldAlert size={20} className="reminder-icon" />
            <span>Please remember to follow the dosage instructions given in your prescription and stay hydrated.</span>
          </div>

          {/* Auto-Session End Countdown Timer */}
          <div className="countdown-banner">
            <Clock size={18} className="countdown-icon" />
            <span>
              {t.autoSessionEnd} <strong className="countdown-timer">{countdown} {t.seconds}</strong>.
            </span>
          </div>

          {/* Primary CTA */}
          <div className="screen-actions center-actions">
            <button className="btn-primary lg" onClick={onFinish}>
              <Home size={20} />
              <span>{t.done}</span>
            </button>
          </div>
        </div>

        <PrivacyNotice lang={lang} />
      </main>
    </div>
  );
}
