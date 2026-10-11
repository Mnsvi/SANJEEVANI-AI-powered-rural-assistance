import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import PrivacyNotice from './PrivacyNotice';
import { translations } from '../utils/translations';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Maximize, Signal, FileText, X, User, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function VideoConsultationScreen({
  user,
  consultation,
  lang = 'en',
  onLangChange,
  onEndCall
}) {
  const t = translations[lang] || translations.en;
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Live Call Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebCam Stream Initialization for Patient PiP
  useEffect(() => {
    let active = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        if (active) {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Webcam access error:", err);
        setCameraError("Webcam preview unavailable");
      }
    }
    startCamera();

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Mic & Camera Toggle Actions
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micEnabled));
    }
    setMicEnabled(!micEnabled);
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !cameraEnabled));
    }
    setCameraEnabled(!cameraEnabled);
  };

  // Format Duration seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const doctorName = consultation?.ashaWorkerAssigned?.fullName || "Dr. Sanjeevani Medical Officer";
  const speechText = `You are connected with ${doctorName}. Call duration is ${formatTime(callDuration)}. Connection is good.`;

  return (
    <div className="screen-container video-page">
      <Header
        currentLang={lang}
        onLangChange={onLangChange}
        textToSpeak={speechText}
        speechLabel={t.listen}
      />

      <main className="main-content">
        {/* Top Confirmation Strip */}
        <div className="video-top-strip">
          <div className="strip-info">
            <CheckCircle2 size={18} className="strip-check-icon" />
            <span>{t.cardShared}</span>
          </div>
          <button className="view-card-link" onClick={() => setShowHealthCardModal(true)}>
            <FileText size={16} />
            <span>{t.viewHealthCard}</span>
          </button>
        </div>

        {/* Video Consultation Main Canvas */}
        <div className="video-viewport">
          {/* Main Large Doctor Video Feed */}
          <div className="doctor-video-container">
            <div className="doctor-avatar-backdrop">
              <div className="pulse-avatar-circle">
                <User size={64} className="doctor-avatar-icon" />
              </div>
              <span className="doctor-live-badge">● LIVE DOCTOR CONSULTATION</span>
            </div>

            {/* Doctor Info Overlay (Bottom Left) */}
            <div className="doctor-info-overlay">
              <div className="doctor-avatar-sm">
                <User size={20} />
              </div>
              <div className="doctor-details">
                <p className="doctor-name">{doctorName}</p>
                <p className="doctor-subtitle">Senior Medical Specialist (MBBS, MD) • Tele-Health Hub</p>
              </div>
            </div>

            {/* Connection Status Row & Timer Overlay (Top Left & Right) */}
            <div className="call-status-bar">
              <div className="connection-pill">
                <Signal size={16} className="signal-icon good" />
                <span>{t.connectionGood}</span>
              </div>
              <div className="timer-pill">
                <span>{formatTime(callDuration)}</span>
              </div>
              <button className="fullscreen-btn" aria-label="Fullscreen">
                <Maximize size={18} />
              </button>
            </div>

            {/* Patient Picture-in-Picture (PiP) Video Tile (Bottom Right) */}
            <div className="patient-pip-tile">
              {cameraEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="pip-video-element"
                />
              ) : (
                <div className="pip-placeholder">
                  <VideoOff size={24} />
                  <span>Camera Off</span>
                </div>
              )}
              <span className="pip-label">You ({user?.fullName || 'Patient'})</span>
            </div>
          </div>

          {/* Control Bar */}
          <div className="video-control-bar">
            <button
              className={`control-btn ${!micEnabled ? 'active-off' : ''}`}
              onClick={toggleMic}
              title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              className={`control-btn ${!cameraEnabled ? 'active-off' : ''}`}
              onClick={toggleCamera}
              title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
            >
              {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button className="control-btn" title="Chat">
              <MessageSquare size={20} />
            </button>

            <button className="control-btn end-call-btn" onClick={onEndCall} title="End Call">
              <PhoneOff size={22} />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Health Card Preview Modal Overlay */}
        {showHealthCardModal && (
          <div className="modal-backdrop" onClick={() => setShowHealthCardModal(false)}>
            <div className="modal-content animate-pop" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Patient Health Card Summary</h3>
                <button className="close-btn" onClick={() => setShowHealthCardModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Patient Name:</strong> {user?.fullName || 'N/A'}</p>
                <p><strong>Village Code:</strong> {user?.villageCode || 'N/A'}</p>
                <p><strong>Symptoms:</strong> {(consultation?.symptomsSummary || ["Fever", "Headache"]).join(', ')}</p>
                <p><strong>Chief Complaint:</strong> "{consultation?.aiDiagnosisBrief || "Acute fever and malaise"}"</p>
                <p><strong>Priority:</strong> {consultation?.priority || "Medium"}</p>
              </div>
            </div>
          </div>
        )}

        <PrivacyNotice lang={lang} />
      </main>
    </div>
  );
}
