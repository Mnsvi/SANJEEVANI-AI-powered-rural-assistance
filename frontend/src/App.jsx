import React, { useState, useEffect } from 'react';
import FaceAuthentication from './pages/FaceAuthentication';
import Home from './components/Home';
import HealthCardScreen from './components/HealthCardScreen';
import AIHealthAssistant from './components/AIHealthAssistant';
import QueueStatusScreen from './components/QueueStatusScreen';
import VideoConsultationScreen from './components/VideoConsultationScreen';
import PrescriptionScreen from './components/PrescriptionScreen';
import ThankYouScreen from './components/ThankYouScreen';
import PageTransition from './components/PageTransition';
import { getStoredToken, removeStoredToken, setStoredToken, onAuthError } from './services/apiClient';
import './App.css';
import { DEMO_CONSULTATION, DEMO_TOKEN } from './services/demoData';

function App() {
  const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => demoMode ? DEMO_TOKEN : getStoredToken());
  const [lang, setLang] = useState('en');
  const [activeStep, setActiveStep] = useState('home'); // 'home' | 'ai-intake' | 'health-card' | 'queue' | 'video' | 'prescription' | 'thank-you'
  const [activeConsultation, setActiveConsultation] = useState(demoMode ? DEMO_CONSULTATION : null);
  const [authAlert, setAuthAlert] = useState(null);
  const [queueState, setQueueState] = useState({ position: 3, wait: 8, ready: false, active: false });


  // Subscribe to global 401 unauthorized errors from apiClient
  useEffect(() => {
    const unsubscribe = onAuthError((message) => {
      setAuthenticatedUser(null);
      setAuthToken(null);
      removeStoredToken();
      setActiveStep('home');
      setActiveConsultation(null);
      setAuthAlert(message || 'Session expired. Please scan your face to log in again.');
    });

    return () => unsubscribe();
  }, []);

  const handleAuthenticated = (user, token) => {
    setAuthAlert(null);
    setAuthenticatedUser(user);
    if (token) {
      setAuthToken(token);
      setStoredToken(token);
    }
    setActiveStep('home');
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setAuthToken(null);
    removeStoredToken();
    setActiveStep('home');
    setActiveConsultation(null);
    setAuthAlert(null);
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
  };

  // Screen Transitions
  const startConsultationFlow = (consultationRecord) => {
    if (consultationRecord) {
      setActiveConsultation(consultationRecord);
    }
    setActiveStep('ai-intake');
  };

  const goToQueue = () => {
    setQueueState(prev => ({ ...prev, active: true }));
    setActiveStep('queue');
  };

  const returnFromQueue = (cancelled = false) => {
    if (cancelled) setQueueState(prev => ({ ...prev, active: false }));
    setActiveStep('home');
  };

  const goToVideoCall = (consultationRecord) => {
    setQueueState(prev => ({ ...prev, active: false, ready: false }));
    if (consultationRecord) {
      setActiveConsultation(consultationRecord);
    }
    setActiveStep('video');
  };

  const goToPrescription = () => {
    setActiveStep('prescription');
  };

  const goToThankYou = () => {
    setActiveStep('thank-you');
  };

  return (
    <div className="sanjeevani-app">
      {authAlert && !authenticatedUser && (
        <div className="global-auth-alert-bar" role="alert">
          <span>{authAlert}</span>
          <button className="btn-close-alert" onClick={() => setAuthAlert(null)}>
            ✕
          </button>
        </div>
      )}

      {!authenticatedUser ? (
        <PageTransition key="auth">
          <FaceAuthentication onAuthenticated={handleAuthenticated} demoMode={demoMode} />
        </PageTransition>
      ) : activeStep === 'home' ? (
        <PageTransition key="home">
          <Home
            user={authenticatedUser}
            token={authToken}
            lang={lang}
            onLangChange={handleLangChange}
            onLogout={handleLogout}
            onStartConsultation={startConsultationFlow}
            demoMode={demoMode}
            queueState={queueState}
            onReturnToQueue={() => setActiveStep('queue')}
          />
        </PageTransition>
      ) : activeStep === 'ai-intake' ? (
        <PageTransition key="ai-intake">
          <AIHealthAssistant
            user={authenticatedUser}
            lang={lang}
            onLangChange={handleLangChange}
            onBack={() => setActiveStep('home')}
            onComplete={(consultationRecord) => {
              setActiveConsultation(consultationRecord);
              setActiveStep('health-card');
            }}
          />
        </PageTransition>
      ) : activeStep === 'health-card' ? (
        <PageTransition key="health-card">
          <HealthCardScreen
            user={authenticatedUser}
            token={authToken}
            lang={lang}
            onLangChange={handleLangChange}
            onBack={() => setActiveStep('home')}
            onNext={goToQueue}
            consultation={activeConsultation}
            demoMode={demoMode}
          />
        </PageTransition>
      ) : activeStep === 'queue' ? (
        <PageTransition key="queue">
          <QueueStatusScreen
            token={authToken}
            lang={lang}
            onLangChange={handleLangChange}
            onLeaveQueue={returnFromQueue}
            onDoctorReady={goToVideoCall}
            demoMode={demoMode}
            queueState={queueState}
            onQueueUpdate={(next) => setQueueState(prev => ({ ...prev, ...next, active: true }))}
          />
        </PageTransition>
      ) : activeStep === 'video' ? (
        <PageTransition key="video">
          <VideoConsultationScreen
            user={authenticatedUser}
            consultation={activeConsultation}
            lang={lang}
            onLangChange={handleLangChange}
            onEndCall={goToPrescription}
          />
        </PageTransition>
      ) : activeStep === 'prescription' ? (
        <PageTransition key="prescription">
          <PrescriptionScreen
            user={authenticatedUser}
            consultation={activeConsultation}
            lang={lang}
            onLangChange={handleLangChange}
            onBack={() => setActiveStep('video')}
            onNext={goToThankYou}
          />
        </PageTransition>
      ) : activeStep === 'thank-you' ? (
        <PageTransition key="thank-you">
          <ThankYouScreen
            user={authenticatedUser}
            consultation={activeConsultation}
            lang={lang}
            onLangChange={handleLangChange}
            onViewPrescription={goToPrescription}
            onFinish={() => setActiveStep('home')}
          />
        </PageTransition>
      ) : null}
    </div>
  );
}

export default App;
