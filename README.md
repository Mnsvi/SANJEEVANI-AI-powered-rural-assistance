# Sanjeevani — AI-Powered Rural Healthcare

Sanjeevani is a full-stack rural tele-health kiosk prototype with React, Express/MongoDB, and a Python FastAPI face-embedding service.

## 2-minute demo setup

The frontend defaults to **demo mode** so the UI flow remains stable if MongoDB or the Python face service is not running. Demo mode still uses the real webcam UI and presents the complete product journey:

**Face Scan → Patient Portal → Health Card → Live Queue → Doctor Video Call → Digital Prescription → Thank You**

From `frontend/`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Allow camera access if prompted. Click **Start Face Scan** and the demo patient will be verified after a short simulated biometric check.

### Demo mode

`frontend/.env.example` contains:

```env
VITE_DEMO_MODE=true
```

Demo mode is the default. To use the real backend APIs, create `frontend/.env` with:

```env
VITE_DEMO_MODE=false
VITE_API_URL=
```

The Vite proxy points `/api` to `http://localhost:5000`.

## Full-stack mode

1. Start MongoDB and configure `backend/.env` using `backend/.env.example`.
2. Start the Python face service on port 8001.
3. Start the Express server from the project root:

```bash
npm install
npm run dev
```

4. Start the frontend separately:

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_DEMO_MODE=false` for the frontend when using the real services.

## Important

The demo flow is a presentation prototype. The face-recognition service attempts DeepFace/Facenet when installed and otherwise uses its documented lightweight image-vector fallback. Do not present the fallback as a clinical-grade biometric model.
