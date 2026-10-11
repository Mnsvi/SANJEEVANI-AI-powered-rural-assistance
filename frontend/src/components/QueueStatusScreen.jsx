import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import PrivacyNotice from './PrivacyNotice';
import { translations } from '../utils/translations';
import { getMyLatestConsultation, updateConsultationStatus } from '../services/consultationService';
import { Clock, Users, CheckCircle2, ShieldCheck, Bell, FileCheck, ArrowRight, XCircle, Home, Video } from 'lucide-react';
import { DEMO_QUEUE, DEMO_CONSULTATION } from '../services/demoData';

export default function QueueStatusScreen({
  token,
  lang = 'en',
  onLangChange,
  onLeaveQueue,
  onDoctorReady,
  demoMode = false,
  queueState,
  onQueueUpdate,
}) {
  const t = translations[lang] || translations.en;
  const [queuePosition, setQueuePosition] = useState(queueState?.position ?? DEMO_QUEUE.queuePosition);
  const [estimatedWait, setEstimatedWait] = useState(queueState?.wait ?? DEMO_QUEUE.estimatedWaitMinutes);
  const [consultation, setConsultation] = useState(demoMode ? DEMO_CONSULTATION : null);
  const [loading, setLoading] = useState(!demoMode);
  const [cancelling, setCancelling] = useState(false);
  const [demoReady, setDemoReady] = useState((queueState?.position ?? DEMO_QUEUE.queuePosition) <= 1);

  const updateLocalQueue = (position, wait) => {
    setQueuePosition(position);
    setEstimatedWait(wait);
    setDemoReady(position <= 1);
    onQueueUpdate?.({ position, wait, ready: position <= 1 });
  };

  useEffect(() => {
    if (!demoMode) return;
    const current = queueState?.position ?? DEMO_QUEUE.queuePosition;
    if (current <= 1) {
      setDemoReady(true);
      return;
    }

    // Demo simulation: the patient keeps their place even if they return home.
    // Every 8 seconds one patient is served. This makes the live demo feel real.
    const timer = setInterval(() => {
      setQueuePosition(prev => {
        const next = Math.max(1, prev - 1);
        const nextWait = Math.max(0, Math.round((next - 1) * 4));
        setEstimatedWait(nextWait);
        setDemoReady(next <= 1);
        onQueueUpdate?.({ position: next, wait: nextWait, ready: next <= 1 });
        return next;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [demoMode]);

  useEffect(() => {
    if (demoMode) return;
    const fetchQueueData = async () => {
      try {
        const res = await getMyLatestConsultation(token);
        if (res.success && res.data) {
          if (res.data.queuePosition !== undefined) setQueuePosition(res.data.queuePosition);
          if (res.data.estimatedWaitMinutes !== undefined) setEstimatedWait(res.data.estimatedWaitMinutes);
          if (res.data.consultation) {
            setConsultation(res.data.consultation);
            if (res.data.consultation.status === 'Awaiting_Doctor' || res.data.consultation.status === 'Consultation_Complete') {
              onDoctorReady(res.data.consultation);
            }
          }
        }
      } catch (err) {
        console.error('Queue poll error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 4000);
    return () => clearInterval(interval);
  }, [token, demoMode]);

  const handleCancelQueue = async () => {
    setCancelling(true);
    try {
      if (!demoMode && consultation?._id) {
        await updateConsultationStatus(consultation._id, 'Medicine_Delivered', token);
      }
      onLeaveQueue?.(true);
    } finally {
      setCancelling(false);
    }
  };

  const steps = useMemo(() => [
    { label: t.step1, status: 'completed' },
    { label: t.step2, status: 'completed' },
    { label: t.step3, status: queuePosition <= 1 ? 'completed' : 'active' },
    { label: t.step4, status: queuePosition <= 1 ? 'active' : 'pending' },
  ], [t, queuePosition]);

  const speechText = demoReady
    ? 'Your doctor is ready. Please join the consultation now.'
    : `You are currently number ${queuePosition} in the queue. Estimated wait time is ${estimatedWait} minutes.`;

  if (loading) return <div className="screen-container queue-status-page"><Header currentLang={lang} onLangChange={onLangChange} /><main className="main-content"><div className="card-wrapper">Loading your queue...</div></main></div>;

  return (
    <div className="screen-container queue-status-page">
      <Header currentLang={lang} onLangChange={onLangChange} textToSpeak={speechText} speechLabel={t.listen} />

      <main className="main-content queue-main-content">
        <div className="card-wrapper animate-fade-in queue-card-compact text-center">
          <div className="queue-hero">
            <div className="queue-pulse-ring-wrapper">
              <div className="pulse-outer-ring" />
              <div className="pulse-inner-icon"><Users size={28} /></div>
            </div>
            <h2 className="queue-title">{demoReady ? 'Doctor is ready!' : t.youreInQueue}</h2>
            <p className="queue-sub">
              {demoReady ? 'Your consultation room is ready. Join when you are ready.' : 'You can return home without losing your place in the queue.'}
            </p>
          </div>

          <div className="stat-blocks-grid queue-stats-compact">
            <div className="stat-card primary-stat">
              <span className="stat-label">YOUR POSITION</span>
              <div className="stat-value-group">
                <span className="stat-number">#{queuePosition}</span>
                <span className="stat-badge">LIVE</span>
              </div>
            </div>
            <div className="stat-card secondary-stat">
              <span className="stat-label">ESTIMATED WAIT</span>
              <div className="stat-value-group">
                <Clock size={22} className="stat-icon" />
                <span className="stat-number">~{estimatedWait} mins</span>
              </div>
            </div>
          </div>

          <div className="progress-tracker-container queue-tracker-compact">
            <div className="tracker-track">
              {steps.map((step, idx) => (
                <div key={idx} className={`tracker-step ${step.status}`}>
                  <div className="step-circle">
                    {step.status === 'completed' ? <CheckCircle2 size={17} /> : <span>{idx + 1}</span>}
                  </div>
                  <span className="step-text">{step.label}</span>
                  {idx < steps.length - 1 && <div className="step-connector" />}
                </div>
              ))}
            </div>
          </div>

          <div className="queue-return-note">
            <Home size={18} />
            <span><strong>Your place is saved.</strong> You can go back to the home screen and return here anytime.</span>
          </div>

          {demoReady && (
            <div className="queue-ready-banner">
              <Video size={20} />
              <div><strong>Doctor is ready for you</strong><span>Click Join Consultation to enter the secure video room.</span></div>
            </div>
          )}

          <div className="screen-actions queue-actions-compact">
            <button className="btn-secondary queue-home-btn" onClick={() => onLeaveQueue?.(false)} disabled={cancelling}>
              <Home size={18} /> Return Home
            </button>
            {!demoReady ? (
              <>
                <button className="btn-secondary danger-hover" onClick={handleCancelQueue} disabled={cancelling}>
                  <XCircle size={18} /> {cancelling ? 'Leaving...' : 'Cancel Consultation'}
                </button>
                {demoMode && (
                  <button
                    className="queue-demo-ready-btn"
                    onClick={() => updateLocalQueue(1, 0)}
                    type="button"
                    title="Hackathon demo control: move the queue to the doctor-ready state"
                  >
                    <Video size={16} /> Simulate Doctor Ready
                  </button>
                )}
              </>
            ) : (
              <button className="btn-primary queue-join-btn" onClick={() => onDoctorReady(consultation || DEMO_CONSULTATION)}>
                <Video size={18} /> Join Consultation <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
        <PrivacyNotice lang={lang} />
      </main>
    </div>
  );
}
