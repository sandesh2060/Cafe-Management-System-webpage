// File: frontend/src/modules/customer/components/LocationLogin.jsx
// 🌍 LOCATION-BASED LOGIN WITH SMART TABLE DETECTION
//
// ✅ FIX: When tables show identical distances (0.0m), GPS coordinates in the
//    database were captured from the same position. Added:
//    1. detectIdenticalCoords() — detects when ≥2 tables have same distance
//    2. QR code nudge shown prominently when GPS can't distinguish tables
//    3. Clear explanation so user understands WHY they need to select manually

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Loader, CheckCircle, XCircle, AlertTriangle,
  Navigation, Target, QrCode, Star, Users, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../shared/context/ThemeContext';
import axios from 'axios';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true when two or more tables have indistinguishable GPS distances.
 * This happens when their stored coordinates are identical (captured from the
 * same physical position during setup).
 */
const detectIdenticalCoords = (tables) => {
  if (!tables || tables.length < 2) return false;
  const d0 = tables[0].distance;
  // If the top two distances are within 0.05m of each other → identical coords
  return Math.abs(tables[1].distance - d0) < 0.05;
};

const distanceLabel = (d) => {
  if (d < 0.1) return { text: 'Same location', color: 'text-amber-500' };
  if (d < 2)   return { text: 'Very Close',    color: 'text-emerald-500' };
  if (d < 5)   return { text: 'Close',         color: 'text-yellow-500' };
  return        { text: `${d.toFixed(1)}m`,    color: 'text-gray-400' };
};

// ─── component ──────────────────────────────────────────────────────────────

const LocationLogin = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [locationStatus,   setLocationStatus]   = useState('idle');
  const [location,         setLocation]         = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [error,            setError]            = useState(null);
  const [detectedTable,    setDetectedTable]    = useState(null);
  const [nearbyTables,     setNearbyTables]     = useState([]);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [detectionMethod,  setDetectionMethod]  = useState(null);
  const [gpsAmbiguous,     setGpsAmbiguous]     = useState(false); // ✅ NEW

  useEffect(() => { requestLocation(); }, []);

  // ── location ──────────────────────────────────────────────────────────────

  const requestLocation = async () => {
    try {
      setLocationStatus('requesting');
      setError(null);
      setGpsAmbiguous(false);

      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy:  position.coords.accuracy,
          };
          setLocation(locationData);
          await validateLocation(locationData);
        },
        handleLocationError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (err) {
      setLocationStatus('error');
      setError(err.message);
      toast.error(err.message);
    }
  };

  const validateLocation = async (locationData) => {
    try {
      setLocationStatus('validating');

      const response = await axios.post('/api/zones/validate-location', {
        latitude:  locationData.latitude,
        longitude: locationData.longitude,
      });

      if (response.data.success && response.data.data?.isValid) {
        setValidationResult(response.data.data);
        toast.success(`✅ Welcome! You're in ${response.data.data.primaryZone.name}`, {
          theme: dark ? 'dark' : 'light', autoClose: 2000,
        });
        await detectTable(locationData);
      } else {
        setLocationStatus('error');
        setError(response.data.message || 'You are not in the cafe zone');
        toast.error('❌ You are outside the cafe zone');
      }
    } catch (err) {
      setLocationStatus('error');
      setError('Failed to validate location. Please try again.');
      toast.error('Failed to validate location');
    }
  };

  // ── table detection ────────────────────────────────────────────────────────

  const detectTable = async (locationData) => {
    try {
      setLocationStatus('detecting_table');

      const response = await axios.post('/api/tables/detect', {
        latitude:  locationData.latitude,
        longitude: locationData.longitude,
      });

      if (response.data.needsSelection) {
        const tables = response.data.tables || [];

        // ✅ FIX: detect identical stored coordinates
        const identical = detectIdenticalCoords(tables);
        setGpsAmbiguous(identical);
        setNearbyTables(tables);
        setShowTableSelection(true);
        setLocationStatus('table_selection');
        setDetectionMethod('ambiguous');

        if (identical) {
          toast.info('📍 Tables are too close to auto-detect. Please select yours.', {
            theme: dark ? 'dark' : 'light',
          });
        } else {
          toast.info('📍 Multiple tables nearby. Please select yours.', {
            theme: dark ? 'dark' : 'light',
          });
        }
      } else {
        const { table, detection } = response.data;
        setDetectedTable(table);
        setDetectionMethod(detection.method);
        setLocationStatus('table_detected');

        if (detection.confidence === 'high') {
          toast.success(`✅ Table ${table.tableNumber} detected!`, { theme: dark ? 'dark' : 'light' });
          setTimeout(() => proceedToUsernamePrompt(table), 1500);
        } else {
          toast.warning(
            `⚠️ Table ${table.tableNumber} detected (${detection.distance}m). Please confirm.`,
            { theme: dark ? 'dark' : 'light' }
          );
        }
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setLocationStatus('error');
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        await showNearbyTablesManually(locationData);
      }
    }
  };

  const showNearbyTablesManually = async (locationData) => {
    try {
      const response = await axios.get('/api/tables/nearby', {
        params: { latitude: locationData.latitude, longitude: locationData.longitude, radius: 20 },
      });

      if (!response.data.tables?.length) {
        setLocationStatus('error');
        setError('No tables found nearby. Please scan QR code or move closer.');
        return;
      }

      const tables = response.data.tables;
      const identical = detectIdenticalCoords(tables);
      setGpsAmbiguous(identical);
      setNearbyTables(tables);
      setShowTableSelection(true);
      setLocationStatus('table_selection');
      toast.info('📍 Select your table from the list', { theme: dark ? 'dark' : 'light' });
    } catch {
      setLocationStatus('error');
      setError('Failed to find nearby tables');
    }
  };

  // ── actions ───────────────────────────────────────────────────────────────

  const handleTableSelection = (table) => {
    setDetectedTable(table);
    setShowTableSelection(false);
    setLocationStatus('table_detected');
    toast.success(`✅ Table ${table.tableNumber} selected!`, { theme: dark ? 'dark' : 'light' });
    setTimeout(() => proceedToUsernamePrompt(table), 800);
  };

  const proceedToUsernamePrompt = (table) => {
    navigate('/customer/username-prompt', {
      state: {
        location, table,
        zone:            validationResult?.primaryZone,
        method:          'location',
        detectionMethod,
      },
    });
  };

  const handleLocationError = (err) => {
    setLocationStatus('error');
    const msgs = {
      1: 'Location permission denied. Please enable location access.',
      2: 'Location unavailable. Please check your device settings.',
      3: 'Location request timed out. Please try again.',
    };
    const msg = msgs[err.code] || 'Unknown location error';
    setError(msg);
    toast.error(msg, { theme: dark ? 'dark' : 'light' });
  };

  // ── status helpers ─────────────────────────────────────────────────────────

  const StatusIcon = () => {
    const base = 'w-16 h-16';
    switch (locationStatus) {
      case 'requesting':      return <Loader      className={`${base} text-blue-500 animate-spin`} />;
      case 'validating':      return <Loader      className={`${base} text-emerald-500 animate-spin`} />;
      case 'detecting_table': return <Target      className={`${base} text-purple-500 animate-pulse`} />;
      case 'table_detected':  return <CheckCircle className={`${base} text-green-500`} />;
      case 'table_selection': return <MapPin      className={`${base} text-orange-500`} />;
      case 'error':           return <XCircle     className={`${base} text-red-500`} />;
      default:                return <MapPin      className={`${base} text-emerald-500`} />;
    }
  };

  const statusMessage = {
    requesting:      'Requesting your location…',
    validating:      'Validating cafe zone…',
    detecting_table: 'Detecting nearest table…',
    table_detected:  `Table ${detectedTable?.tableNumber} detected!`,
    table_selection: 'Select Your Table',
    error:           error || 'Location check failed',
  }[locationStatus] ?? 'Ready to check your location';

  const statusColor = {
    requesting:      'text-blue-600',
    validating:      'text-emerald-600',
    detecting_table: 'text-purple-600',
    table_detected:  'text-green-600',
    table_selection: 'text-orange-600',
    error:           'text-red-600',
  }[locationStatus] ?? 'text-gray-600';

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      dark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50'
    }`}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float ${
          dark ? 'bg-emerald-500/10' : 'bg-emerald-200/30'
        }`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float-delayed ${
          dark ? 'bg-teal-500/10' : 'bg-teal-200/30'
        }`} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-8 ${
          dark
            ? 'bg-gray-800/90 border-gray-700'
            : 'bg-white/90 border-emerald-100/50'
        }`}>

          {/* Icon */}
          <div className="flex justify-center mb-6"><StatusIcon /></div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              {locationStatus === 'table_selection' ? 'Select Your Table' : 'Location Check'}
            </span>
          </h1>

          {/* Status */}
          <p className={`text-center mb-6 font-medium ${statusColor}`}>{statusMessage}</p>

          {/* ─── TABLE SELECTION ─────────────────────────────────────────── */}
          {showTableSelection && nearbyTables.length > 0 && (
            <div className="mb-6 space-y-3">

              {/* ✅ NEW: GPS limitation banner when coordinates are identical */}
              {gpsAmbiguous ? (
                <div className={`p-4 rounded-2xl border-2 ${
                  dark
                    ? 'bg-amber-900/20 border-amber-700/50'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      dark ? 'text-amber-400' : 'text-amber-600'
                    }`} />
                    <div>
                      <p className={`text-sm font-semibold ${
                        dark ? 'text-amber-300' : 'text-amber-700'
                      }`}>
                        Tables are too close for GPS
                      </p>
                      <p className={`text-xs mt-1 ${
                        dark ? 'text-amber-400/80' : 'text-amber-600'
                      }`}>
                        These tables share the same GPS coordinates — your phone
                        can't tell them apart. Select manually below, or scan the
                        QR code on your table for instant detection.
                      </p>
                    </div>
                  </div>

                  {/* QR nudge */}
                  <button
                    onClick={() => navigate('/customer/login')}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      dark
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-600/40'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      <span>Scan QR code instead (recommended)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                </div>
              ) : (
                <p className={`text-sm text-center ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Multiple tables detected nearby. Select yours:
                </p>
              )}

              {/* Table cards */}
              {nearbyTables.map(({ table, distance }, idx) => {
                const dl = distanceLabel(distance ?? 0);
                const isClosest = idx === 0;

                return (
                  <button
                    key={table._id}
                    onClick={() => handleTableSelection(table)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-left ${
                      dark
                        ? 'bg-gray-700/60 border-gray-600 hover:border-emerald-500'
                        : 'bg-white border-gray-200 hover:border-emerald-400 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Table number badge */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {table.tableNumber ?? table.number}
                        </div>
                        {isClosest && (
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                            <Star className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-base ${dark ? 'text-white' : 'text-gray-900'}`}>
                            Table {table.tableNumber ?? table.number}
                          </span>
                          {isClosest && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-500 text-white">
                              Closest
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 text-sm ${
                          dark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Users className="w-3.5 h-3.5" />
                          <span>Seats {table.capacity ?? table.seats ?? '—'}</span>
                        </div>
                      </div>

                      {/* Distance badge */}
                      <div className={`flex-shrink-0 px-3 py-2 rounded-xl text-right ${
                        dark ? 'bg-gray-600/60' : 'bg-gray-50'
                      }`}>
                        <div className={`text-base font-bold ${dl.color}`}>
                          {gpsAmbiguous ? '—' : `${(distance ?? 0).toFixed(1)}m`}
                        </div>
                        <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {gpsAmbiguous ? 'Same GPS' : dl.text}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Location details (non-selection states) */}
          {location && !showTableSelection && (
            <div className={`mb-6 p-4 rounded-2xl ${dark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span className={`text-sm font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Location
                </span>
              </div>
              <div className={`text-xs space-y-0.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div>Lat: {location.latitude.toFixed(6)}</div>
                <div>Lng: {location.longitude.toFixed(6)}</div>
                <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
              </div>
            </div>
          )}

          {/* Detected table card */}
          {locationStatus === 'table_detected' && detectedTable && (
            <div className={`mb-6 p-4 rounded-2xl border-2 ${
              dark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow">
                  {detectedTable.tableNumber ?? detectedTable.number}
                </div>
                <div>
                  <div className={`font-semibold ${dark ? 'text-green-400' : 'text-green-700'}`}>
                    Table {detectedTable.tableNumber ?? detectedTable.number}
                  </div>
                  <div className={`text-sm ${dark ? 'text-green-300' : 'text-green-600'}`}>
                    {detectedTable.capacity} seats · {detectedTable.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error card */}
          {locationStatus === 'error' && (
            <div className={`mb-6 p-4 rounded-2xl border-2 ${
              dark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <p className={`font-semibold mb-1 ${dark ? 'text-red-400' : 'text-red-700'}`}>
                    Unable to Proceed
                  </p>
                  <p className={`text-sm ${dark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {locationStatus === 'table_detected' && detectedTable && detectionMethod !== 'qr_code' && (
              <button
                onClick={() => proceedToUsernamePrompt(detectedTable)}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm &amp; Continue
              </button>
            )}

            {(locationStatus === 'error' || locationStatus === 'idle') && (
              <button
                onClick={requestLocation}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                {locationStatus === 'error' ? 'Try Again' : 'Check Location'}
              </button>
            )}

            <button
              onClick={() => navigate('/customer/login')}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                dark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Back to Login Options
            </button>
          </div>

          {/* Help text */}
          <div className={`mt-6 text-center text-xs ${dark ? 'text-gray-500' : 'text-slate-500'}`}>
            {showTableSelection ? (
              <>
                <p>Select your table from the list above</p>
                <p className="mt-1">Or scan the QR code on your table for instant detection</p>
              </>
            ) : (
              <>
                <p>You must be inside the cafe zone to login</p>
                <p className="mt-1">Make sure location services are enabled</p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-30px); }
        }
        .animate-float         { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default LocationLogin;