import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Camera, RefreshCw, AlertTriangle, UserCheck } from 'lucide-react';

const FaceCamera = forwardRef(function FaceCamera(
  { isScanning, authStatus, onCameraReady, cameraError, setCameraError },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    if (onCameraReady) onCameraReady(false);
  }, [onCameraReady]);

  const startCamera = useCallback(async () => {
    if (setCameraError) setCameraError(null);

    try {
      stopCamera();

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStreamActive(true);
      setPermissionState('granted');
      if (onCameraReady) onCameraReady(true);
    } catch (err) {
      console.error('Camera error:', err);
      setStreamActive(false);
      setPermissionState('denied');
      if (onCameraReady) onCameraReady(false);

      let msg = 'Unable to access camera. Please allow camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera was detected. Please connect a webcam and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Unable to access the camera. Please check that another application is not using your camera.';
      }

      if (setCameraError) setCameraError(msg);
    }
  }, [stopCamera, onCameraReady, setCameraError]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const captureFrame = useCallback(() => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !streamRef.current) {
        reject(new Error('Camera feed is not active'));
        return;
      }

      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to capture camera frame'));
          }
        },
        'image/jpeg',
        0.95
      );
    });
  }, []);

  // Expose imperative methods to parent via ref
  useImperativeHandle(ref, () => ({
    captureFrame,
    startCamera,
    stopCamera,
    isStreamActive: () => streamActive,
  }));

  return (
    <div className="camera-card-container">
      {/* Top hardware-style lens indicator */}
      <div className="camera-top-lens">
        <div className={`lens-dot ${streamActive ? 'active' : ''}`} />
      </div>

      <div className="camera-viewport-wrapper">
        {/* Hidden Canvas for frame extraction */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Video feed */}
        <video
          ref={videoRef}
          className={`camera-video-feed ${streamActive ? 'visible' : 'hidden'}`}
          autoPlay
          muted
          playsInline
        />

        {/* Framing & Scanning Overlays (Only visible when stream is active) */}
        {streamActive && (
          <div className="camera-overlay">
            {authStatus === 'success' && <div className="biometric-success-ring" />}
            {/* Outer pulse ring */}
            <div className={`scan-ring ${isScanning ? 'pulsing' : ''}`} />

            {/* Face guide framing brackets */}
            <div className="face-frame-brackets">
              <span className="bracket top-left" />
              <span className="bracket top-right" />
              <span className="bracket bottom-left" />
              <span className="bracket bottom-right" />
            </div>

            {/* Scanning beam line */}
            {isScanning && <div className="scanning-beam" />}
          </div>
        )}

        {/* Camera Permission / Error Fallback State */}
        {!streamActive && (
          <div className="camera-fallback-state">
            {permissionState === 'denied' || cameraError ? (
              <div className="fallback-content error">
                <AlertTriangle className="fallback-icon text-amber" size={44} />
                <h3>Camera Access Required</h3>
                <p>
                  {cameraError ||
                    'Please allow browser camera permissions to proceed with face authentication.'}
                </p>
                <button className="btn-retry-camera" onClick={startCamera}>
                  <RefreshCw size={16} />
                  <span>Try Again / Grant Access</span>
                </button>
              </div>
            ) : (
              <div className="fallback-content">
                <Camera className="fallback-icon text-teal" size={44} />
                <h3>Initializing Camera...</h3>
                <p>Please wait while we connect to your webcam.</p>
                <button className="btn-retry-camera" onClick={startCamera}>
                  <RefreshCw size={16} />
                  <span>Start Camera</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-camera instruction card matching design */}
      <div className="camera-instruction-card">
        <div className="instruction-user-icon">
          <UserCheck size={20} />
        </div>
        <div className="instruction-text">
          <p className="primary-text">Please look straight into the camera</p>
          <p className="secondary-text">Make sure your face is clearly visible</p>
        </div>
      </div>
    </div>
  );
});

export default FaceCamera;
