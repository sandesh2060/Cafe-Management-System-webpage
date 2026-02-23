// ================================================================
// FILE: frontend/src/modules/customer/components/FaceRecognitionMultiAngle.jsx
//
// ✅ MIGRATED: face-api.js → MediaPipe FaceMesh
//
// ✅ Registration: 5 poses (front, left, right, up, down) + liveness
// ✅ Login: Fast 2-frame recognition
// ✅ All existing logic preserved (lockout, retry, username, backend API)
//
// MEDIAPIPE NOTES:
//   • Uses @mediapipe/face_mesh for landmark detection
//   • Descriptor = 128-dim normalized vector from 33 key landmarks
//   • Liveness: head pose estimation from landmark geometry
//   • No model files in /public/models needed — loaded from CDN
// ================================================================

import React, { useState, useEffect, useRef } from "react";
import {
  Camera, CheckCircle, XCircle, Loader, User,
  AlertTriangle, ArrowRight, RefreshCw, Ban,
  Hash, Clock, Eye, TrendingUp, RotateCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import gsap from "gsap";
import axios from "../../../api/axios";
import { customerAPI } from "../../../api/endpoints";

// ─────────────────────────────────────────────────────────────
// MEDIAPIPE SINGLETON (shared with FaceRecognitionCapture)
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
        const { FaceMesh } = await import("@mediapipe/face_mesh");

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
        console.log("✅ [MPCache] MediaPipe FaceMesh loaded");
        return faceMesh;
      })();

      return window.__mpFaceMeshLoading__;
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// DESCRIPTOR EXTRACTION (identical to FaceRecognitionCapture)
// ─────────────────────────────────────────────────────────────
const KEY_LANDMARKS = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400,
  33, 7, 163, 144, 145, 153, 154, 155,
  168, 6, 197, 195,
  61, 291, 39, 269,
];

function extractDescriptor(landmarks) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const lm of landmarks) {
    if (lm.x < minX) minX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y > maxY) maxY = lm.y;
  }
  const faceW = maxX - minX || 1;
  const faceH = maxY - minY || 1;

  const points = KEY_LANDMARKS.map((idx) => {
    const lm = landmarks[idx];
    return [(lm.x - minX) / faceW, (lm.y - minY) / faceH, lm.z || 0];
  });

  const flat = points.flat();
  const descriptor = new Array(128).fill(0);
  for (let i = 0; i < 128; i++) {
    const srcIdx = (i / 127) * (flat.length - 1);
    const lo = Math.floor(srcIdx);
    const hi = Math.min(lo + 1, flat.length - 1);
    const t = srcIdx - lo;
    descriptor[i] = flat[lo] * (1 - t) + flat[hi] * t;
  }

  const norm = Math.sqrt(descriptor.reduce((s, v) => s + v * v, 0)) || 1;
  return descriptor.map((v) => v / norm);
}

// ─────────────────────────────────────────────────────────────
// HEAD POSE ESTIMATION (for multi-angle guidance)
// Uses nose tip + face center to estimate yaw/pitch
// ─────────────────────────────────────────────────────────────
function estimateHeadPose(landmarks) {
  // Nose tip: 1, Chin: 152, Left cheek: 234, Right cheek: 454
  const nose   = landmarks[1];
  const chin   = landmarks[152];
  const leftC  = landmarks[234];
  const rightC = landmarks[454];

  const faceCenter = {
    x: (leftC.x + rightC.x) / 2,
    y: (leftC.y + chin.y) / 2,
  };

  const yaw   = (nose.x - faceCenter.x) * 200;   // neg = left, pos = right
  const pitch = (nose.y - faceCenter.y) * 200;   // neg = up,   pos = down

  return { yaw, pitch };
}

// ─────────────────────────────────────────────────────────────
// BLINK DETECTION — eye aspect ratio from landmarks
// Left eye: 33,160,158,133,153,144  Right eye: 362,385,387,263,373,380
// ─────────────────────────────────────────────────────────────
function getEAR(landmarks, indices) {
  const [p1, p2, p3, p4, p5, p6] = indices.map((i) => landmarks[i]);
  const h1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
  const h2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
  const w  = Math.hypot(p1.x - p4.x, p1.y - p4.y);
  return (h1 + h2) / (2 * w + 1e-6);
}

const LEFT_EYE_IDX  = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_IDX = [362, 385, 387, 263, 373, 380];

// ─────────────────────────────────────────────────────────────
// REGISTRATION POSES
// ─────────────────────────────────────────────────────────────
const REGISTRATION_POSES = [
  { id: "front", instruction: "Look straight at the camera", emoji: "👤",
    detail: "Keep your head centred and face forward", color: "#10b981",
    check: (pose) => Math.abs(pose.yaw) < 15 && Math.abs(pose.pitch) < 15 },
  { id: "left",  instruction: "Turn your head slightly LEFT", emoji: "👈",
    detail: "Turn about 15–20° to your left", color: "#3b82f6",
    check: (pose) => pose.yaw < -12 },
  { id: "right", instruction: "Turn your head slightly RIGHT", emoji: "👉",
    detail: "Turn about 15–20° to your right", color: "#8b5cf6",
    check: (pose) => pose.yaw > 12 },
  { id: "up",    instruction: "Tilt your head slightly UP", emoji: "⬆️",
    detail: "Look up about 10–15°", color: "#f59e0b",
    check: (pose) => pose.pitch < -8 },
  { id: "down",  instruction: "Tilt your head slightly DOWN", emoji: "⬇️",
    detail: "Look down about 10–15°", color: "#ec4899",
    check: (pose) => pose.pitch > 8 },
];

const LIVENESS_CHECKS = [
  { id: "blink", instruction: "Blink your eyes naturally", emoji: "👁️" },
  { id: "smile", instruction: "Smile for the camera",     emoji: "😊" },
];

const QUALITY_CONFIG = {
  REQUIRED_FRAMES: 3,
  SAMPLE_COUNT_LOGIN: 2,
  MIN_FACE_RATIO: 0.12,
};

const MAX_ATTEMPTS = 4;
const LOCK_MS = 5 * 60_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const FaceRecognitionMultiAngle = ({ tableData, onSuccess, onCancel, onFallback }) => {
  const navigate = useNavigate();

  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [status, setStatus]         = useState("initializing");
  const [message, setMessage]       = useState("Loading MediaPipe…");
  const [progress, setProgress]     = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionIssue, setDetectionIssue] = useState(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [capturedPoses, setCapturedPoses]       = useState([]);
  const [livenessCheckIndex, setLivenessCheckIndex] = useState(0);
  const [livenessCompleted, setLivenessCompleted]   = useState(false);
  const [livenessDetected, setLivenessDetected]     = useState(false);
  const [attempts, setAttempts]           = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
  const [isLocked, setIsLocked]           = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername]           = useState("");
  const [capturedDescriptors, setCapturedDescriptors] = useState(null);
  const [registeringUser, setRegisteringUser] = useState(false);
  const [showLightingHelp, setShowLightingHelp] = useState(false);
  const [headPose, setHeadPose]           = useState({ yaw: 0, pitch: 0 });

  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const streamRef     = useRef(null);
  const rafRef        = useRef(null);
  const lockTimerRef  = useRef(null);
  const isCapturing   = useRef(false);
  const statusRef     = useRef("initializing");
  const sessionIdRef  = useRef(`session_${tableData.tableId}_${Date.now()}`);
  const landmarksRef  = useRef(null);
  const goodFrames    = useRef(0);
  const captureTimer  = useRef(null);
  const mpRunning     = useRef(false);
  const lastDetectTime = useRef(Date.now());
  const noDetectWarnShown = useRef(false);
  const prevEAR       = useRef(null);
  const blinkDetected = useRef(false);
  const currentPoseRef = useRef(0);
  const capturedPosesRef = useRef([]);
  const livenessIdxRef = useRef(0);
  const isRegModeRef  = useRef(false);
  const statusRefInner = useRef("initializing");

  useEffect(() => { statusRef.current = status; statusRefInner.current = status; }, [status]);
  useEffect(() => { currentPoseRef.current = currentPoseIndex; }, [currentPoseIndex]);
  useEffect(() => { capturedPosesRef.current = capturedPoses; }, [capturedPoses]);
  useEffect(() => { livenessIdxRef.current = livenessCheckIndex; }, [livenessCheckIndex]);
  useEffect(() => { isRegModeRef.current = isRegistrationMode; }, [isRegistrationMode]);

  // ── Boot ──
  useEffect(() => {
    let dead = false;
    boot(dead).catch((e) => {
      if (!dead) { setStatus("error"); setMessage(e.message || "Init failed"); }
    });
    return () => { dead = true; cleanup(); };
  }, []); // eslint-disable-line

  // ── Lock countdown ──
  useEffect(() => {
    if (!isLocked || lockTimeRemaining <= 0) return;
    lockTimerRef.current = setInterval(() => {
      setLockTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(lockTimerRef.current);
          setIsLocked(false);
          setAttempts(0);
          setRemainingAttempts(MAX_ATTEMPTS);
          setStatus("ready");
          setMessage("Cooldown expired — try again");
          toast.info("You can try again now");
          isCapturing.current = false;
          startMPLoop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(lockTimerRef.current);
  }, [isLocked, lockTimeRemaining]); // eslint-disable-line

  // ── Liveness trigger ──
  useEffect(() => {
    if (!isRegistrationMode || status !== "liveness" || !livenessDetected) return;
    const currentCheck = LIVENESS_CHECKS[livenessCheckIndex];
    toast.success(`✓ ${currentCheck.instruction} detected!`, { autoClose: 1000, position: "top-center" });
    setTimeout(() => {
      if (livenessCheckIndex < LIVENESS_CHECKS.length - 1) {
        setLivenessCheckIndex((i) => i + 1);
        setLivenessDetected(false);
        setMessage(LIVENESS_CHECKS[livenessCheckIndex + 1].instruction);
      } else {
        setLivenessCompleted(true);
        completeRegistration();
      }
    }, 1000);
  }, [livenessDetected, livenessCheckIndex, isRegistrationMode, status]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────
  async function boot(dead) {
    setProgress(10);
    const [faceMesh] = await Promise.all([MPCache.load(), startCamera(dead)]);
    if (dead) return;
    setProgress(90);

    faceMesh.onResults((results) => {
      if (dead) return;
      handleMPResults(results);
    });

    setProgress(100);
    setStatus("ready");
    setMessage("Position your face in the frame");
    startMPLoop();
  }

  async function startCamera(dead) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await sleep(500 * attempt);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
        if (dead) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await new Promise((res, rej) => {
          const t = setTimeout(() => rej(new Error("Camera timeout")), 15_000);
          videoRef.current.onloadedmetadata = () =>
            videoRef.current.play().then(() => { clearTimeout(t); setTimeout(res, 500); }).catch(rej);
        });
        return;
      } catch (err) {
        if (attempt === 2) {
          setStatus("error");
          setMessage(err.name === "NotAllowedError" ? "Camera denied — please allow access" : "Camera error — please refresh");
          throw err;
        }
      }
    }
  }

  function startMPLoop() {
    if (mpRunning.current) return;
    mpRunning.current = true;
    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const faceMesh = MPCache.getInstance();
      const s = statusRefInner.current;
      if (faceMesh && (s === "ready" || s === "liveness")) {
        try { await faceMesh.send({ image: videoRef.current }); } catch { /* ignore */ }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopMPLoop() {
    cancelAnimationFrame(rafRef.current);
    mpRunning.current = false;
  }

  function cleanup() {
    stopMPLoop();
    clearTimeout(captureTimer.current);
    clearInterval(lockTimerRef.current);
    isCapturing.current = false;
    mpRunning.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // ─────────────────────────────────────────────────────────
  // MEDIAPIPE RESULTS
  // ─────────────────────────────────────────────────────────
  function handleMPResults(results) {
    if (isCapturing.current || isLocked) return;

    const hasFace = results.multiFaceLandmarks?.length > 0;

    if (!hasFace) {
      setFaceDetected(false);
      goodFrames.current = 0;
      clearTimeout(captureTimer.current);
      captureTimer.current = null;
      landmarksRef.current = null;

      const elapsed = Date.now() - lastDetectTime.current;
      if (elapsed > 3000) setDetectionIssue("Move into frame");
      if (elapsed > 10_000 && !noDetectWarnShown.current) {
        noDetectWarnShown.current = true;
        setShowLightingHelp(true);
        toast.warning("Having trouble? Check lighting tips!", { autoClose: 5000 });
      }
      return;
    }

    lastDetectTime.current = Date.now();
    noDetectWarnShown.current = false;
    setShowLightingHelp(false);

    const landmarks = results.multiFaceLandmarks[0];
    landmarksRef.current = landmarks;

    // Face size check
    let minX = Infinity, maxX = -Infinity;
    for (const lm of landmarks) { if (lm.x < minX) minX = lm.x; if (lm.x > maxX) maxX = lm.x; }
    const faceRatio = maxX - minX;

    if (faceRatio < QUALITY_CONFIG.MIN_FACE_RATIO) {
      goodFrames.current = 0;
      setDetectionIssue("Move closer");
      setFaceDetected(true);
      return;
    }

    setFaceDetected(true);
    setDetectionIssue(null);

    // Head pose estimation
    const pose = estimateHeadPose(landmarks);
    setHeadPose(pose);

    // Liveness: blink detection
    const s = statusRefInner.current;
    if (isRegModeRef.current && s === "liveness") {
      const lIdx = livenessIdxRef.current;
      if (lIdx === 0) {
        // Blink check via EAR
        const leftEAR  = getEAR(landmarks, LEFT_EYE_IDX);
        const rightEAR = getEAR(landmarks, RIGHT_EYE_IDX);
        const avgEAR   = (leftEAR + rightEAR) / 2;
        if (prevEAR.current !== null && prevEAR.current > 0.25 && avgEAR < 0.18) {
          blinkDetected.current = true;
          setLivenessDetected(true);
        }
        prevEAR.current = avgEAR;
      }
      // Smile check (lIdx === 1) — MediaPipe doesn't expose expressions,
      // so we use a mouth open ratio as proxy for happiness
      if (lIdx === 1) {
        // Upper lip: 13, Lower lip: 14 distance vs mouth width 61-291
        const ul = landmarks[13]; const ll = landmarks[14];
        const ml = landmarks[61]; const mr = landmarks[291];
        const openness = Math.hypot(ul.x - ll.x, ul.y - ll.y);
        const width    = Math.hypot(ml.x - mr.x, ml.y - mr.y);
        if (openness / (width + 1e-6) > 0.12) setLivenessDetected(true);
      }
      return;
    }

    // Registration mode: check if current pose is correct
    if (isRegModeRef.current && s === "ready") {
      const poseIdx   = currentPoseRef.current;
      const poseConf  = REGISTRATION_POSES[poseIdx]?.check(pose);
      if (!poseConf) { goodFrames.current = 0; return; }
    }

    goodFrames.current++;

    if (goodFrames.current >= QUALITY_CONFIG.REQUIRED_FRAMES && !captureTimer.current && !isCapturing.current) {
      captureTimer.current = setTimeout(() => {
        captureTimer.current = null;
        goodFrames.current = 0;
        if (statusRefInner.current === "ready" && !isCapturing.current && !isLocked) {
          if (isRegModeRef.current) capturePoseSample();
          else captureFaceForLogin();
        }
      }, 300);
    }
  }

  // ─────────────────────────────────────────────────────────
  // CAPTURE — REGISTRATION POSE
  // ─────────────────────────────────────────────────────────
  async function capturePoseSample() {
    if (isCapturing.current) return;
    isCapturing.current = true;
    stopMPLoop();

    try {
      const poseIdx = currentPoseRef.current;
      const currentPose = REGISTRATION_POSES[poseIdx];
      setStatus("capturing");
      setMessage(`Capturing — ${currentPose.instruction}`);

      // Send one frame to ensure fresh landmarks
      const faceMesh = MPCache.getInstance();
      await faceMesh.send({ image: videoRef.current });
      await sleep(80);

      const landmarks = landmarksRef.current;
      if (!landmarks) throw new Error("Face lost — hold still");

      const descriptor = extractDescriptor(landmarks);
      const newPoses = [...capturedPosesRef.current, { pose: currentPose.id, descriptor }];
      setCapturedPoses(newPoses);
      capturedPosesRef.current = newPoses;

      gsap.to(`.pose-dot-${poseIdx}`, { scale: 1.3, backgroundColor: currentPose.color, duration: 0.3, ease: "back.out(2)" });
      toast.success(`✓ ${currentPose.instruction} captured!`, { autoClose: 900, position: "top-center" });
      await sleep(700);

      if (poseIdx < REGISTRATION_POSES.length - 1) {
        setCurrentPoseIndex(poseIdx + 1);
        setStatus("ready");
        setMessage(REGISTRATION_POSES[poseIdx + 1].instruction);
        isCapturing.current = false;
        goodFrames.current = 0;
        startMPLoop();
      } else {
        setStatus("liveness");
        setMessage(LIVENESS_CHECKS[0].instruction);
        isCapturing.current = false;
        prevEAR.current = null;
        blinkDetected.current = false;
        startMPLoop();
      }
    } catch (err) {
      toast.error(err.message || "Capture failed");
      isCapturing.current = false;
      setStatus("ready");
      startMPLoop();
    }
  }

  // ─────────────────────────────────────────────────────────
  // CAPTURE — LOGIN
  // ─────────────────────────────────────────────────────────
  async function captureFaceForLogin() {
    if (isCapturing.current || isLocked) return;
    isCapturing.current = true;
    stopMPLoop();

    const samples = [];
    try {
      setStatus("capturing");
      setMessage("Capturing face samples…");

      const faceMesh = MPCache.getInstance();
      for (let i = 0; i < QUALITY_CONFIG.SAMPLE_COUNT_LOGIN; i++) {
        await faceMesh.send({ image: videoRef.current });
        await sleep(100);
        const lm = landmarksRef.current;
        if (!lm) throw new Error(`Sample ${i + 1} failed — hold still`);
        samples.push(extractDescriptor(lm));
      }

      setStatus("processing");
      setMessage("Matching face…");

      let response;
      try {
        response = await axios.post("/biometric/face/verify", {
          descriptorSample: samples,
          sessionId: sessionIdRef.current,
        });
      } catch (err) {
        if (err?.status === 404 || err?.response?.status === 404) {
          response = await axios.post("/biometric/face-login", {
            descriptorSample: samples,
            sessionId: sessionIdRef.current,
          });
        } else throw err;
      }

      const d = response?.data || response;

      if (d?.locked) { handleLock(d); return; }
      if (!d.success && d.shouldRetry) { handleRetryableError("Unclear match — retrying…"); return; }
      if (d.success && d.isNewUser && d.needsRegistration) { handleNewUser(samples); return; }
      if (d.success && (d.customer || d.data?.customer)) {
        handleReturningUser(d.customer || d.data.customer);
        return;
      }
      if (!d.success && d.attempts !== undefined) { handleFailedAttempt(d); return; }
      throw new Error(d.message || "Unrecognized server response");

    } catch (err) {
      const status = err?.status || err?.response?.status;
      const data = err?.data || err?.response?.data || {};
      if (status === 429 || data?.locked) { handleLock(data); return; }
      if (data?.attempts !== undefined) { handleFailedAttempt(data); return; }
      handleRetryableError(data?.message || err.message || "An error occurred");
    }
  }

  // ─────────────────────────────────────────────────────────
  // REGISTRATION COMPLETION
  // ─────────────────────────────────────────────────────────
  function completeRegistration() {
    stopMPLoop();
    const allDescriptors = capturedPosesRef.current.map((p) => p.descriptor);
    handleNewUser(allDescriptors);
  }

  // ─────────────────────────────────────────────────────────
  // USER HANDLING
  // ─────────────────────────────────────────────────────────
  function handleNewUser(descriptors) {
    stopMPLoop();
    setStatus("needsUsername");
    setCapturedDescriptors(descriptors);
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    setUsername(`user_${ts}_${rand}`);
    setShowUsernamePrompt(true);
    setMessage("New face detected! Create your profile");
  }

  function handleReturningUser(customer) {
    setStatus("success");
    const name = customer.name || customer.displayName || customer.username;
    setMessage(`Welcome back, ${name}!`);
    toast.success(`Welcome back, ${name}! 👋`);

    localStorage.setItem("customerSession", JSON.stringify({
      customerId: customer._id || customer.id,
      customerName: name,
      tableId: tableData.tableId,
      tableNumber: tableData.tableNumber,
      sessionId: customer.sessionId || sessionIdRef.current,
      loginMethod: "face",
      timestamp: new Date().toISOString(),
    }));

    setTimeout(() => {
      stopCamera();
      navigate("/customer/menu", {
        state: { customer, tableId: tableData.tableId, tableNumber: tableData.tableNumber },
      });
    }, 1500);
  }

  function handleLock(data) {
    stopMPLoop();
    const mins = data?.remainingMinutes || 5;
    setIsLocked(true);
    setLockTimeRemaining(mins * 60);
    setAttempts(data?.attempts || MAX_ATTEMPTS);
    setRemainingAttempts(0);
    setStatus("locked");
    isCapturing.current = false;
    toast.error(`🔒 Locked for ${mins} minute(s)`, { autoClose: 5000 });
    stopCamera();
  }

  function handleFailedAttempt(data) {
    const newAtt = data.attempts || attempts + 1;
    const newRem = data.remaining ?? (MAX_ATTEMPTS - newAtt);
    setAttempts(newAtt);
    setRemainingAttempts(newRem);
    setStatus("error");
    setMessage(`Attempt ${newAtt}/${MAX_ATTEMPTS} failed`);
    toast.warning(`Attempt ${newAtt}/${MAX_ATTEMPTS}. ${newRem} remaining.`);
    setTimeout(() => {
      if (!isLocked) {
        isCapturing.current = false;
        setStatus("ready");
        setMessage("Try again — position clearly");
        goodFrames.current = 0;
        startMPLoop();
      }
    }, 2000);
  }

  function handleRetryableError(errorMsg) {
    setStatus("error");
    setMessage(errorMsg);
    toast.error(errorMsg, { autoClose: 2500 });
    setTimeout(() => {
      isCapturing.current = false;
      setStatus("ready");
      setMessage("Position your face in the frame");
      goodFrames.current = 0;
      startMPLoop();
    }, 2500);
  }

  // ─────────────────────────────────────────────────────────
  // REGISTRATION SUBMIT
  // ─────────────────────────────────────────────────────────
  function generateNewSuggestion() {
    const adjs  = ["happy","cool","smart","quick","bright","kind","awesome","super"];
    const nouns = ["user","guest","customer","friend","visitor","patron","foodie"];
    const a = adjs[Math.floor(Math.random() * adjs.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    const ts = Date.now().toString(36).slice(-4);
    setUsername(`${a}_${n}_${ts}`);
  }

  async function registerNewUser(e) {
    e.preventDefault();
    if (!username.trim() || username.trim().length < 3) { toast.error("Minimum 3 characters"); return; }

    setRegisteringUser(true);
    try {
      const payload = {
        username: username.trim().toLowerCase(),
        displayName: username.trim(),
        name: username.trim(),
        tableNumber: tableData.tableNumber,
        tableId: tableData.tableId,
        sessionId: `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        method: "face",
      };
      const cr = await customerAPI.register(payload);
      const customer = cr?.customer || cr?.data?.customer || cr;
      const cid = customer._id || customer.id;
      if (!cid) throw new Error("No customer ID returned");

      try {
        await axios.post("/biometric/face/register", { customerId: cid, descriptorSample: capturedDescriptors });
      } catch (e2) {
        if (e2?.status === 404 || e2?.response?.status === 404) {
          await axios.post("/biometric/face-register", { customerId: cid, descriptorSample: capturedDescriptors });
        } else throw e2;
      }

      toast.success(`Welcome, ${username}! Profile created 🎉`, { autoClose: 2000 });
      localStorage.setItem("customerSession", JSON.stringify({
        customerId: cid,
        customerName: customer.displayName || username,
        tableId: tableData.tableId,
        tableNumber: tableData.tableNumber,
        sessionId: customer.sessionId || sessionIdRef.current,
        loginMethod: "face",
        timestamp: new Date().toISOString(),
      }));
      setStatus("success");
      setMessage(`Welcome, ${username}!`);
      setTimeout(() => {
        stopCamera();
        navigate("/customer/menu", {
          state: { customer: { ...customer, hasFaceData: true }, tableId: tableData.tableId, tableNumber: tableData.tableNumber },
        });
      }, 1500);
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message || err.message || "Registration failed";
      if (err?.status === 409 || err?.response?.status === 409) {
        toast.error("Username taken — try another");
        generateNewSuggestion();
      } else {
        toast.error(msg);
      }
      setRegisteringUser(false);
    }
  }

  function handleTryAgain() {
    setShowUsernamePrompt(false);
    setCapturedDescriptors(null);
    setRegisteringUser(false);
    if (isRegistrationMode) {
      setCurrentPoseIndex(0);
      setCapturedPoses([]);
      capturedPosesRef.current = [];
      setLivenessCheckIndex(0);
      setLivenessCompleted(false);
      setLivenessDetected(false);
    }
    setStatus("ready");
    setMessage(isRegistrationMode ? REGISTRATION_POSES[0].instruction : "Position your face");
    isCapturing.current = false;
    goodFrames.current = 0;
    startMPLoop();
  }

  function switchToRegistrationMode() {
    setIsRegistrationMode(true);
    setCurrentPoseIndex(0);
    setCapturedPoses([]);
    capturedPosesRef.current = [];
    setStatus("ready");
    setMessage(REGISTRATION_POSES[0].instruction);
    goodFrames.current = 0;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: LOCKED
  // ═══════════════════════════════════════════════════════════
  if (isLocked && status === "locked") return (
    <div className="space-y-6">
      <div className="bg-error/10 border-2 border-error/30 rounded-3xl p-8 text-center">
        <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Ban className="w-10 h-10 text-error" />
        </div>
        <h2 className="text-2xl font-bold text-error mb-2">Face Recognition Locked</h2>
        <p className="text-text-secondary mb-4">Too many failed attempts.</p>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-bg-secondary rounded-xl">
          <Clock className="w-5 h-5 text-warning" />
          <div className="text-left">
            <p className="text-xs text-text-tertiary">Unlocks in</p>
            <p className="text-2xl font-bold text-warning font-mono">{fmtTime(lockTimeRemaining)}</p>
          </div>
        </div>
      </div>
      <button onClick={() => { stopCamera(); onFallback?.("username"); }}
        className="w-full group bg-bg-elevated hover:bg-bg-secondary border-2 border-border hover:border-brand rounded-2xl p-5 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Hash className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-bold text-text-primary mb-1">Enter Username</h4>
            <p className="text-sm text-text-secondary">Traditional login</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-brand transition-all" />
        </div>
      </button>
      <button onClick={onCancel} className="w-full py-3 border-2 border-border hover:border-brand rounded-xl font-semibold transition-all">
        Go Back
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: USERNAME PROMPT
  // ═══════════════════════════════════════════════════════════
  if (showUsernamePrompt) return (
    <div className="space-y-6">
      <div className="bg-bg-elevated rounded-3xl p-8 border-2 border-brand/20">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-brand to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            {isRegistrationMode ? <CheckCircle className="w-10 h-10 text-white" /> : <User className="w-10 h-10 text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {isRegistrationMode ? "Registration Complete!" : "Welcome, New Customer!"}
          </h2>
          <p className="text-text-secondary">
            {isRegistrationMode
              ? `${capturedPosesRef.current.length} poses captured. Choose a username.`
              : "Choose a username to complete your profile."}
          </p>
        </div>

        {isRegistrationMode && (
          <div className="mb-6 flex justify-center gap-2">
            {REGISTRATION_POSES.map((pose, idx) => (
              <div key={pose.id}
                className={`pose-dot-${idx} w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  capturedPosesRef.current[idx] ? "bg-success text-white" : "bg-bg-secondary"
                }`}>
                {capturedPosesRef.current[idx] ? "✓" : pose.emoji}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={registerNewUser} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-text-primary">Your Username</label>
              <button type="button" onClick={generateNewSuggestion}
                className="text-xs text-brand hover:opacity-75 flex items-center gap-1 transition-opacity">
                <RefreshCw className="w-3 h-3" /> New suggestion
              </button>
            </div>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-bg-secondary border-2 border-border focus:border-brand rounded-xl text-text-primary outline-none transition-all"
              style={{ fontSize: "16px" }} autoFocus disabled={registeringUser} minLength={3} maxLength={30} />
            <p className="text-xs text-text-tertiary mt-1">3–30 characters</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleTryAgain} disabled={registeringUser}
              className="flex-1 px-6 py-3 bg-bg-secondary hover:bg-bg-tertiary rounded-xl font-semibold transition-all disabled:opacity-50">
              Try Again
            </button>
            <button type="submit" disabled={!username.trim() || username.trim().length < 3 || registeringUser}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand to-secondary text-white font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {registeringUser
                ? <><Loader className="w-5 h-5 animate-spin" /><span>Creating…</span></>
                : <><span>Create Profile</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: MAIN INTERFACE
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Mode switcher */}
      {!isRegistrationMode && (status === "ready" || status === "capturing") && (
        <div className="bg-info/10 border border-info/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-info" />
              <div>
                <h4 className="text-sm font-semibold text-info">Want higher accuracy?</h4>
                <p className="text-xs text-text-secondary">Register with 5 face angles for 95–99% accuracy</p>
              </div>
            </div>
            <button onClick={switchToRegistrationMode}
              className="px-4 py-2 bg-info hover:bg-info/80 text-white rounded-lg text-sm font-semibold transition-all">
              Use 360° Scan
            </button>
          </div>
        </div>
      )}

      {/* Registration progress */}
      {isRegistrationMode && !showUsernamePrompt && (
        <div className="bg-bg-elevated rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">
              {status === "liveness" ? "Liveness Check" : "Face Registration"}
            </h3>
            <span className="text-sm font-semibold text-brand">
              {status === "liveness"
                ? `${livenessCheckIndex + 1}/${LIVENESS_CHECKS.length} checks`
                : `${currentPoseIndex + 1}/${REGISTRATION_POSES.length} poses`}
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            {(status === "liveness" ? LIVENESS_CHECKS : REGISTRATION_POSES).map((item, idx) => (
              <div key={item.id} className={`flex-1 h-2 rounded-full transition-all ${
                (status === "liveness" ? idx < livenessCheckIndex : idx < currentPoseIndex)
                  ? "bg-success"
                  : (status === "liveness" ? idx === livenessCheckIndex : idx === currentPoseIndex)
                  ? "bg-brand animate-pulse"
                  : "bg-bg-tertiary"
              }`} />
            ))}
          </div>

          <div className="text-center py-4">
            <div className="text-4xl mb-2">
              {status === "liveness"
                ? LIVENESS_CHECKS[livenessCheckIndex]?.emoji
                : REGISTRATION_POSES[currentPoseIndex]?.emoji}
            </div>
            <p className="text-lg font-semibold text-text-primary mb-1">
              {status === "liveness"
                ? LIVENESS_CHECKS[livenessCheckIndex]?.instruction
                : REGISTRATION_POSES[currentPoseIndex]?.instruction}
            </p>
            <p className="text-sm text-text-secondary">
              {status === "liveness"
                ? livenessDetected ? "Detected! ✓" : "Waiting…"
                : REGISTRATION_POSES[currentPoseIndex]?.detail}
            </p>
          </div>

          {/* Pose dots */}
          <div className="flex justify-center gap-2 mt-2">
            {REGISTRATION_POSES.map((pose, idx) => (
              <div key={pose.id}
                className={`pose-dot-${idx} w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  capturedPoses[idx] ? "bg-success text-white" : "bg-bg-secondary text-text-tertiary"
                }`}>
                {capturedPoses[idx] ? "✓" : pose.emoji}
              </div>
            ))}
          </div>

          {/* Head pose indicator */}
          {status === "ready" && faceDetected && (
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-tertiary">
              <span>Yaw: <span className={Math.abs(headPose.yaw) < 5 ? "text-success" : "text-warning"}>{headPose.yaw.toFixed(0)}°</span></span>
              <span>Pitch: <span className={Math.abs(headPose.pitch) < 5 ? "text-success" : "text-warning"}>{headPose.pitch.toFixed(0)}°</span></span>
            </div>
          )}
        </div>
      )}

      {/* Camera */}
      <div className="relative bg-bg-elevated rounded-3xl overflow-hidden border-2 border-border">
        <div className="relative aspect-[4/3] bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }} />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
            width={640} height={480} />

          {/* HUD badges */}
          {(status === "ready" || status === "capturing" || status === "processing" || status === "liveness") && (
            <>
              <div className="absolute top-4 right-4 z-10">
                <div className={`px-4 py-2 rounded-full backdrop-blur-xl flex items-center gap-2 transition-all ${
                  faceDetected
                    ? detectionIssue ? "bg-warning/20 border border-warning/30" : "bg-success/20 border border-success/30"
                    : "bg-error/20 border border-error/30"
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${faceDetected ? detectionIssue ? "bg-warning" : "bg-success" : "bg-error"}`} />
                  <span className={`text-sm font-medium ${faceDetected ? detectionIssue ? "text-warning" : "text-success" : "text-error"}`}>
                    {faceDetected ? detectionIssue || "Perfect!" : "No Face"}
                  </span>
                </div>
              </div>

              <div className="absolute top-4 left-4 z-10">
                <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full text-xs font-bold backdrop-blur-md">
                  ⚡ MediaPipe
                </div>
              </div>

              {attempts > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-3 py-1.5 bg-warning/20 border border-warning/50 rounded-full backdrop-blur-md flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-warning" />
                    <span className="text-xs font-bold text-warning">{attempts}/{MAX_ATTEMPTS}</span>
                  </div>
                </div>
              )}

              {/* Quality progress bar */}
              {faceDetected && goodFrames.current > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 z-10">
                  <div className="bg-black/50 backdrop-blur-xl rounded-full p-2">
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand to-success transition-all duration-300"
                        style={{ width: `${(Math.min(goodFrames.current, QUALITY_CONFIG.REQUIRED_FRAMES) / QUALITY_CONFIG.REQUIRED_FRAMES) * 100}%` }} />
                    </div>
                    <p className="text-xs text-white text-center mt-1">
                      {goodFrames.current}/{QUALITY_CONFIG.REQUIRED_FRAMES} quality frames
                    </p>
                  </div>
                </div>
              )}

              {/* Face oval guide */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 640 480">
                <ellipse cx="320" cy="240" rx="150" ry="180" fill="none"
                  stroke={faceDetected ? (detectionIssue ? "#f59e0b" : "#10b981") : "#ef4444"}
                  strokeWidth="2.5" strokeDasharray="10,5" opacity="0.6"
                  style={{ transition: "stroke 0.3s" }} />
              </svg>
            </>
          )}

          {/* Overlays */}
          {status === "initializing" && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4">
              <Loader className="w-12 h-12 text-brand animate-spin" />
              <p className="text-white text-lg font-semibold">{message}</p>
              <div className="w-64 h-2 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand to-secondary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/40 text-xs">Powered by MediaPipe FaceMesh</p>
            </div>
          )}
          {(status === "error") && (
            <div className="absolute inset-0 bg-error/20 backdrop-blur-sm flex flex-col items-center justify-center p-6">
              <XCircle className="w-16 h-16 text-error mb-4" />
              <p className="text-white text-center font-semibold">{message}</p>
            </div>
          )}
          {status === "success" && (
            <div className="absolute inset-0 bg-success/20 backdrop-blur-sm flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-success mb-4 animate-bounce" />
              <p className="text-white text-lg font-semibold">{message}</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="p-5 bg-bg-secondary border-t border-border flex items-start gap-3">
          <Camera className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary mb-1">{message}</p>
            <p className="text-xs text-text-tertiary">
              {status === "ready" && !isRegistrationMode && "Auto-captures when face quality is perfect"}
              {status === "ready" && isRegistrationMode && "Follow the pose instructions above"}
              {status === "capturing" && "Processing face landmarks…"}
              {status === "processing" && "Matching with database…"}
              {status === "liveness" && "Complete the liveness check above"}
            </p>
          </div>
        </div>
      </div>

      {/* Lighting help */}
      {showLightingHelp && (
        <div className="bg-warning/10 border-2 border-warning/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-warning mb-3">Having trouble?</h3>
              <ul className="space-y-1 mb-4 text-sm text-text-secondary">
                <li>• Face a window or bright lamp</li>
                <li>• Move 1–2 feet from the camera</li>
                <li>• Remove glasses, hats, or masks</li>
                <li>• Centre your face in the oval</li>
              </ul>
              <div className="flex gap-3">
                <button onClick={() => { setShowLightingHelp(false); lastDetectTime.current = Date.now(); noDetectWarnShown.current = false; }}
                  className="flex-1 px-4 py-2 bg-info hover:bg-info/80 text-white rounded-xl font-semibold transition-all">
                  I'm Ready
                </button>
                <button onClick={() => { stopCamera(); onFallback?.("username"); }}
                  className="flex-1 px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border-2 border-border rounded-xl font-semibold transition-all">
                  Use Username
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-info/10 border border-info/20 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-info mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {isRegistrationMode ? "Registration Tips" : "Tips for best results"}
        </h4>
        <ul className="text-xs text-text-secondary space-y-1">
          {isRegistrationMode ? (
            <>
              <li>• Follow each pose instruction — turn/tilt slowly</li>
              <li>• Wait for the checkmark before moving to the next</li>
              <li>• Keep good lighting throughout all 5 poses</li>
              <li>• Liveness check: blink naturally, then smile</li>
            </>
          ) : (
            <>
              <li>• Ensure good lighting — not too dark or bright</li>
              <li>• Remove glasses or hats if possible</li>
              <li>• Look directly at the camera and hold still</li>
              <li>• You have {MAX_ATTEMPTS} attempts before a 5-minute cooldown</li>
            </>
          )}
        </ul>
      </div>

      {/* Cancel / fallback */}
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 border-2 border-border hover:border-error/50 rounded-xl font-semibold text-text-secondary hover:text-error transition-all text-sm">
          Cancel
        </button>
        <button onClick={() => { stopCamera(); onFallback?.("username"); }}
          className="flex-1 py-3 border-2 border-border hover:border-brand rounded-xl font-semibold text-text-secondary hover:text-brand transition-all text-sm flex items-center justify-center gap-2">
          <Hash className="w-4 h-4" /> Use Username
        </button>
      </div>
    </div>
  );
};

export default FaceRecognitionMultiAngle;