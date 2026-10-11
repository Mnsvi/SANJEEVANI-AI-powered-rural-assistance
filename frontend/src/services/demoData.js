// Stable demo data used when VITE_DEMO_MODE is enabled (default for hackathon demos).
// The real API/AI services remain available when VITE_DEMO_MODE=false.

export const DEMO_USER = {
  _id: '68d9f1c4a9e20123456789ab',
  fullName: 'Manasvi',
  age: 21,
  gender: 'Not specified',
  mobile: '9876543210',
  aadhar: '987654321987',
  address: 'Limda',
  villageCode: 'vil-111',
  lastConsultation: '2026-09-20T10:30:00.000Z',
};

export const DEMO_CONSULTATION = {
  _id: 'DEMO-CONSULT-250524',
  patientId: DEMO_USER,
  symptomsSummary: ['Fever (since 2 days)', 'Body pain', 'Headache', 'Feeling weak / tired', 'Loss of appetite'],
  aiDiagnosisBrief: 'AI summary: Manasvi reports fever for 2 days with body pain, headache, tiredness and reduced appetite. No breathing difficulty reported.',
  aiIntake: {
    duration: '2 days',
    breathingDifficulty: 'No',
    allergies: 'No known allergies',
    medicalHistory: 'No known chronic condition reported',
    severity: 'Moderate'
  },
  priority: 'Medium',
  status: 'Awaiting_Doctor',
  createdAt: '2026-09-26T10:32:00.000Z',
  ashaWorkerAssigned: {
    fullName: 'Dr. Amit Verma',
  },
  medicines: [
    { name: 'Paracetamol', strength: '650 mg', dose: '1 tablet', duration: '3 days', instructions: 'After food, if fever or body pain' },
    { name: 'Ibuprofen', strength: '400 mg', dose: '1 tablet', duration: '3 days', instructions: 'After food, if pain or headache' },
    { name: 'Cetirizine', strength: '10 mg', dose: '1 tablet', duration: '5 days', instructions: 'At night, after food' },
    { name: 'ORS (Oral Rehydration Salts)', strength: '-', dose: '1 glass', duration: '5 days', instructions: '2–3 times a day' },
    { name: 'Vitamin C', strength: '500 mg', dose: '1 tablet', duration: '5 days', instructions: 'After food' },
  ],
  followUpDate: '2026-10-01T10:30:00.000Z',
};

export const DEMO_QUEUE = {
  queuePosition: 3,
  totalInQueue: 6,
  estimatedWaitMinutes: 8,
};

export const DEMO_TOKEN = 'demo-sanjeevani-session';
