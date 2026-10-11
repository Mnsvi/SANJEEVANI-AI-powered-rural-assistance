import React, { useState, useRef } from 'react';
import Header from '../components/Header';
import FaceCamera from '../components/FaceCamera';
import ListenButton from '../components/ListenButton';
import PrivacyNotice from '../components/PrivacyNotice';
import AuthenticationStatus from '../components/AuthenticationStatus';
import SignupModal from '../components/SignupModal';
import { verifyFaceImage, registerFaceImage } from '../services/authService';
import { Scan, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { DEMO_TOKEN, DEMO_USER } from '../services/demoData';

export default function FaceAuthentication({ onAuthenticated, demoMode = false }) {
  const cameraRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Registration workflow state
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [flowMode, setFlowMode] = useState('verify'); // 'verify' | 'register-face'
  const [authToken, setAuthToken] = useState(null);

  const handleStartScan = async () => {
    if (isScanning) return; // Prevent double trigger
    setAuthStatus(null);
    setErrorMessage(null);
    setIsScanning(true);

    try {
      if (demoMode && flowMode === 'verify') {
        // Demo-safe authentication: keeps the face-scan UX while avoiding a dependency
        // on MongoDB/Python services during a live presentation.
        await new Promise((resolve) => setTimeout(resolve, 900));
        setAuthStatus('success');
        setAuthUser(DEMO_USER);
        cameraRef.current?.stopCamera?.();
        setTimeout(() => onAuthenticated?.(DEMO_USER, DEMO_TOKEN), 500);
        return;
      }
      if (!cameraRef.current || !cameraRef.current.captureFrame) {
        throw new Error('Camera feed is not ready. Please ensure webcam permissions are granted.');
      }

      // 1. Capture actual webcam image frame as Blob
      const imageBlob = await cameraRef.current.captureFrame();

      if (flowMode === 'register-face') {
        // Face Registration Flow: send imageBlob + authToken to /api/auth/register-face
        if (!authToken) {
          throw new Error('Session token missing. Please sign up again.');
        }

        const result = await registerFaceImage(imageBlob, authToken);

        if (result.success) {
          setAuthStatus('success');
          
          if (cameraRef.current?.stopCamera) {
            cameraRef.current.stopCamera();
          }

          setTimeout(() => {
            if (onAuthenticated) {
              onAuthenticated(authUser, authToken);
            }
          }, 1500);
        } else {
          setAuthStatus('failure');
          setErrorMessage(result.message || 'Failed to register face. Please try again.');
        }
      } else {
        // Face Verification Flow: send imageBlob to /api/auth/verify-face
        const result = await verifyFaceImage(imageBlob);

        if (result.status === 404 || result.message === 'New Registration Required') {
          setAuthStatus('unregistered');
          setErrorMessage("We don't recognize this face yet — let's get you registered.");
        } else if (result.success && result.data?.user) {
          setAuthStatus('success');
          setAuthUser(result.data.user);

          if (cameraRef.current?.stopCamera) {
            cameraRef.current.stopCamera();
          }

          setTimeout(() => {
            if (onAuthenticated) {
              onAuthenticated(result.data.user, result.data.token);
            }
          }, 1500);
        } else {
          setAuthStatus('failure');
          setErrorMessage(
            result.message || 'Face not recognized. Please make sure your face is clearly visible and try again.'
          );
        }
      }
    } catch (err) {
      console.error('Face authentication error:', err);
      setAuthStatus('failure');
      setErrorMessage(
        err.message || 'Unable to connect to face verification service. Please try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetry = () => {
    setAuthStatus(null);
    setErrorMessage(null);
    setIsScanning(false);
    if (cameraRef.current?.startCamera) {
      cameraRef.current.startCamera();
    }
  };

  const handleOpenSignup = () => {
    setAuthStatus(null);
    setErrorMessage(null);
    setIsSignupOpen(true);
  };

  const handleSignupSuccess = (token, user) => {
    setIsSignupOpen(false);
    setAuthToken(token);
    setAuthUser(user);
    setFlowMode('register-face');
    setAuthStatus(null);
    setErrorMessage(null);
  };

  return (
    <div className="face-auth-page">
      {/* Sanjeevani Brand Header */}
      <Header />

      {/* Main Authentication Card */}
      <main className="auth-main-card">
        <div className="auth-grid-layout">
          {/* Left Column: Instructions and Primary Actions */}
          <div className="auth-left-column">
            <div className="welcome-badge">
              {flowMode === 'register-face' ? `Welcome, ${authUser?.fullName || 'Patient'}!` : 'Welcome back!'}
            </div>

            <h2 className="auth-main-heading">
              {flowMode === 'register-face' ? (
                <>
                  Register your face <br />
                  to complete setup
                </>
              ) : (
                <>
                  Look at the camera <br />
                  to log in
                </>
              )}
            </h2>

            {/* Healthcare pulse / ECG line accent (#00695c) */}
            <div className="pulse-divider">
              <svg width="120" height="16" viewBox="0 0 120 16" fill="none">
                <path
                  d="M0 8H40L45 2L52 14L60 0L66 12L70 8H120"
                  stroke="#00695c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="auth-description">
              {flowMode === 'register-face'
                ? 'Position your face in the camera frame and click below to capture and save your biometric signature.'
                : 'We use face recognition to identify you and keep your health information secure.'}
            </p>

            {/* Primary Action Button */}
            <div className="action-button-wrapper">
              <button
                className={`btn-primary-scan ${isScanning ? 'scanning' : ''}`}
                onClick={handleStartScan}
                disabled={isScanning || (!cameraReady && !demoMode) || authStatus === 'success'}
                aria-label={flowMode === 'register-face' ? 'Register Face Scan' : 'Start Face Scan'}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>{flowMode === 'register-face' ? 'Registering Face...' : 'Verifying Identity...'}</span>
                  </>
                ) : (
                  <>
                    <div className="btn-icon-badge">
                      <Scan size={22} />
                    </div>
                    <span className="btn-text">
                      {flowMode === 'register-face' ? 'Register Face Scan' : 'Start Face Scan'}
                    </span>
                    <ArrowRight className="btn-arrow" size={20} />
                  </>
                )}
              </button>
            </div>

            {/* Status Banners (Success / Failure / Unregistered / Retry) */}
            <AuthenticationStatus
              status={authStatus}
              user={authUser}
              error={errorMessage}
              onRetry={handleRetry}
              onRegister={handleOpenSignup}
            />

            {flowMode === 'verify' && authStatus !== 'unregistered' && (
              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-status-register"
                  onClick={handleOpenSignup}
                  style={{ background: 'transparent', color: '#00695c', border: '1.5px solid #00695c', boxShadow: 'none' }}
                >
                  <UserPlus size={16} />
                  <span>New User? Create Account</span>
                </button>
              </div>
            )}

            {/* Bottom Utility Features */}
            <div className="left-footer-row">
              <ListenButton
                textToSpeak={
                  flowMode === 'register-face'
                    ? 'Please look straight into the camera to register your face.'
                    : 'Please look straight into the camera and make sure your face is clearly visible.'
                }
                label="Listen"
                subtitle="Tap to hear instructions"
              />

              <PrivacyNotice />
            </div>
          </div>

          {/* Right Column: Live Camera & Scanner Interface */}
          <div className="auth-right-column">
            <FaceCamera
              ref={cameraRef}
              isScanning={isScanning}
              authStatus={authStatus}
              onCameraReady={setCameraReady}
              cameraError={cameraError}
              setCameraError={setCameraError}
            />
          </div>
        </div>
      </main>

      {/* Account Signup Dialog */}
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSignupSuccess={handleSignupSuccess}
      />
    </div>
  );
}
