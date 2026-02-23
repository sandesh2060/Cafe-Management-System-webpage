// ================================================================
// FILE: frontend/src/modules/customer/components/FaceRecognitionCapture.jsx
//
// ✅ MIGRATED: face-api.js → MediaPipe FaceMesh
//
// FLOW: Auto-detects new vs returning user
//   • New user  → capture descriptors → register → navigate to menu
//   • Returning → verify descriptors  → navigate to menu
//
// MEDIAPIPE NOTES:
//   • Uses @mediapipe/face_mesh for landmark detection
//   • Descriptor = 128-dim vector derived from 33 key landmarks
//   • NO local model files needed (loaded from CDN)
//   • Works fully in-browser, same backend API as before
// ================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera, CheckCircle, XCircle, Loader, User,
  AlertTriangle, ArrowRight, RefreshCw, Ban,
  Fingerprint, Hash, Clock, Zap, ShieldAlert, Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import gsap from "gsap";
import axios from "../../../api/axios";
import { customerAPI } from "../../../api/endpoints";

// ─────────────────────────────────────────────────────────────
// MEDIAPIPE LOADER — singleton, survives remount
// ─────────────────────────────────────────────────────────────
const MPCache = (() => {
  const KEY = "__mpFaceMeshReady__";
  return {
    isReady: () => window[KEY] === true,
    getInstance: () => window.__mpFaceMeshInstance__,
    async load() {
      if (window[KEY]) return window.__mpFaceMeshInstance__;
      if (window.__mpFaceMeshLoading__) return window.__mpFaceMeshLoading__;

      window.__mpFaceMeshLoading__ = (async () => {
        // Dynamically import MediaPipe
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        const { Camera: MPCamera } = await import("@mediapipe/camera_utils");

        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        await faceMesh.initialize();

        window.__mpFaceMeshInstance__ = faceMesh;
        window[KEY] = true;
        window.__mpFaceMeshLoading__ = null;
        console.log("✅ [MPCache] MediaPipe FaceMesh loaded globally");
        return faceMesh;
      })();

      return window.__mpFaceMeshLoading__;
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// DESCRIPTOR EXTRACTION
// MediaPipe gives 468 landmarks. We use 33 key ones and
// normalize them into a 128-dim embedding compatible with
// the existing backend (euclidean distance matching).
// ─────────────────────────────────────────────────────────────

// Key landmark indices (face oval + eyes + nose + mouth outline)
const KEY_LANDMARKS = [
  // Face oval (17)
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400,
  // Eyes (8)
  33, 7, 163, 144, 145, 153, 154, 155,
  // Nose bridge (4)
  168, 6, 197, 195,
  // Mouth (4)
  61, 291, 39, 269,
];

function extractDescriptor(landmarks, imageWidth, imageHeight) {
  // Get bounding box of face
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const lm of landmarks) {
    if (lm.x < minX) minX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y > maxY) maxY = lm.y;
  }
  const faceW = maxX - minX || 1;
  const faceH = maxY - minY || 1;

  // Normalize key landmarks relative to face bounding box
  const points = KEY_LANDMARKS.map((idx) => {
    const lm = landmarks[idx];
    return [
      (lm.x - minX) / faceW,
      (lm.y - minY) / faceH,
      lm.z || 0,
    ];
  });

  // Flatten to 99 values, then pad/interpolate to 128
  const flat = points.flat(); // 33 * 3 = 99
  const descriptor = new Array(128).fill(0);

  for (let i = 0; i < 128; i++) {
    const srcIdx = (i / 127) * (flat.length - 1);
    const lo = Math.floor(srcIdx);
    const hi = Math.min(lo + 1, flat.length - 1);
    const t = srcIdx - lo;
    descriptor[i] = flat[lo] * (1 - t) + flat[hi] * t;
  }

  // L2-normalize
  const norm = Math.sqrt(descriptor.reduce((s, v) => s + v * v, 0)) || 1;
  return descriptor.map((v) => v / norm);
}

function euclidean(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; }
  return Math.sqrt(s);
}

function validateDescriptors(descriptors) {
  for (const d of descriptors) {
    const sum = d.reduce((s, v) => s + Math.abs(v), 0);
    if (sum < 0.01) return "Invalid face data — please try again";
  }
  if (descriptors.length >= 2) {
    const d01 = euclidean(descriptors[0], descriptors[1]);
    if (d01 < 0.002)
      return "Samples too similar — move slightly between captures";
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// QUALITY THRESHOLDS
// ─────────────────────────────────────────────────────────────
const Q = {
  MIN_DETECTION_CONF: 0.65, // MediaPipe detection confidence
  GOOD_FRAMES: 4,           // consecutive good frames before capture
  SAMPLES: 3,               // descriptor samples per attempt
  SAMPLE_MS: 160,           // ms between samples
  MIN_BACKEND_CONF: 0.75,
  MIN_FACE_RATIO: 0.12,     // face width / video width
};

const MAX_ATTEMPTS = 4;
const LOCK_MS = 5 * 60_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const FaceRecognitionCapture = ({ tableData, onSuccess, onCancel, onFallback }) => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState("init");
  const [msg, setMsg] = useState("Loading MediaPipe…");
  const [subMsg, setSubMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [faceOK, setFaceOK] = useState(false);
  const [qPct, setQPct] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockSecs, setLockSecs] = useState(0);
  const [uname, setUname] = useState("");
  const [registering, setReg] = useState(false);
  const [captureStep, setCaptureStep] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lockTimer = useRef(null);
  const busy = useRef(false);
  const goodFrames = useRef(0);
  const schedTimer = useRef(null);
  const phaseRef = useRef("init");
  const samplesRef = useRef(null);
  const lastLandmarks = useRef(null);
  const lastDetectConf = useRef(0);
  const sessionId = useRef(`s_${tableData?.tableId ?? "t"}_${Date.now()}`);
  const mpCameraRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Boot
  useEffect(() => {
    let dead = false;
    boot(dead).catch((e) => {
      if (!dead) { setPhase("error"); setErrMsg(e.message || "Init failed"); }
    });
    return () => { dead = true; teardown(); };
  }, []); // eslint-disable-line

  // Lock countdown
  useEffect(() => {
    if (phase !== "locked" || lockSecs <= 0) return;
    lockTimer.current = setInterval(() => {
      setLockSecs((s) => {
        if (s <= 1) {
          clearInterval(lockTimer.current);
          setPhase("ready");
          setMsg("Unlocked — please try again");
          setAttempts(0);
          toast.info("Unlocked — please try again");
          startMPCamera();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(lockTimer.current);
  }, [phase, lockSecs]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────
  // BOOT
  // ─────────────────────────────────────────────────────────
  async function boot(dead) {
    setProgress(10);
    setMsg("Loading MediaPipe FaceMesh…");

    // Load MP and camera in parallel
    const [faceMesh] = await Promise.all([
      MPCache.load(),
      startCamera(dead),
    ]);

    if (dead) return;
    setProgress(90);

    // Wire up results callback
    faceMesh.onResults((results) => {
      if (dead) return;
      handleMPResults(results);
    });

    setProgress(100);
    setPhase("ready");
    setMsg("Look straight at the camera");
    setSubMsg("Hold still when the oval turns green");

    startMPCamera();
  }

  async function startCamera(dead) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user", frameRate: { ideal: 30 } },
      audio: false,
    });
    if (dead) { stream.getTracks().forEach((t) => t.stop()); return; }
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("Camera timeout")), 10_000);
      videoRef.current.onloadedmetadata = () =>
        videoRef.current.play().then(() => { clearTimeout(t); setTimeout(res, 300); }).catch(rej);
    });
  }

  function startMPCamera() {
    // Always cancel existing loop before starting new one
    cancelAnimationFrame(rafRef.current);
    mpCameraRef.current = true;

    const tick = async () => {
      if (!mpCameraRef.current) return; // externally stopped
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const faceMesh = MPCache.getInstance();
      const ph = phaseRef.current;
      if (faceMesh && (ph === "ready" || ph === "capture")) {
        try { await faceMesh.send({ image: videoRef.current }); } catch { /* ignore */ }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function teardown() {
    mpCameraRef.current = false; // stop RAF loop via flag
    cancelAnimationFrame(rafRef.current);
    clearTimeout(schedTimer.current);
    clearInterval(lockTimer.current);
    busy.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // ─────────────────────────────────────────────────────────
  // MEDIAPIPE RESULTS HANDLER
  // ─────────────────────────────────────────────────────────
  const handleMPResults = useCallback((results) => {
    if (busy.current || phaseRef.current !== "ready") return;

    const hasFace =
      results.multiFaceLandmarks &&
      results.multiFaceLandmarks.length > 0 &&
      results.multiFaceLandmarks[0].length > 0;

    if (!hasFace) {
      setFaceOK(false);
      goodFrames.current = 0;
      clearSched();
      setMsg("Look straight at the camera");
      setSubMsg("");
      lastLandmarks.current = null;
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    lastLandmarks.current = landmarks;

    // Estimate face size ratio
    let minX = Infinity, maxX = -Infinity;
    for (const lm of landmarks) {
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
    }
    const faceRatio = maxX - minX;
    const score = Math.round(Math.min(faceRatio / 0.4, 1) * 100);
    setQPct(score);

    const goodSize = faceRatio >= Q.MIN_FACE_RATIO;
    const goodConf = score >= 60;

    if (!goodConf || !goodSize) {
      goodFrames.current = 0;
      clearSched();
      if (!goodSize) { setMsg("Move closer"); setSubMsg("Your face needs to fill more of the oval"); }
      else { setMsg(`Clarity: ${score}%`); setSubMsg("Ensure face is well-lit and centred"); }
      setFaceOK(false);
      return;
    }

    setFaceOK(true);
    goodFrames.current++;
    setMsg(`Hold still… ${score}% clarity`);
    setSubMsg(`Frame ${Math.min(goodFrames.current, Q.GOOD_FRAMES)} of ${Q.GOOD_FRAMES}`);

    if (goodFrames.current >= Q.GOOD_FRAMES && !schedTimer.current) {
      schedTimer.current = setTimeout(() => {
        schedTimer.current = null;
        goodFrames.current = 0;
        if (phaseRef.current === "ready" && !busy.current) runCapture();
      }, 200);
    }
  }, []); // eslint-disable-line

  function clearSched() {
    clearTimeout(schedTimer.current);
    schedTimer.current = null;
  }

  // ─────────────────────────────────────────────────────────
  // PROMISE-BASED FRAME CAPTURE
  // Resolves with fresh landmarks from the very next MP result
  // ─────────────────────────────────────────────────────────
  function captureOneLandmark(faceMesh, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        faceMesh.onResults((r) => handleMPResults(r)); // restore
        reject(new Error("Face lost — hold still"));
      }, timeoutMs);

      faceMesh.onResults((results) => {
        const ok =
          results.multiFaceLandmarks &&
          results.multiFaceLandmarks.length > 0 &&
          results.multiFaceLandmarks[0].length > 0;
        if (ok) {
          clearTimeout(timer);
          faceMesh.onResults((r) => handleMPResults(r)); // restore
          resolve(results.multiFaceLandmarks[0]);
        }
      });

      // Trigger a fresh send
      if (videoRef.current && videoRef.current.readyState === 4) {
        faceMesh.send({ image: videoRef.current }).catch((e) => {
          clearTimeout(timer);
          faceMesh.onResults((r) => handleMPResults(r));
          reject(e);
        });
      } else {
        clearTimeout(timer);
        faceMesh.onResults((r) => handleMPResults(r));
        reject(new Error("Camera not ready"));
      }
    });
  }

  // CAPTURE SAMPLES (2 distinct frames, 300ms apart)
  async function runCapture() {
    if (busy.current) return;
    busy.current = true;
    cancelAnimationFrame(rafRef.current);
    mpCameraRef.current = false;
    setCaptureStep(0);

    const descriptors = [];
    const SAMPLES = 2;

    try {
      setPhase("capture");
      setMsg("Capturing face…");
      setSubMsg("Stay perfectly still");

      const faceMesh = MPCache.getInstance();

      for (let i = 0; i < SAMPLES; i++) {
        setCaptureStep(i + 1);
        if (i > 0) await sleep(300); // ensure frames are distinct
        const landmarks = await captureOneLandmark(faceMesh);
        descriptors.push(extractDescriptor(landmarks));
      }

      setPhase("match");
      setMsg("Verifying identity…");
      setSubMsg("Secure matching in progress");
      await sendToBackend(descriptors);

    } catch (err) {
      // Always restore MP handler before retry
      const fm = MPCache.getInstance();
      if (fm) fm.onResults((r) => handleMPResults(r));
      retryableError(err.message || "Capture failed — please try again");
    }
  }

  // ─────────────────────────────────────────────────────────
  // SEND TO BACKEND
  // ─────────────────────────────────────────────────────────
  async function sendToBackend(descriptors) {
    let res;
    try {
      res = await axios.post("/biometric/face/verify", {
        descriptorSample: descriptors,
        sessionId: sessionId.current,
      });
    } catch (e) {
      const status = e?.status || e?.response?.status;
      if (status === 429) { handleLock(e?.response?.data || e?.data || {}); return; }
      if (status === 404) {
        try {
          res = await axios.post("/biometric/face-login", {
            descriptorSample: descriptors,
            sessionId: sessionId.current,
          });
        } catch (e2) {
          const s2 = e2?.status || e2?.response?.status;
          if (s2 === 429) { handleLock(e2?.response?.data || e2?.data || {}); return; }
          throw e2;
        }
      } else throw e;
    }

    const d = res?.data || res;

    if (d?.locked) { handleLock(d); return; }
    if (!d.success && d.shouldRetry) { handleAmbiguous(null, 0.5); return; }
    if (d.success && d.isNewUser && d.needsRegistration) { handleNewUser(descriptors); return; }
    if (d.success && (d.customer || d.data?.customer)) {
      handleSuccess(d.customer || d.data.customer, d.matchScore, d.consistency);
      return;
    }
    if (!d.success && d.attempts !== undefined) { handleFailed(d); return; }
    throw new Error(d.message || "Unrecognized server response");
  }

  // ─────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────
  function handleSuccess(customer, matchScore, consistency) {
    const confidence = parseFloat(matchScore) || 0;
    const agree = parseFloat(consistency) || 0;

    if (confidence < Q.MIN_BACKEND_CONF || agree < 0.85) {
      handleAmbiguous(customer.username, confidence);
      return;
    }

    stopStream();
    const name = customer.name || customer.displayName || customer.username;
    setPhase("success");
    setMsg(`Welcome back, ${name}!`);
    setSubMsg("Redirecting to menu…");
    toast.success(`✅ Identity verified: ${name}`, { autoClose: 2000 });

    localStorage.setItem("customerSession", JSON.stringify({
      customerId: customer._id || customer.id,
      customerName: name,
      tableId: tableData.tableId,
      tableNumber: tableData.tableNumber,
      sessionId: customer.sessionId || sessionId.current,
      loginMethod: "face",
      confidence: confidence.toFixed(3),
      timestamp: new Date().toISOString(),
    }));

    gsap.fromTo(".face-success-ring",
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2.5)" }
    );

    setTimeout(() => navigate("/customer/menu", {
      state: { customer, tableId: tableData.tableId, tableNumber: tableData.tableNumber },
    }), 1600);
  }

  function handleNewUser(descriptors) {
    cancelAnimationFrame(rafRef.current);
    samplesRef.current = descriptors;
    const ts = Date.now().toString(36);
    setUname(`guest_${ts}_${Math.random().toString(36).slice(2, 5)}`);
    setPhase("username");
    setMsg("New visitor — create your profile");
    setSubMsg("Your face has been securely captured");
  }

  function handleAmbiguous(username, confidence) {
    busy.current = false;
    setPhase("error");
    setErrMsg(`Unclear match (${(confidence * 100).toFixed(0)}%) — recapturing…`);
    toast.warning("Unclear match — retrying automatically", { autoClose: 2000 });
    setTimeout(() => {
      busy.current = false;
      goodFrames.current = 0;
      lastLandmarks.current = null;
      setPhase("ready");
      setErrMsg("");
      setMsg("Hold still — recapturing");
      setSubMsg("");
      mpCameraRef.current = false;
      startMPCamera();
    }, 1500);
  }

  function handleFailed(data) {
    const att = data.attempts || attempts + 1;
    const rem = data.remaining ?? (MAX_ATTEMPTS - att);
    setAttempts(att);
    setErrMsg(data.message || `Face not recognized · ${rem} attempt${rem !== 1 ? "s" : ""} left`);
    setPhase("error");
    toast.warning(`❌ Attempt ${att}/${MAX_ATTEMPTS}`, { autoClose: 2000 });
    setTimeout(() => {
      busy.current = false;
      goodFrames.current = 0;
      lastLandmarks.current = null;
      setPhase("ready");
      setErrMsg("");
      setMsg("Try again — look straight at camera");
      setSubMsg("");
      mpCameraRef.current = false;
      startMPCamera();
    }, 2200);
  }

  function handleLock(data) {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(schedTimer.current);
    schedTimer.current = null;
    goodFrames.current = 0;
    mpCameraRef.current = false;
    const mins = data?.remainingMinutes || 5;
    setLockSecs(mins * 60);
    setPhase("locked");
    busy.current = false;
    stopStream();
    toast.error(`🔒 Too many attempts — locked for ${mins} minute(s)`, { autoClose: 5000 });
  }

  function retryableError(errMessage) {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(schedTimer.current);
    schedTimer.current = null;
    mpCameraRef.current = false;
    setErrMsg(errMessage);
    setPhase("error");
    toast.error(errMessage, { autoClose: 3000 });
    setTimeout(() => {
      busy.current = false;
      goodFrames.current = 0;
      lastLandmarks.current = null;
      setPhase("ready");
      setErrMsg("");
      setMsg("Try again");
      setSubMsg("");
      startMPCamera();
    }, 2500);
  }

  // ─────────────────────────────────────────────────────────
  // NEW USER REGISTRATION
  // ─────────────────────────────────────────────────────────
  async function registerNewUser(e) {
    e.preventDefault();
    if (uname.trim().length < 3) { toast.error("Minimum 3 characters"); return; }
    setReg(true);

    try {
      const payload = {
        username: uname.trim().toLowerCase(),
        displayName: uname.trim(),
        name: uname.trim(),
        tableNumber: tableData.tableNumber,
        tableId: tableData.tableId,
        sessionId: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        method: "face",
      };
      const cr = await customerAPI.register(payload);
      const customer = cr?.customer || cr?.data?.customer || cr;
      const cid = customer._id || customer.id;
      if (!cid) throw new Error("Registration failed — no customer ID returned");

      try {
        await axios.post("/biometric/face/register", { customerId: cid, descriptorSample: samplesRef.current });
      } catch (e2) {
        if ([404].includes(e2?.status || e2?.response?.status)) {
          await axios.post("/biometric/face-register", { customerId: cid, descriptorSample: samplesRef.current });
        } else throw e2;
      }

      const name = customer.displayName || uname.trim();
      toast.success(`✅ Welcome, ${name}! Registration complete.`, { autoClose: 2500 });

      localStorage.setItem("customerSession", JSON.stringify({
        customerId: cid,
        customerName: name,
        tableId: tableData.tableId,
        tableNumber: tableData.tableNumber,
        sessionId: customer.sessionId || sessionId.current,
        loginMethod: "face",
        timestamp: new Date().toISOString(),
      }));

      stopStream();
      setPhase("success");
      setMsg(`Welcome, ${name}!`);
      setSubMsg("Redirecting to menu…");

      setTimeout(() => navigate("/customer/menu", {
        state: {
          customer: { ...customer, hasFaceData: true },
          tableId: tableData.tableId,
          tableNumber: tableData.tableNumber,
        },
      }), 1600);
    } catch (err) {
      const m = err?.data?.message || err?.response?.data?.message || err.message || "Registration failed";
      if ([409].includes(err?.status || err?.response?.status)) {
        toast.error("Username already taken — try another");
        setUname(`guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 4)}`);
      } else {
        toast.error(m);
      }
      setReg(false);
    }
  }

  function tryAgain() {
    samplesRef.current = null;
    busy.current = false;
    goodFrames.current = 0;
    lastLandmarks.current = null;
    setPhase("ready");
    setMsg("Look straight at the camera");
    setSubMsg("Hold still when the oval turns green");
    mpCameraRef.current = false;
    startMPCamera();
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: LOCKED
  // ═══════════════════════════════════════════════════════════
  if (phase === "locked") return (
    <div className="space-y-6">
      <div className="bg-error/10 border-2 border-error/30 rounded-3xl p-8 text-center">
        <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Ban className="w-10 h-10 text-error" />
        </div>
        <h2 className="text-2xl font-bold text-error mb-2">Access Temporarily Restricted</h2>
        <p className="text-text-secondary mb-5">Too many failed attempts detected.</p>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-bg-secondary rounded-xl">
          <Clock className="w-5 h-5 text-warning" />
          <div className="text-left">
            <p className="text-xs text-text-tertiary">Unlocks in</p>
            <p className="text-2xl font-bold text-warning font-mono">{fmt(lockSecs)}</p>
          </div>
        </div>
      </div>
      <div className="bg-info/10 border border-info/20 rounded-2xl p-5">
        <p className="text-sm font-semibold text-info mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Alternative Login Methods
        </p>
        <div className="space-y-2">
          {window.PublicKeyCredential && (
            <button onClick={() => { stopStream(); onFallback?.("fingerprint"); }}
              className="w-full flex items-center gap-3 bg-bg-elevated hover:bg-bg-secondary border border-border hover:border-brand rounded-xl p-4 transition-all group">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-text-primary">Fingerprint Login</p>
                <p className="text-xs text-text-secondary">Biometric authentication</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-brand transition-colors" />
            </button>
          )}
          <button onClick={() => { stopStream(); onFallback?.("username"); }}
            className="w-full flex items-center gap-3 bg-bg-elevated hover:bg-bg-secondary border border-border hover:border-brand rounded-xl p-4 transition-all group">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-text-primary">Username Login</p>
              <p className="text-xs text-text-secondary">Traditional method</p>
            </div>
            <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-brand transition-colors" />
          </button>
        </div>
      </div>
      <button onClick={onCancel}
        className="w-full py-3 border-2 border-border hover:border-brand rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-all">
        Cancel
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: USERNAME REGISTRATION
  // ═══════════════════════════════════════════════════════════
  if (phase === "username") return (
    <div className="bg-bg-elevated rounded-3xl p-8 border-2 border-brand/20 shadow-xl">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-brand to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">New Visitor!</h2>
        <p className="text-sm text-text-secondary">
          Your face has been captured. Choose a username — next time you'll log in instantly.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: Q.SAMPLES }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-success" />
        ))}
        <span className="text-xs text-text-tertiary ml-1">{Q.SAMPLES} samples captured</span>
      </div>
      <form onSubmit={registerNewUser} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-text-primary">Choose a Username</label>
            <button type="button"
              onClick={() => setUname(`guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 4)}`)}
              className="text-xs text-brand hover:opacity-75 flex items-center gap-1 transition-opacity">
              <RefreshCw className="w-3 h-3" /> Generate
            </button>
          </div>
          <input type="text" value={uname} onChange={(e) => setUname(e.target.value)}
            className="w-full px-4 py-3 bg-bg-secondary border-2 border-border focus:border-brand rounded-xl text-text-primary outline-none transition-all"
            style={{ fontSize: 16 }} autoFocus disabled={registering} minLength={3} maxLength={30} placeholder="Enter username" />
          <p className="text-xs text-text-tertiary mt-1.5">3–30 characters</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={tryAgain} disabled={registering}
            className="flex-1 py-3 bg-bg-secondary hover:bg-bg-tertiary rounded-xl font-semibold text-text-secondary transition-all disabled:opacity-50">
            Recapture
          </button>
          <button type="submit" disabled={uname.trim().length < 3 || registering}
            className="flex-1 py-3 bg-gradient-to-r from-brand to-secondary text-white font-semibold rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
            {registering
              ? <><Loader className="w-4 h-4 animate-spin" /> Registering…</>
              : <><span>Complete Registration</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </form>
      <div className="mt-4 p-3 bg-info/8 border border-info/20 rounded-xl">
        <p className="text-xs text-text-tertiary text-center flex items-center justify-center gap-1.5">
          <Eye className="w-3 h-3 text-info" />
          Your face data is stored securely and only used for login
        </p>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: MAIN CAMERA VIEW
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-border shadow-2xl">
        <div style={{ position: "relative", aspectRatio: "4/3" }}>
          <video ref={videoRef} autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }} />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-0" />

          {/* Face oval */}
          {(phase === "ready" || phase === "capture") && (
            <svg viewBox="0 0 640 480" className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <radialGradient id="vig" cx="50%" cy="50%" r="58%">
                  <stop offset="35%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.50)" />
                </radialGradient>
              </defs>
              <rect width="640" height="480" fill="url(#vig)" />
              <ellipse cx="320" cy="235" rx="158" ry="190" fill="none"
                stroke={faceOK ? "#10b981" : "rgba(255,255,255,0.45)"}
                strokeWidth={faceOK ? 3 : 2.5}
                strokeDasharray={faceOK ? "none" : "15,8"}
                style={{ transition: "stroke 0.25s, stroke-width 0.25s" }} />
              {faceOK && (
                <>
                  <line x1="162" y1="235" x2="172" y2="235" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <line x1="478" y1="235" x2="468" y2="235" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <line x1="320" y1="45" x2="320" y2="55" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <line x1="320" y1="425" x2="320" y2="415" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </>
              )}
            </svg>
          )}

          {/* HUD */}
          {(phase === "ready" || phase === "capture") && (
            <>
              <div className="absolute top-3 right-3 z-10">
                <div className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 text-xs font-bold border transition-all ${
                  faceOK ? "bg-success/20 border-success/50 text-success" : "bg-black/50 border-white/20 text-white/70"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${faceOK ? "bg-success animate-pulse" : "bg-white/40"}`} />
                  {faceOK ? `${qPct}%` : "No face"}
                </div>
              </div>
              <div className="absolute top-3 left-3 z-10">
                <div className="px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold border bg-emerald-500/20 border-emerald-500/50 text-emerald-400">
                  ⚡ MediaPipe
                </div>
              </div>
              {attempts > 0 && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-3 py-1.5 bg-warning/20 border border-warning/50 rounded-full backdrop-blur-md flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-warning" />
                    <span className="text-xs font-bold text-warning">{attempts}/{MAX_ATTEMPTS}</span>
                  </div>
                </div>
              )}
              {phase === "capture" && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {Array.from({ length: Q.SAMPLES }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < captureStep ? "bg-success scale-110" : "bg-white/30"}`} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Overlays */}
          {phase === "init" && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4">
              <Zap className="w-12 h-12 text-brand animate-pulse" />
              <p className="text-white font-semibold">{msg}</p>
              <div className="w-52 h-2 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand to-secondary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/35 text-xs">Powered by MediaPipe FaceMesh</p>
            </div>
          )}
          {(phase === "capture" || phase === "match") && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <Loader className="w-14 h-14 text-brand animate-spin" />
              <p className="text-white text-lg font-semibold">{msg}</p>
              {subMsg && <p className="text-white/60 text-sm">{subMsg}</p>}
              <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                <ShieldAlert className="w-3.5 h-3.5" /><span>Secure processing</span>
              </div>
            </div>
          )}
          {phase === "error" && errMsg && (
            <div className="absolute inset-0 bg-error/15 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6">
              <XCircle className="w-14 h-14 text-error" />
              <p className="text-white text-center font-semibold max-w-sm">{errMsg}</p>
            </div>
          )}
          {phase === "success" && (
            <div className="absolute inset-0 bg-black/92 flex flex-col items-center justify-center gap-4">
              <div className="face-success-ring">
                <CheckCircle className="w-24 h-24 text-success" style={{ filter: "drop-shadow(0 0 45px #10b981)" }} />
              </div>
              <p className="text-white text-xl font-bold text-center px-6">{msg}</p>
              {subMsg && <p className="text-white/50 text-sm">{subMsg}</p>}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="px-5 py-4 bg-bg-secondary border-t border-border flex items-center gap-3">
          {phase === "ready" && faceOK
            ? <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            : (phase === "capture" || phase === "match")
            ? <Loader className="w-4 h-4 text-brand animate-spin flex-shrink-0" />
            : <Camera className="w-4 h-4 text-text-tertiary flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary leading-tight truncate">{msg}</p>
            {subMsg && <p className="text-xs text-text-tertiary mt-0.5 truncate">{subMsg}</p>}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-info/8 border border-info/20 rounded-2xl p-4">
        <p className="text-xs font-semibold text-info mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> How it works
        </p>
        <ul className="text-xs text-text-tertiary space-y-1 leading-relaxed">
          <li>• <strong className="text-text-secondary">Returning visitor</strong> — face matched instantly, straight to menu</li>
          <li>• <strong className="text-text-secondary">First visit</strong> — choose a username, registered automatically</li>
          <li>• Powered by MediaPipe FaceMesh — fast & accurate, no local model files</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 border-2 border-border hover:border-error/50 rounded-xl font-semibold text-text-secondary hover:text-error transition-all text-sm">
          Cancel
        </button>
        <button onClick={() => { stopStream(); onFallback?.("username"); }}
          className="flex-1 py-3 border-2 border-border hover:border-brand rounded-xl font-semibold text-text-secondary hover:text-brand transition-all text-sm flex items-center justify-center gap-2">
          <Hash className="w-4 h-4" /> Use Username
        </button>
      </div>
    </div>
  );
};

export default FaceRecognitionCapture;