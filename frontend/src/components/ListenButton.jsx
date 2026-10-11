import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function ListenButton({ textToSpeak, label = 'Listen', subtitle = 'Tap to hear audio', lang = 'en' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const toggleSpeech = () => {
    if (!supported) return;

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    synth.cancel(); // Stop any existing speech

    const defaultText = textToSpeak || 'Welcome to Sanjeevani healthcare. Please follow the instructions on your screen.';
    const utterance = new SpeechSynthesisUtterance(defaultText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synth.speak(utterance);
  };

  if (!supported) return null;

  return (
    <div className="listen-button-container">
      <button
        className={`listen-btn ${isSpeaking ? 'speaking' : ''}`}
        onClick={toggleSpeech}
        aria-label={label}
      >
        <div className="sound-wave-icon">
          {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
          {isSpeaking && <span className="audio-pulse-ring" />}
        </div>
        <span className="listen-label">{label}</span>
      </button>
      {subtitle && <span className="listen-subtitle">{subtitle}</span>}
    </div>
  );
}
