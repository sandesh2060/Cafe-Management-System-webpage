// ================================================================
// FILE: frontend/src/modules/customer/pages/LoginPage.jsx
//
// GPS WATERFALL — in order of priority:
//   0. Non-secure context (HTTP)  → banner + manual entry
//   1. Permission denied           → clear error + fallback screen
//   2. Table cache (30 min)        → instant, skip GPS entirely
//   3. Pre-warm ≤ 20m AND fresh    → immediate processLocation()
//   4. Pre-warm 21–150m AND fresh  → seed into fresh collection,
//                                    use as guaranteed fallback
//   5. Fresh GPS readings          → collect up to 5, accept on ≤20m
//                                    or use best at timeout
//   6. All GPS attempts exhausted  → QR scanner (auto-open, silent)
//   7. QR fails                    → fallback selection screen
//
// GPS → QR GUARANTEE:
//   • Pre-warm reading (any accuracy ≤ 150m) is NEVER silently dropped.
//   • It is injected as the seed reading into getSmartLocation() so
//     the timeout handler always has at least one reading to use.
//   • Only a TRUE GPS failure (0 readings, no pre-warm, or accuracy
//     > 150m) opens the QR scanner.
//
// BUGS FIXED vs prior version:
//   ✅ Pre-warm 21–150m was silently discarded → now seeded into collection
//   ✅ `settled` flag set BEFORE clearWatch — no double-resolve race
//   ✅ Pre-warm stopped as soon as table is found — no battery leak
//   ✅ Pre-warm reading age checked — stale readings > 15s are ignored
//   ✅ Permission queried before watchPosition — instant denied detection
//   ✅ GeolocationPositionError codes decoded to human messages
//   ✅ HTTP non-secure origin: clear banner + routes to manual (not silent skip)
//   ✅ All timeouts / watchIds cleaned up on unmount
//   ✅ Back button cancels in-flight GPS immediately
// ================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Hash,
  Users,
  ChevronRight,
  Shield,
  Clock,
  Star,
  Loader,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Navigation,
  Fingerprint,
  User as UserIcon,
  Zap,
  Coffee,
  ArrowLeft,
  Lock,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import QRScannerView from "../components/QRScannerView";
import FaceRecognitionCapture from "../components/FaceRecognitionCapture";
import FingerprintCapture from "../components/FingerprintCapture";
import { tableAPI } from "../../../api/endpoints";
import { isGeolocationAvailable } from "../../../shared/utils/location";
import gsap from "gsap";

// ─────────────────────────────────────────────────────────────────
// TUNING CONSTANTS — single source of truth
// ─────────────────────────────────────────────────────────────────
const GPS_ACCEPT_ACCURACY_M   = 20;              // Resolve immediately if accuracy ≤ this
const GPS_FALLBACK_ACCURACY_M = 150;             // Bail to QR only if WORSE than this
const GPS_MAX_READINGS        = 5;               // Max readings before taking best
const GPS_TIMEOUT_MS          = 8_000;           // Hard wall-clock cutoff
const GPS_MAX_AGE_MS          = 2_000;           // Accept cached GPS reading up to 2s old
const GPS_PREWARM_MAX_AGE_MS  = 15_000;          // Ignore pre-warm reading older than 15s
const TABLE_CACHE_TTL_MS      = 30 * 60 * 1000; // 30-min table cache
const TABLE_CACHE_KEY         = "lastTable";

// ─────────────────────────────────────────────────────────────────
// SECURE CONTEXT DETECTION
// ─────────────────────────────────────────────────────────────────
const IS_SECURE_CONTEXT =
  window.isSecureContext === true ||
  window.location.protocol === "https:" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// ─────────────────────────────────────────────────────────────────
// CACHE HELPERS
// ─────────────────────────────────────────────────────────────────
const readTableCache = () => {
  try {
    const raw = sessionStorage.getItem(TABLE_CACHE_KEY);
    if (!raw) return null;
    const { table, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < TABLE_CACHE_TTL_MS) return table;
  } catch (_) {}
  return null;
};

const writeTableCache = (table) => {
  try {
    sessionStorage.setItem(
      TABLE_CACHE_KEY,
      JSON.stringify({ table, timestamp: Date.now() })
    );
  } catch (_) {}
};

const clearTableCache = () => {
  try { sessionStorage.removeItem(TABLE_CACHE_KEY); } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────
// GPS PERMISSION CHECK
// Returns: "granted" | "denied" | "prompt" | "unavailable" | "insecure"
// ─────────────────────────────────────────────────────────────────
const checkGpsPermission = async () => {
  if (!isGeolocationAvailable()) return "unavailable";
  if (!IS_SECURE_CONTEXT) return "insecure";
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch (_) {
    // Firefox throws on navigator.permissions — treat as prompt
    return "prompt";
  }
};

// ─────────────────────────────────────────────────────────────────
// HUMAN-READABLE GPS ERROR MESSAGES
// ─────────────────────────────────────────────────────────────────
const gpsErrorMessage = (err) => {
  if (!err) return "Unknown location error.";
  switch (err.code) {
    case 1:
      return "Location permission denied. Please allow location access in your browser settings, then try again.";
    case 2:
      return "Location unavailable. Please check your device GPS is enabled.";
    case 3:
      return "Location timed out. Please try again or use the QR scanner.";
    default:
      return `Location error: ${err.message || "Unknown error."}`;
  }
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();

  // ── Core UI state ──────────────────────────────────────────────
  const [mode, setMode]                               = useState("welcome");
  const [selectedMethod, setSelectedMethod]           = useState(null);
  const [loading, setLoading]                         = useState(false);
  const [error, setError]                             = useState("");

  // ── GPS / detection state ──────────────────────────────────────
  const [autoDetectionStatus, setAutoDetectionStatus] = useState("idle");
  const [detectedTable, setDetectedTable]             = useState(null);
  const [gpsReadingCount, setGpsReadingCount]         = useState(0);
  const [gpsAccuracyDisplay, setGpsAccuracyDisplay]   = useState(null);
  const [gpsStatusMessage, setGpsStatusMessage]       = useState("");

  // ── QR / table selection ───────────────────────────────────────
  const [showQRScanner, setShowQRScanner]             = useState(false);
  const [showTableSelection, setShowTableSelection]   = useState(false);
  const [nearbyTables, setNearbyTables]               = useState([]);

  // ── Manual / username inputs ───────────────────────────────────
  const [tableNumber, setTableNumber]                 = useState("");
  const [usernameInput, setUsernameInput]             = useState("");
  const [usernameError, setUsernameError]             = useState("");

  // ── GPS pre-warm refs ──────────────────────────────────────────
  const gpsWarmupWatchId  = useRef(null);
  const prewarmedLocation = useRef(null); // { latitude, longitude, accuracy, timestamp }
  const activeWatchId     = useRef(null); // The watchPosition during actual detection
  const activeTimeoutId   = useRef(null); // The 8s timeout during actual detection

  // ── Animation refs ─────────────────────────────────────────────
  const containerRef   = useRef(null);
  const autoDetectRef  = useRef(null);
  const logoRef        = useRef(null);
  const welcomeTextRef = useRef(null);
  const brandNameRef   = useRef(null);
  const taglineRef     = useRef(null);
  const customerBtnRef = useRef(null);
  const staffBtnRef    = useRef(null);
  const featuresRef    = useRef(null);

  // ============================================================
  // GPS PRE-WARM — starts on page mount, HTTPS only
  // Keeps the best (lowest accuracy value) reading seen.
  // Stopped automatically when component unmounts or table confirmed.
  // ============================================================
  useEffect(() => {
    if (!IS_SECURE_CONTEXT || !isGeolocationAvailable()) return;

    gpsWarmupWatchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const prev = prewarmedLocation.current;
        if (!prev || accuracy < prev.accuracy) {
          prewarmedLocation.current = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
          };
          console.log(`🌡️ Pre-warm GPS → ±${Math.round(accuracy)}m`);
        }
      },
      (err) => {
        // Silently ignore — pre-warm is best-effort
        console.debug("Pre-warm GPS error (non-fatal):", err.code);
      },
      { enableHighAccuracy: true, maximumAge: GPS_MAX_AGE_MS }
    );

    return () => {
      if (gpsWarmupWatchId.current !== null) {
        navigator.geolocation.clearWatch(gpsWarmupWatchId.current);
        gpsWarmupWatchId.current = null;
      }
    };
  }, []);

  // Stop pre-warm once we have a confirmed table (save battery)
  const stopPrewarm = useCallback(() => {
    if (gpsWarmupWatchId.current !== null) {
      navigator.geolocation.clearWatch(gpsWarmupWatchId.current);
      gpsWarmupWatchId.current = null;
      console.log("🛑 Pre-warm stopped (table confirmed)");
    }
  }, []);

  // ============================================================
  // GSAP welcome screen animations
  // ============================================================
  useEffect(() => {
    if (mode !== "welcome" || !logoRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(logoRef.current,        { opacity: 0, scale: 0.5, y: -50 }, { opacity: 1, scale: 1, y: 0, duration: 1 });
    tl.fromTo(welcomeTextRef.current, { opacity: 0, y: 30 },              { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
    tl.fromTo(brandNameRef.current,   { opacity: 0, y: 30 },              { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
    tl.fromTo(taglineRef.current,     { opacity: 0, y: 20 },              { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");
    tl.fromTo(customerBtnRef.current, { opacity: 0, x: -100 },            { opacity: 1, x: 0, duration: 0.7 }, "-=0.2");
    tl.fromTo(staffBtnRef.current,    { opacity: 0, x: 100 },             { opacity: 1, x: 0, duration: 0.7 }, "-=0.6");
    if (featuresRef.current?.children?.length) {
      tl.fromTo(
        featuresRef.current.children,
        { opacity: 0, y: 30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15 },
        "-=0.3"
      );
    }
  }, [mode]);

  // Cleanup active GPS watch + timeout on unmount
  useEffect(() => {
    return () => {
      if (activeWatchId.current !== null) {
        navigator.geolocation.clearWatch(activeWatchId.current);
        activeWatchId.current = null;
      }
      if (activeTimeoutId.current !== null) {
        clearTimeout(activeTimeoutId.current);
        activeTimeoutId.current = null;
      }
    };
  }, []);

  // ============================================================
  // SMART GPS COLLECTION
  //
  // @param {object|null} seedReading — pre-warm reading to inject as
  //   the first entry. This guarantees the timeout handler always has
  //   at least one reading to fall back to, even if the chip never
  //   fires a fresh position during the 8s window.
  //
  // Algorithm:
  //   1. Start with seedReading in the readings array (if provided)
  //   2. Accept immediately if any reading accuracy ≤ GPS_ACCEPT_ACCURACY_M
  //   3. Collect up to GPS_MAX_READINGS, then resolve with best
  //   4. After GPS_TIMEOUT_MS, resolve with best seen (seed counts!)
  //   5. Only reject (→ QR) if readings is STILL empty at timeout
  //      — which only happens when there is no pre-warm AND the chip
  //        fires nothing in 8s (true hardware/permission failure)
  //
  // BUG FIX: `settled` is set to true BEFORE clearWatch is called to
  // prevent any late callbacks firing after we've already resolved.
  // ============================================================
  const getSmartLocation = (seedReading = null) =>
    new Promise((resolve, reject) => {
      if (!isGeolocationAvailable()) {
        return reject({ code: -1, message: "Geolocation not supported on this device." });
      }

      // Seed the readings array with pre-warm if available.
      // This is the KEY fix: the timeout handler can never be "empty"
      // as long as we had any pre-warm reading at all.
      const readings = seedReading ? [{ ...seedReading }] : [];
      let settled = false;

      const finish = (reading, label) => {
        if (settled) return;
        settled = true; // Set FIRST — prevents double-resolve race
        if (activeWatchId.current !== null) {
          navigator.geolocation.clearWatch(activeWatchId.current);
          activeWatchId.current = null;
        }
        if (activeTimeoutId.current !== null) {
          clearTimeout(activeTimeoutId.current);
          activeTimeoutId.current = null;
        }
        console.log(`${label}: ±${Math.round(reading.accuracy)}m`);
        resolve(reading);
      };

      const fail = (err) => {
        if (settled) return;
        settled = true;
        if (activeWatchId.current !== null) {
          navigator.geolocation.clearWatch(activeWatchId.current);
          activeWatchId.current = null;
        }
        if (activeTimeoutId.current !== null) {
          clearTimeout(activeTimeoutId.current);
          activeTimeoutId.current = null;
        }
        reject(err);
      };

      // Show seed reading immediately in UI if present
      if (seedReading) {
        setGpsReadingCount(1);
        setGpsAccuracyDisplay(Math.round(seedReading.accuracy));
      }

      activeWatchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (settled) return; // Guard against late callbacks

          const reading = {
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy:  pos.coords.accuracy,
          };

          // Only add fresh readings (not the seed) to avoid duplicates
          readings.push(reading);

          // UI shows total count including seed, but count from index 1
          // so user sees progress beyond "1 reading" (the seed)
          const displayCount = readings.length;
          setGpsReadingCount(displayCount);
          setGpsAccuracyDisplay(Math.round(reading.accuracy));

          console.log(
            `📍 GPS reading ${displayCount}/${GPS_MAX_READINGS + (seedReading ? 1 : 0)}: ` +
            `±${Math.round(reading.accuracy)}m`
          );

          // Accept immediately — accuracy is excellent
          if (reading.accuracy <= GPS_ACCEPT_ACCURACY_M) {
            finish(reading, "⚡ Early accept");
            return;
          }

          // Collected enough readings → pick best
          const maxAllowed = GPS_MAX_READINGS + (seedReading ? 1 : 0);
          if (readings.length >= maxAllowed) {
            const best = [...readings].sort((a, b) => a.accuracy - b.accuracy)[0];
            finish(best, `✅ Best of ${readings.length}`);
          }
        },
        (err) => {
          // GPS error callback — but we may still have the seed or prior readings
          if (readings.length > 0) {
            const best = [...readings].sort((a, b) => a.accuracy - b.accuracy)[0];
            finish(best, `⚠️ GPS error ${err.code} — using best of ${readings.length}`);
          } else {
            // No readings at all — true failure
            fail(err);
          }
        },
        {
          enableHighAccuracy: true,
          timeout:    30_000, // Browser-level per-reading timeout (generous)
          maximumAge: GPS_MAX_AGE_MS,
        }
      );

      // ── Hard wall-clock timeout ──────────────────────────────────
      // If we have the seed OR any fresh readings → use best (never fail)
      // If readings is STILL empty → true GPS failure → fall to QR
      activeTimeoutId.current = setTimeout(() => {
        if (settled) return;
        if (readings.length > 0) {
          const best = [...readings].sort((a, b) => a.accuracy - b.accuracy)[0];
          finish(best, `⏱ Timeout — best of ${readings.length} (incl. seed)`);
        } else {
          // Genuine failure: no pre-warm seeded AND chip gave nothing in 8s
          fail({
            code: 3,
            message: "GPS got no readings within 8s. No pre-warm available.",
          });
        }
      }, GPS_TIMEOUT_MS);
    });

  // ============================================================
  // CORE TABLE MATCHING
  // Called from both pre-warm path and fresh GPS path.
  // On any failure → auto-open QR scanner silently.
  // ============================================================
  const processLocation = useCallback(async (locationData) => {
    console.log(`🔍 Matching table for location ±${Math.round(locationData.accuracy)}m`);
    setGpsStatusMessage(`GPS ±${Math.round(locationData.accuracy)}m — finding table...`);

    // GPS too inaccurate to be useful — bail to QR immediately
    if (locationData.accuracy > GPS_FALLBACK_ACCURACY_M) {
      console.warn(
        `⚠️ GPS accuracy ±${Math.round(locationData.accuracy)}m > limit ` +
        `${GPS_FALLBACK_ACCURACY_M}m → QR`
      );
      setAutoDetectionStatus("failed");
      setShowQRScanner(true);
      return;
    }

    try {
      const response = await tableAPI.matchLocation({
        latitude:  locationData.latitude,
        longitude: locationData.longitude,
        accuracy:  locationData.accuracy,
      });

      const result        = response?.data || response;
      const matchedTables = result?.matchedTables || result?.data?.matchedTables || [];

      if (!matchedTables?.length) {
        console.warn("No tables returned from API → QR");
        setAutoDetectionStatus("failed");
        setShowQRScanner(true);
        return;
      }

      // Filter: table must be within max(table.radius, gpsAccuracy)
      const tablesInRadius = matchedTables.filter(({ distance = 0, radius = 0.9144 }) => {
        const effectiveRadius = Math.max(radius, locationData.accuracy);
        const within = distance <= effectiveRadius;
        console.log(
          `  Table dist=${distance.toFixed(1)}m ` +
          `radius=${radius}m eff=${effectiveRadius.toFixed(1)}m → ${within ? "✅" : "❌"}`
        );
        return within;
      });

      console.log(`📍 ${matchedTables.length} nearby, ${tablesInRadius.length} within radius`);

      if (!tablesInRadius.length) {
        setAutoDetectionStatus("failed");
        setShowQRScanner(true);
        return;
      }

      if (tablesInRadius.length > 1) {
        setNearbyTables(tablesInRadius);
        setShowTableSelection(true);
        setAutoDetectionStatus("idle");
        return;
      }

      // ✅ Exactly one match
      const table = tablesInRadius[0];
      console.log(`🎯 Matched: Table ${table.number}`);
      writeTableCache(table);
      stopPrewarm();
      setDetectedTable(table);
      setAutoDetectionStatus("success");
      toast.success(`Table ${table.number} detected!`, { autoClose: 2000 });

    } catch (err) {
      console.error("❌ Table match API error:", err);
      setAutoDetectionStatus("failed");
      setShowQRScanner(true);
    }
  }, [stopPrewarm]);

  // ============================================================
  // HANDLE CUSTOMER LOGIN — main entry point
  //
  // GPS waterfall:
  //   0. Non-secure context   → manual entry (GPS impossible)
  //   1. Permission denied    → fallback selection screen
  //   2. GPS unavailable      → fallback selection screen
  //   3. Table cache (30 min) → instant success
  //   4. Pre-warm ≤ 20m fresh → immediate processLocation()
  //   5. Pre-warm 21–150m fresh → seed into getSmartLocation()
  //   6. Fresh GPS (up to 8s) → processLocation() with best reading
  //   7. Any GPS failure      → QR scanner (silent, automatic)
  // ============================================================
  const handleCustomerLogin = async () => {
    console.log("🚀 Starting customer login...");
    setMode("auto-detecting");
    setAutoDetectionStatus("detecting");
    setGpsReadingCount(0);
    setGpsAccuracyDisplay(null);
    setGpsStatusMessage("Starting GPS...");
    setError("");

    gsap.to(containerRef.current, {
      opacity: 0, y: -20, duration: 0.3,
      onComplete: () => {
        if (autoDetectRef.current) {
          gsap.fromTo(
            autoDetectRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
          );
        }
      },
    });

    // ── STEP 0: Secure context check ──────────────────────────────
    if (!IS_SECURE_CONTEXT) {
      console.warn("⚠️ Non-secure context (HTTP). GPS unavailable.");
      setAutoDetectionStatus("failed");
      toast.warn("GPS requires HTTPS. Using manual table entry.", { autoClose: 5000 });
      setSelectedMethod("manual");
      setMode("method-active");
      return;
    }

    // ── STEP 1: Permission check ───────────────────────────────────
    setGpsStatusMessage("Checking location permission...");
    const permission = await checkGpsPermission();
    console.log(`📋 GPS permission: ${permission}`);

    if (permission === "denied") {
      setAutoDetectionStatus("failed");
      setGpsStatusMessage("");
      toast.error(
        "Location permission denied. Please enable it in browser settings.",
        { autoClose: 6000 }
      );
      setMode("fallback-selection");
      return;
    }

    if (permission === "unavailable") {
      setAutoDetectionStatus("failed");
      toast.error("GPS not available on this device.");
      setMode("fallback-selection");
      return;
    }

    // ── STEP 2: Table cache ────────────────────────────────────────
    const cached = readTableCache();
    if (cached) {
      console.log(`⚡ Cache hit: Table ${cached.number}`);
      stopPrewarm();
      setDetectedTable(cached);
      setAutoDetectionStatus("success");
      toast.success(`Welcome back! Table ${cached.number}`, { autoClose: 2000 });
      return;
    }

    // ── STEP 3 & 4: Pre-warmed GPS evaluation ─────────────────────
    const prewarm    = prewarmedLocation.current;
    const prewarmAge = prewarm ? Date.now() - prewarm.timestamp : Infinity;
    const prewarmFresh = prewarm && prewarmAge < GPS_PREWARM_MAX_AGE_MS;

    if (prewarmFresh) {
      console.log(
        `🌡️ Pre-warm available: ±${Math.round(prewarm.accuracy)}m ` +
        `(age ${Math.round(prewarmAge / 1000)}s)`
      );

      if (prewarm.accuracy <= GPS_ACCEPT_ACCURACY_M) {
        // ── STEP 3: Excellent pre-warm — use immediately ───────────
        console.log("⚡ Pre-warm ≤20m — using immediately");
        setGpsReadingCount(1);
        setGpsAccuracyDisplay(Math.round(prewarm.accuracy));
        setGpsStatusMessage(`GPS lock ±${Math.round(prewarm.accuracy)}m — finding table...`);
        await processLocation(prewarm);
        return;
      }

      // ── STEP 4: Pre-warm 21–150m — seed into collection ──────────
      // The pre-warm reading is good enough to be a fallback but not
      // good enough to use directly. We inject it as a seed so that
      // getSmartLocation's timeout handler will never see an empty
      // readings array. The best reading (seed vs fresh) wins.
      if (prewarm.accuracy <= GPS_FALLBACK_ACCURACY_M) {
        console.log(
          `🌱 Pre-warm ±${Math.round(prewarm.accuracy)}m seeded — ` +
          `continuing fresh collection for better accuracy`
        );
        setGpsStatusMessage(
          `GPS signal ±${Math.round(prewarm.accuracy)}m — improving...`
        );
        // Fall through to Step 5 with the seed
      } else {
        // Pre-warm exists but accuracy > 150m — too poor to even seed.
        // Don't seed; fresh collection must succeed on its own.
        console.warn(
          `⚠️ Pre-warm ±${Math.round(prewarm.accuracy)}m > ` +
          `${GPS_FALLBACK_ACCURACY_M}m limit — not seeding`
        );
      }
    }

    // ── STEP 5: Fresh GPS collection ───────────────────────────────
    // Determine the seed: use prewarm only if fresh AND within fallback limit
    const seed =
      prewarmFresh && prewarm.accuracy <= GPS_FALLBACK_ACCURACY_M
        ? prewarm
        : null;

    if (seed) {
      setGpsStatusMessage(
        `GPS signal ±${Math.round(seed.accuracy)}m — acquiring better fix...`
      );
    } else {
      setGpsStatusMessage("Acquiring GPS signal...");
    }

    try {
      console.log(
        "📍 Collecting fresh GPS readings" +
        (seed ? ` (seeded with ±${Math.round(seed.accuracy)}m pre-warm)` : "") +
        "..."
      );
      const locationData = await getSmartLocation(seed);
      await processLocation(locationData);
    } catch (err) {
      // ── STEP 6: GPS genuinely failed — open QR silently ──────────
      console.error("❌ GPS collection failed:", err);

      if (err.code === 1) {
        // PERMISSION_DENIED — user denied mid-flow
        const msg = gpsErrorMessage(err);
        toast.error(msg, { autoClose: 8000 });
        setAutoDetectionStatus("failed");
        setMode("fallback-selection");
      } else {
        // POSITION_UNAVAILABLE, TIMEOUT, or hardware failure
        // Don't show an error toast — just silently open QR scanner.
        // The user already sees the detecting screen; QR opens naturally.
        console.log("📷 Falling to QR scanner (GPS exhausted)");
        setAutoDetectionStatus("failed");
        setShowQRScanner(true);
      }
    }
  };

  // ============================================================
  // LOGIN SUCCESS
  // ============================================================
  const handleLoginSuccess = (customerData) => {
    console.log("✅ Login success:", customerData);
    toast.success("Welcome! Redirecting to menu...", { autoClose: 1500 });
    localStorage.setItem(
      "customerSession",
      JSON.stringify({
        customerId:   customerData._id || customerData.customerId,
        customerName: customerData.displayName || customerData.username || customerData.customerName,
        tableId:      detectedTable?._id || detectedTable?.id,
        tableNumber:  detectedTable?.number,
        sessionId:    customerData.sessionId,
        loginMethod:  "face",
        timestamp:    new Date().toISOString(),
      })
    );
    setTimeout(() => {
      navigate("/customer/menu", {
        state: {
          customer:    customerData,
          tableId:     detectedTable?._id || detectedTable?.id,
          tableNumber: detectedTable?.number,
        },
      });
    }, 500);
  };

  // Face recognition failed → auto dual auth
  const handleFallback = () => {
    console.log("🔀 Face failed → dual auth");
    setSelectedMethod("dual");
    setMode("method-active");
  };

  // ============================================================
  // QR SCAN HANDLER
  // ============================================================
  const handleQRScan = async (data) => {
    try {
      setLoading(true);
      setError("");
      console.log("📸 QR scanned:", data);

      let tableId;
      try {
        tableId = JSON.parse(data).tableId;
      } catch {
        try {
          tableId = new URLSearchParams(new URL(data).search).get("tableId");
        } catch {
          throw new Error("Invalid QR code format");
        }
      }

      if (!tableId) throw new Error("Invalid QR code: missing table ID");

      const response = await tableAPI.getById(tableId);
      const table = response?.data?.table || response?.data?.data?.table || response?.table;
      if (!table) throw new Error("Table not found");

      toast.success(`Table ${table.number} verified!`, { autoClose: 2000 });
      writeTableCache(table);
      stopPrewarm();
      setDetectedTable(table);
      setShowQRScanner(false);
      setMode("auto-detecting");
      setAutoDetectionStatus("success");
    } catch (err) {
      console.error("❌ QR error:", err);
      setShowQRScanner(false);
      setError(err.response?.data?.message || err.message || "Invalid QR code");
      toast.error("Invalid QR Code");
      setMode("fallback-selection");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // MANUAL TABLE ENTRY
  // ============================================================
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim()) { toast.error("Please enter a table number"); return; }
    try {
      setLoading(true);
      setError("");
      const response = await tableAPI.getByNumber(tableNumber.trim());
      const data  = response?.data || response;
      const table = data?.data?.table || data?.table;
      if (!table) throw new Error("Table not found");
      toast.success(`Table ${table.number} found!`, { autoClose: 2000 });
      writeTableCache(table);
      stopPrewarm();
      setDetectedTable(table);
      setMode("auto-detecting");
      setAutoDetectionStatus("success");
    } catch (err) {
      setError(`Table "${tableNumber}" not found. Please check the number.`);
      toast.error("Table not found");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // USERNAME SUBMIT (dual-auth screen)
  // ============================================================
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) { setUsernameError("Please enter your username"); return; }
    setLoading(true);
    setUsernameError("");
    try {
      navigate("/customer/username", {
        state: {
          tableId:         detectedTable._id || detectedTable.id,
          tableNumber:     detectedTable.number,
          prefillUsername: usernameInput.trim(),
          method:          "username",
        },
      });
    } catch (err) {
      setUsernameError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleTableSelection = (table) => {
    writeTableCache(table);
    stopPrewarm();
    setDetectedTable(table);
    setShowTableSelection(false);
    setMode("auto-detecting");
    setAutoDetectionStatus("success");
    toast.success(`Table ${table.number} selected!`, { autoClose: 2000 });
  };

  const handleStaffLogin = () => navigate("/staff/login");

  const handleUsernameMethod = () => {
    if (!detectedTable) { toast.error("Please select a table first"); return; }
    navigate("/customer/username", {
      state: {
        tableId:     detectedTable._id || detectedTable.id,
        tableNumber: detectedTable.number,
        method:      "username",
      },
    });
  };

  const handleBackToWelcome = () => {
    // Cancel any in-flight GPS immediately
    if (activeWatchId.current !== null) {
      navigator.geolocation.clearWatch(activeWatchId.current);
      activeWatchId.current = null;
    }
    if (activeTimeoutId.current !== null) {
      clearTimeout(activeTimeoutId.current);
      activeTimeoutId.current = null;
    }
    setMode("welcome");
    setSelectedMethod(null);
    setDetectedTable(null);
    setAutoDetectionStatus("idle");
    setGpsReadingCount(0);
    setGpsAccuracyDisplay(null);
    setGpsStatusMessage("");
    setError("");
    setUsernameInput("");
    setUsernameError("");
    setShowTableSelection(false);
    setNearbyTables([]);
  };

  // ============================================================
  // FALLBACK METHODS CONFIG
  // ============================================================
  const fallbackMethods = [
    {
      id:          "qr",
      title:       "Scan QR Code",
      description: "Quick table verification",
      icon:        QrCode,
      gradient:    "from-amber-600 to-orange-600",
      available:   IS_SECURE_CONTEXT,
      action:      () => { setSelectedMethod("qr"); setShowQRScanner(true); },
    },
    {
      id:          "manual",
      title:       "Enter Table Number",
      description: "Manual table selection",
      icon:        Hash,
      gradient:    "from-purple-600 to-pink-600",
      available:   true,
      action:      () => { setSelectedMethod("manual"); setMode("method-active"); },
    },
    {
      id:          "fingerprint",
      title:       "Fingerprint",
      description: "Biometric authentication",
      icon:        Fingerprint,
      gradient:    "from-emerald-600 to-teal-600",
      available:   IS_SECURE_CONTEXT && typeof window !== "undefined" && !!window.PublicKeyCredential,
      action:      () => {
        if (detectedTable) { setSelectedMethod("fingerprint"); setMode("method-active"); }
        else toast.warning("Please select a table first (QR or Manual)");
      },
    },
    {
      id:          "username",
      title:       "Enter Username",
      description: "Traditional login",
      icon:        UserIcon,
      gradient:    "from-red-600 to-rose-600",
      available:   true,
      action:      () => {
        if (detectedTable) handleUsernameMethod();
        else toast.warning("Please select a table first (QR or Manual)");
      },
    },
  ];

  // ── Distance helpers ─────────────────────────────────────────
  const getDistanceColor = (d) =>
    d < 2  ? "text-emerald-700 bg-emerald-50 border-emerald-300"
    : d < 5  ? "text-amber-700 bg-amber-50 border-amber-300"
    :          "text-orange-700 bg-orange-50 border-orange-300";

  const getDistanceLabel = (d) =>
    d < 2 ? "Very Close" : d < 5 ? "Nearby" : "Medium Distance";

  // ============================================================
  // TABLE SELECTION MODAL
  // ============================================================
  const TableSelectionModal = () => {
    const modalRef      = useRef(null);
    const headerRef     = useRef(null);
    const tableCardsRef = useRef(null);
    const buttonRef     = useRef(null);

    useEffect(() => {
      if (!showTableSelection || !modalRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(modalRef.current,                      { opacity: 0 },               { opacity: 1, duration: 0.3 });
      tl.fromTo(headerRef.current,                     { y: -80, opacity: 0 },       { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");
      tl.fromTo(tableCardsRef.current?.children || [], { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.12 }, "-=0.3");
      tl.fromTo(buttonRef.current,                     { y: 20, opacity: 0 },        { y: 0, opacity: 1, duration: 0.4 }, "-=0.2");
    }, [showTableSelection]);

    if (!showTableSelection) return null;

    return (
      <div
        ref={modalRef}
        className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      >
        <div className="bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <div
            ref={headerRef}
            className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-8 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTEydjEyaDEyVjMwem0wLTEyaC0xMlYzMGgxMlYxOHoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl">
                <Navigation className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Select Your Table</h2>
                <p className="text-white/90 text-base mt-1">
                  {nearbyTables.length} {nearbyTables.length === 1 ? "table" : "tables"} detected nearby
                </p>
              </div>
            </div>
          </div>

          <div ref={tableCardsRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {[...nearbyTables]
              .sort((a, b) => (a.distance || 0) - (b.distance || 0))
              .map((table, index) => (
                <button
                  key={table._id}
                  onClick={() => handleTableSelection(table)}
                  className="w-full group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <span className="text-4xl font-bold text-white">{table.number}</span>
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Star className="w-4 h-4 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">Table {table.number}</h3>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                              Closest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">Seats {table.capacity}</span>
                        </div>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl border-2 ${getDistanceColor(table.distance || 0)} font-bold text-center flex-shrink-0`}>
                        <div className="text-xl leading-none mb-1">
                          {table.distance != null ? table.distance.toFixed(1) : "0.0"}m
                        </div>
                        <div className="text-xs opacity-75">{getDistanceLabel(table.distance || 0)}</div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <div ref={buttonRef} className="p-6 border-t-2 border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                setShowTableSelection(false);
                setNearbyTables([]);
                setMode("fallback-selection");
              }}
              className="w-full py-4 bg-white border-2 border-gray-300 rounded-3xl hover:bg-gray-50 hover:border-orange-400 hover:shadow-xl transition-all font-bold text-gray-700 hover:text-orange-600 text-lg active:scale-95"
            >
              Use Different Method
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER — mode routing
  // ============================================================

  if (showQRScanner) {
    return (
      <QRScannerView
        onScan={handleQRScan}
        onClose={() => {
          setShowQRScanner(false);
          setSelectedMethod(null);
          setMode("fallback-selection");
        }}
        loading={loading}
      />
    );
  }

  // ── Auto-detecting / face recognition ─────────────────────────
  if (mode === "auto-detecting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div ref={autoDetectRef} className="w-full max-w-4xl">

          {autoDetectionStatus === "success" && detectedTable ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-2xl">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0">
                    <span className="text-3xl font-bold text-white">{detectedTable.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gray-900 truncate">Table {detectedTable.number}</h2>
                      <CheckCircle className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                    </div>
                    <p className="text-gray-600 text-lg">Recognizing your face...</p>
                  </div>
                </div>
              </div>

              <FaceRecognitionCapture
                tableData={{
                  tableId:     detectedTable._id || detectedTable.id,
                  tableNumber: detectedTable.number,
                  method:      "location",
                }}
                onSuccess={handleLoginSuccess}
                onCancel={handleBackToWelcome}
                onFallback={handleFallback}
              />
            </div>
          ) : (
            // GPS in progress — spinner with live feedback
            <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border-2 border-amber-100">
              <div className="inline-block relative mb-8">
                <div className="absolute inset-0 rounded-full blur-3xl bg-amber-200 animate-pulse" />
                <div className="relative p-10 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-amber-200">
                  <MapPin className="w-20 h-20 text-amber-600" style={{ animation: "bounce 1.5s infinite" }} />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">Detecting Your Table...</h2>
              <p className="text-gray-500 mb-6">{gpsStatusMessage || "Acquiring GPS signal..."}</p>

              {gpsReadingCount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-center gap-2 mb-2">
                    {Array.from({ length: GPS_MAX_READINGS }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          i < gpsReadingCount ? "bg-amber-500 scale-125" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {gpsAccuracyDisplay != null && (
                    <p className="text-amber-600 text-sm font-semibold">
                      Signal accuracy: ±{gpsAccuracyDisplay}m
                      {gpsAccuracyDisplay <= 20
                        ? " — Excellent ✨"
                        : gpsAccuracyDisplay <= 50
                        ? " — Good"
                        : gpsAccuracyDisplay <= 100
                        ? " — Fair (indoor)"
                        : " — Improving..."}
                    </p>
                  )}
                </div>
              )}

              <p className="text-gray-400 text-sm mt-4">
                GPS is primary — QR scanner opens automatically if needed
              </p>

              <button
                onClick={handleBackToWelcome}
                className="mt-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
        <TableSelectionModal />
      </div>
    );
  }

  // ── Dual auth (face fallback) ──────────────────────────────────
  if (mode === "method-active" && selectedMethod === "dual" && detectedTable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <button
            onClick={handleBackToWelcome}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>

          <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-xl mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-2xl font-bold text-white">{detectedTable.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 truncate">Table {detectedTable.number}</h2>
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                </div>
                <p className="text-gray-500 text-sm">Verify your identity to continue</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleUsernameSubmit} className="bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter Username</h2>
              <p className="text-gray-500 text-sm mb-6">Login with your existing account</p>
              <div className="relative mb-4">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => { setUsernameInput(e.target.value); setUsernameError(""); }}
                  placeholder="Your username"
                  autoFocus
                  className="w-full pl-12 pr-5 py-4 bg-amber-50 border-2 border-amber-200 focus:border-amber-500 rounded-2xl text-gray-900 text-lg outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              {usernameError && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{usernameError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !usernameInput.trim()}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading
                  ? <><Loader className="w-5 h-5 animate-spin" /> Logging in…</>
                  : <>Login <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

            <FingerprintCapture
              tableData={{
                tableId:     detectedTable._id || detectedTable.id,
                tableNumber: detectedTable.number,
                method:      "fingerprint",
              }}
              onSuccess={handleLoginSuccess}
              onCancel={handleBackToWelcome}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Manual table entry ─────────────────────────────────────────
  if (mode === "method-active" && selectedMethod === "manual") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={handleBackToWelcome}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>

          <form onSubmit={handleManualSubmit} className="bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-2xl">
            {!IS_SECURE_CONTEXT && (
              <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-800 font-bold text-sm">HTTPS Required for GPS &amp; QR</p>
                  <p className="text-orange-700 text-xs mt-1 leading-relaxed">
                    GPS and QR scanner only work on HTTPS. Ask your admin to enable SSL, or run Vite with{" "}
                    <code className="bg-orange-100 px-1 rounded font-mono">--https</code>.
                    Manual entry works fine in the meantime.
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Enter Table Number</h2>
            <label className="block mb-6">
              <span className="text-sm font-bold text-gray-700 mb-3 block">Table Number</span>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => { setTableNumber(e.target.value); setError(""); }}
                  placeholder="Enter your table number"
                  className="w-full pl-14 pr-5 py-4 bg-amber-50 border-2 border-amber-200 focus:border-amber-500 rounded-2xl text-gray-900 text-lg outline-none transition-all placeholder:text-gray-400"
                  autoFocus
                />
              </div>
            </label>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !tableNumber.trim()}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading
                ? <><Loader className="w-6 h-6 animate-spin" />Verifying...</>
                : <>Continue <ArrowRight className="w-6 h-6" /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Standalone fingerprint ─────────────────────────────────────
  if (mode === "method-active" && selectedMethod === "fingerprint" && detectedTable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <button
            onClick={handleBackToWelcome}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <FingerprintCapture
            tableData={{
              tableId:     detectedTable._id || detectedTable.id,
              tableNumber: detectedTable.number,
              method:      "fingerprint",
            }}
            onSuccess={handleLoginSuccess}
            onCancel={handleBackToWelcome}
          />
        </div>
      </div>
    );
  }

  // ── Fallback selection ─────────────────────────────────────────
  if (mode === "fallback-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <button
            onClick={handleBackToWelcome}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>

          <div className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-amber-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 text-center">Choose Login Method</h2>
            <p className="text-gray-600 text-center mb-8 text-lg">
              GPS unavailable — select an alternative
            </p>

            {!IS_SECURE_CONTEXT && (
              <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl flex items-center gap-3">
                <Lock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <p className="text-orange-800 text-sm font-medium">
                  Running on HTTP — GPS &amp; QR scanner require HTTPS.
                  Only <strong>Manual Entry</strong> and <strong>Username</strong> are available.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {fallbackMethods.map((method) => {
                const Icon     = method.icon;
                const disabled = method.available === false;
                return (
                  <button
                    key={method.id}
                    onClick={method.action}
                    disabled={disabled}
                    className={`group relative rounded-2xl p-6 border-2 text-left transition-all ${
                      disabled
                        ? "bg-gray-50 border-gray-200 opacity-40 cursor-not-allowed"
                        : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform ${
                        !disabled ? "group-hover:scale-110" : ""
                      }`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{method.description}</p>
                    {disabled && (
                      <div className="absolute top-4 right-4 px-2 py-1 bg-gray-200 text-gray-500 text-xs font-bold rounded-lg">
                        Needs HTTPS
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // WELCOME SCREEN
  // ============================================================
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dszy3sf5c/image/upload/v1771077596/friends_brc5cy.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      </div>

      <div ref={containerRef} className="relative w-full max-w-md z-10">
        {!IS_SECURE_CONTEXT && (
          <div className="mb-4 p-3 bg-orange-500/90 backdrop-blur-sm rounded-2xl border border-orange-400 flex items-center gap-3">
            <Lock className="w-5 h-5 text-white flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">HTTP — GPS &amp; QR unavailable</p>
              <p className="text-white/80 text-xs mt-0.5">
                Run with <code className="bg-orange-600/50 px-1 rounded">vite --https</code> to enable GPS
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="mb-5 flex justify-center">
            <img
              ref={logoRef}
              src="https://res.cloudinary.com/dszy3sf5c/image/upload/v1771076878/kausi_chiya_logo_q8qult.png"
              alt="कौसी चिया Logo"
              className="w-56 h-56 object-contain"
            />
          </div>
          <h1 ref={welcomeTextRef} className="text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
            स्वागत छ
          </h1>
          <h2 ref={brandNameRef} className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
              कौसी चिया
            </span>
          </h2>
          <p ref={taglineRef} className="text-gray-200 text-lg font-medium drop-shadow-md">
            Fast, Secure &amp; Contactless
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            ref={customerBtnRef}
            onClick={handleCustomerLogin}
            className="w-full group relative overflow-hidden shadow-2xl hover:shadow-orange-500/50 transition-all"
          >
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 p-[3px] rounded-3xl">
              <div className="bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-[22px] p-7 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-bold text-gray-900 text-2xl mb-1">Customer Login</h3>
                    <p className="text-gray-600 font-medium text-sm">
                      {IS_SECURE_CONTEXT
                        ? "GPS auto-detects your table • Face recognition"
                        : "Enter table number • Face recognition"}
                    </p>
                  </div>
                  <ChevronRight className="w-7 h-7 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            </div>
          </button>

          <button
            ref={staffBtnRef}
            onClick={handleStaffLogin}
            className="w-full group relative overflow-hidden shadow-2xl hover:shadow-slate-500/50 transition-all"
          >
            <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-[3px] rounded-3xl">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[22px] p-7 hover:from-slate-700 hover:to-slate-800 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-bold text-white text-2xl mb-1">Staff Login</h3>
                    <p className="text-slate-300 font-medium text-sm">for restaurant owners</p>
                  </div>
                  <ChevronRight className="w-7 h-7 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            </div>
          </button>
        </div>

        <div ref={featuresRef} className="grid grid-cols-3 mt-20 gap-4">
          {[
            { icon: Clock,  text: "Fast Service", gradient: "from-orange-500 to-orange-600" },
            { icon: Star,   text: "Top Rated",    gradient: "from-emerald-500 to-emerald-600" },
            { icon: Coffee, text: "Fresh Tea",    gradient: "from-red-500 to-red-600" },
          ].map((f, idx) => (
            <div
              key={idx}
              className="text-center bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-white/50 hover:border-orange-300 hover:shadow-2xl transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-800 font-bold">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      <TableSelectionModal />
    </div>
  );
};

export default LoginPage;