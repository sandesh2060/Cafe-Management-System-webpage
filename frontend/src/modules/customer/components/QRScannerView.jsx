// File: frontend/src/modules/customer/components/QRScannerView.jsx
// 🎯 MINIMAL & CLEAN - Only close button, flashlight, and perfect success animation
// ✅ Fixed square scanner frame
// 🎨 GSAP-powered smooth animations

import { useState, useEffect, useRef } from 'react';
import { X, Zap } from 'lucide-react';
import gsap from 'gsap';

const QRScannerView = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const qrScannerRef = useRef(null);
  const successRef = useRef(null);
  const checkmarkCircleRef = useRef(null);
  const checkmarkCheckRef = useRef(null);
  const successTextRef = useRef(null);
  const ringRefs = useRef([]);

  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    initializeScanner();
    return () => {
      stopScanner();
    };
  }, [facingMode]);

  const initializeScanner = async () => {
    try {
      stopScanner();
      const QrScanner = (await import('qr-scanner')).default;
      await new Promise(resolve => setTimeout(resolve, 80));

      if (!videoRef.current) return;

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => handleScanSuccess(result.data),
        {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          maxScansPerSecond: 5,
          preferredCamera: facingMode,
        }
      );

      await qrScannerRef.current.start();
      console.log('✅ QR Scanner started');
    } catch (err) {
      console.error('❌ QR Scanner error:', err);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      try { qrScannerRef.current.stop(); } catch {}
      try { qrScannerRef.current.destroy(); } catch {}
      qrScannerRef.current = null;
    }
  };

  const handleScanSuccess = async (data) => {
    if (scanSuccess) return;
    setScanSuccess(true);

    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 200, 100, 50]);
    }

    console.log('📱 QR Scanned:', data);

    stopScanner();

    // ✅ GSAP SUCCESS ANIMATION
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    // Fade in overlay
    tl.to(successRef.current, {
      opacity: 1,
      duration: 0.3
    });

    // Animate rings expanding
    tl.to(ringRefs.current, {
      scale: 2.5,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: 'power2.out'
    }, 0.2);

    // Draw circle
    tl.fromTo(checkmarkCircleRef.current,
      { strokeDashoffset: 340 },
      { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' },
      0.3
    );

    // Draw checkmark
    tl.fromTo(checkmarkCheckRef.current,
      { strokeDashoffset: 90 },
      { strokeDashoffset: 0, duration: 0.4, ease: 'power2.inOut' },
      0.7
    );

    // Pop in text
    tl.fromTo(successTextRef.current,
      { y: 30, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
      0.9
    );

    // Wait then callback
    await new Promise(resolve => setTimeout(resolve, 1800));
    if (onScan) onScan(data);
  };

  const toggleTorch = async () => {
    try {
      const track = videoRef.current?.srcObject?.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.();
      if (capabilities?.torch) {
        await track.applyConstraints({ advanced: [{ torch: !torchEnabled }] });
        setTorchEnabled(!torchEnabled);
      }
    } catch (err) {
      console.error('Torch error:', err);
    }
  };

  return (
    <div className="qr-scanner-container">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Video feed */}
      <video
        ref={videoRef}
        className="qr-video"
        playsInline
        muted
      />

      {/* Dark overlay gradient */}
      <div className="qr-overlay" />

      {/* Top controls - only when NOT success */}
      {!scanSuccess && (
        <div className="qr-controls">
          <button onClick={onClose} className="qr-btn" aria-label="Close">
            <X className="qr-icon" />
          </button>

          <button 
            onClick={toggleTorch} 
            className={`qr-btn ${torchEnabled ? 'qr-btn-active' : ''}`}
            aria-label="Toggle flashlight"
          >
            <Zap className={`qr-icon ${torchEnabled ? 'qr-icon-fill' : ''}`} />
          </button>
        </div>
      )}

      {/* Scanner frame - only when NOT success */}
      {!scanSuccess && (
        <div className="qr-frame-container">
          <div className="qr-frame">
            {/* 4 corner brackets */}
            <div className="qr-corner qr-corner-tl" />
            <div className="qr-corner qr-corner-tr" />
            <div className="qr-corner qr-corner-br" />
            <div className="qr-corner qr-corner-bl" />

            {/* Scanning line */}
            <div className="qr-scan-line" />
          </div>
        </div>
      )}

      {/* ✅ SUCCESS ANIMATION */}
      <div ref={successRef} className="qr-success">
        {/* Expanding rings */}
        <div ref={el => ringRefs.current[0] = el} className="qr-ring" />
        <div ref={el => ringRefs.current[1] = el} className="qr-ring" />
        <div ref={el => ringRefs.current[2] = el} className="qr-ring" />

        {/* Animated checkmark SVG */}
        <svg className="qr-checkmark" viewBox="0 0 120 120">
          <circle
            ref={checkmarkCircleRef}
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="340"
            strokeDashoffset="340"
          />
          <path
            ref={checkmarkCheckRef}
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="90"
            strokeDashoffset="90"
            d="M 30 60 L 50 80 L 90 40"
          />
        </svg>

        {/* Success text */}
        <div ref={successTextRef} className="qr-success-text">
          <h3>Success!</h3>
          <p>QR Code Verified</p>
        </div>
      </div>

      <style>{`
        /* ============================================ */
        /* CONTAINER */
        /* ============================================ */
        .qr-scanner-container {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #000;
          overflow: hidden;
        }

        /* ============================================ */
        /* VIDEO */
        /* ============================================ */
        .qr-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ============================================ */
        /* OVERLAY */
        /* ============================================ */
        .qr-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 20%,
            rgba(0, 0, 0, 0.3) 50%,
            rgba(0, 0, 0, 0.7) 100%
          );
          pointer-events: none;
        }

        /* ============================================ */
        /* CONTROLS */
        /* ============================================ */
        .qr-controls {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: max(1rem, env(safe-area-inset-top)) 1rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .qr-btn {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(255, 255, 255, 0.9);
        }

        .qr-btn:hover {
          background: rgba(0, 0, 0, 0.7);
          border-color: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .qr-btn:active {
          transform: scale(0.95);
        }

        .qr-btn-active {
          background: rgba(251, 191, 36, 0.9) !important;
          border-color: rgba(251, 191, 36, 0.5) !important;
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
        }

        .qr-icon {
          width: 1.5rem;
          height: 1.5rem;
          transition: all 0.3s ease;
        }

        .qr-icon-fill {
          fill: white;
          transform: scale(1.1);
        }

        /* ============================================ */
        /* SCANNER FRAME - FIXED SQUARE */
        /* ============================================ */
        .qr-frame-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          pointer-events: none;
        }

        .qr-frame {
          position: relative;
          width: 100%;
          max-width: 340px;
          aspect-ratio: 1 / 1; /* Perfect square */
        }

        /* ============================================ */
        /* CORNER BRACKETS */
        /* ============================================ */
        .qr-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 4px solid #fff;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
        }

        .qr-corner::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: inherit;
          opacity: 0.3;
          animation: cornerPulse 2s ease-in-out infinite;
        }

        @keyframes cornerPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.6;
          }
        }

        .qr-corner-tl {
          top: -4px;
          left: -4px;
          border-right: none;
          border-bottom: none;
          border-top-left-radius: 24px;
        }

        .qr-corner-tr {
          top: -4px;
          right: -4px;
          border-left: none;
          border-bottom: none;
          border-top-right-radius: 24px;
        }

        .qr-corner-br {
          bottom: -4px;
          right: -4px;
          border-left: none;
          border-top: none;
          border-bottom-right-radius: 24px;
        }

        .qr-corner-bl {
          bottom: -4px;
          left: -4px;
          border-right: none;
          border-top: none;
          border-bottom-left-radius: 24px;
        }

        /* ============================================ */
        /* SCANNING LINE */
        /* ============================================ */
        .qr-scan-line {
          position: absolute;
          left: 8%;
          right: 8%;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(16, 185, 129, 0.3) 20%,
            rgba(16, 185, 129, 1) 50%,
            rgba(16, 185, 129, 0.3) 80%,
            transparent 100%
          );
          border-radius: 2px;
          filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.8));
          animation: scanLineMove 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes scanLineMove {
          0%, 100% {
            top: 8%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 92%;
            opacity: 0;
          }
        }

        /* ============================================ */
        /* SUCCESS OVERLAY */
        /* ============================================ */
        .qr-success {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          z-index: 100;
        }

        /* ============================================ */
        /* EXPANDING RINGS */
        /* ============================================ */
        .qr-ring {
          position: absolute;
          width: 180px;
          height: 180px;
          border: 3px solid rgba(16, 185, 129, 0.6);
          border-radius: 50%;
          transform: scale(0.5);
          opacity: 0;
        }

        /* ============================================ */
        /* CHECKMARK SVG */
        /* ============================================ */
        .qr-checkmark {
          width: 180px;
          height: 180px;
          margin-bottom: 2rem;
          filter: drop-shadow(0 0 40px rgba(16, 185, 129, 0.8));
          position: relative;
          z-index: 10;
        }

        /* ============================================ */
        /* SUCCESS TEXT */
        /* ============================================ */
        .qr-success-text {
          text-align: center;
          opacity: 0;
          transform: translateY(30px);
        }

        .qr-success-text h3 {
          color: #fff;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          letter-spacing: 0.02em;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .qr-success-text p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.125rem;
          font-weight: 500;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        /* ============================================ */
        /* RESPONSIVE */
        /* ============================================ */
        @media (max-width: 640px) {
          .qr-frame {
            max-width: 280px;
          }

          .qr-corner {
            width: 50px;
            height: 50px;
            border-width: 3px;
          }

          .qr-checkmark {
            width: 140px;
            height: 140px;
          }

          .qr-success-text h3 {
            font-size: 2rem;
          }

          .qr-success-text p {
            font-size: 1rem;
          }
        }

        /* ============================================ */
        /* HARDWARE ACCELERATION */
        /* ============================================ */
        .qr-btn,
        .qr-corner,
        .qr-scan-line,
        .qr-ring,
        .qr-checkmark,
        .qr-success-text {
          will-change: transform;
          transform: translateZ(0);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default QRScannerView;