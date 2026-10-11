import React, { useMemo, useState } from 'react';
import Header from './Header';
import PrivacyNotice from './PrivacyNotice';
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, Mic, Sparkles, Stethoscope, UserRound } from 'lucide-react';

const QUESTIONS = [
  { key: 'mainConcern', title: 'What is bothering you today?', subtitle: 'Tell me the main problem you want the doctor to know about.', options: ['Fever and body pain', 'Cough / cold', 'Headache', 'Stomach problem'] },
  { key: 'duration', title: 'How long have you had this problem?', subtitle: 'This helps the doctor understand how the symptoms are progressing.', options: ['Since today', '2 days', '3–5 days', 'More than a week'] },
  { key: 'breathingDifficulty', title: 'Are you having difficulty breathing?', subtitle: 'Please answer honestly so the doctor can review the urgency.', options: ['No', 'A little', 'Yes'] },
  { key: 'severity', title: 'How severe do you feel the symptoms are?', subtitle: 'Choose the option that feels closest to your current condition.', options: ['Mild', 'Moderate', 'Severe'] },
  { key: 'allergies', title: 'Do you have any known medicine allergies?', subtitle: 'This information is included in the health card for the doctor.', options: ['No known allergies', 'Yes — I will tell the doctor'] },
  { key: 'medicalHistory', title: 'Any important medical history?', subtitle: 'For example: diabetes, asthma, hypertension, or another condition.', options: ['No known chronic condition', 'Yes — I have a medical condition'] },
];

export default function AIHealthAssistant({ user, lang = 'en', onLangChange, onBack, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [listening, setListening] = useState(false);

  const question = QUESTIONS[step];
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const summary = useMemo(() => {
    const concern = answers.mainConcern || 'General health concern';
    const duration = answers.duration || 'recently';
    return `AI summary: ${user?.fullName || 'Patient'} reports ${concern.toLowerCase()} for ${duration.toLowerCase()}. Breathing difficulty: ${answers.breathingDifficulty || 'not reported'}. Severity: ${answers.severity || 'not reported'}. ${answers.allergies || 'Allergy information not reported'}. ${answers.medicalHistory || 'Medical history not reported'}.`;
  }, [answers, user]);

  const choose = (value) => {
    const next = { ...answers, [question.key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 180);
    } else {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setDone(true);
      }, 900);
    }
  };

  const finish = () => {
    const symptoms = [answers.mainConcern, answers.duration ? `${answers.mainConcern || 'Symptoms'} (${answers.duration})` : null].filter(Boolean);
    if (answers.breathingDifficulty && answers.breathingDifficulty !== 'No') symptoms.push(`Breathing difficulty: ${answers.breathingDifficulty}`);
    const consultation = {
      _id: `AI-DEMO-${Date.now()}`,
      patientId: user,
      symptomsSummary: symptoms,
      aiDiagnosisBrief: summary,
      priority: answers.breathingDifficulty === 'Yes' || answers.severity === 'Severe' ? 'High' : 'Medium',
      status: 'Awaiting_Doctor',
      createdAt: new Date().toISOString(),
      aiIntake: answers,
      ashaWorkerAssigned: { fullName: 'Dr. Amit Verma' },
    };
    onComplete?.(consultation);
  };

  const voiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      const matched = question.options.find((option) => transcript.toLowerCase().includes(option.toLowerCase().split(' ')[0]));
      choose(matched || transcript);
    };
    recognition.start();
  };

  return (
    <div className="screen-container ai-assistant-page">
      <Header currentLang={lang} onLangChange={onLangChange} />
      <main className="main-content ai-main-content">
        <div className="ai-assistant-shell">
          <div className="ai-hero">
            <div className="ai-icon"><Sparkles size={26} /></div>
            <div>
              <div className="ai-label">AI HEALTH ASSISTANT</div>
              <h1>Let's understand your health, {user?.fullName?.split(' ')[0] || 'Patient'}.</h1>
              <p>I’ll ask a few simple questions and prepare a structured health summary for the doctor.</p>
            </div>
            <div className="ai-progress-pill">{step + 1} / {QUESTIONS.length}</div>
          </div>

          {!done ? (
            <div className="ai-question-card">
              <div className="ai-progress-track"><span style={{ width: `${progress}%` }} /></div>
              <div className="ai-question-meta"><Activity size={18} /> AI-guided intake · {progress}% complete</div>
              <h2>{question.title}</h2>
              <p className="ai-subtitle">{question.subtitle}</p>
              <div className="ai-options">
                {question.options.map((option) => (
                  <button key={option} className="ai-option" onClick={() => choose(option)} disabled={processing}>
                    <span>{option}</span><ArrowRight size={18} />
                  </button>
                ))}
              </div>
              <button className={`ai-voice-button ${listening ? 'listening' : ''}`} onClick={voiceInput} disabled={processing}>
                <Mic size={19} /> {listening ? 'Listening…' : 'Answer with voice'}
              </button>
              {processing && <div className="ai-processing"><Sparkles size={18} className="ai-spin" /> AI is preparing your health summary…</div>}
              <div className="screen-actions ai-actions">
                <button className="btn-secondary" onClick={onBack}><ArrowLeft size={18} /> Back</button>
              </div>
            </div>
          ) : (
            <div className="ai-result-card">
              <div className="ai-result-icon"><CheckCircle2 size={42} /></div>
              <div className="ai-label">AI ANALYSIS COMPLETE</div>
              <h2>Your health information is ready</h2>
              <p className="ai-subtitle">The answers have been organized into a doctor-ready health card.</p>
              <div className="ai-summary-grid">
                <div><span>Patient</span><strong><UserRound size={16} /> {user?.fullName || 'Patient'}</strong></div>
                <div><span>Main concern</span><strong>{answers.mainConcern}</strong></div>
                <div><span>Duration</span><strong>{answers.duration}</strong></div>
                <div><span>Severity</span><strong>{answers.severity}</strong></div>
              </div>
              <div className="ai-generated-summary"><Stethoscope size={19} /><div><b>AI-generated clinical summary</b><p>{summary}</p></div></div>
              <button className="btn-primary ai-continue" onClick={finish}><span>Generate My Health Card</span><ArrowRight size={19} /></button>
            </div>
          )}
        </div>
        <PrivacyNotice lang={lang} />
      </main>
    </div>
  );
}
