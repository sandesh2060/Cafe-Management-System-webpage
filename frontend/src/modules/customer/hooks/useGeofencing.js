// File: frontend/src/modules/customer/hooks/useGeofencing.js
// 🌍 CUSTOMER GEOFENCING HOOK WITH AUTO-LOGOUT
//
// FIXES APPLIED:
// ✅ FIX A: handleZoneExit / handleAutoLogout moved to useCallback with
//           correct deps — eliminates stale closure on warningShown
// ✅ FIX B: cleanup() converted to useCallback so it can be safely
//           listed as a dependency in the init useEffect
// ✅ FIX C: Grace timer cleared if customer re-enters zone before logout
// ✅ FIX D: Zone-entry clears warningShown so next exit re-warns properly

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import geofencingService from '../../../shared/services/geofencing.service';

export const useGeofencing = (options = {}) => {
  const navigate = useNavigate();

  const {
    enableTracking = true,
    checkInterval  = 10_000,
    showWarnings   = true,
    onZoneExit:           onZoneExitCallback,
    onLocationUpdate:     onLocationUpdateCallback,
  } = options;

  const [isTracking,       setIsTracking]       = useState(false);
  const [currentLocation,  setCurrentLocation]  = useState(null);
  const [currentZone,      setCurrentZone]       = useState(null);
  const [locationError,    setLocationError]     = useState(null);
  const [isInZone,         setIsInZone]          = useState(true);
  const [warningShown,     setWarningShown]      = useState(false);

  // FIX A: keep warningShown accessible inside callbacks without re-registering
  const warningShownRef = useRef(false);
  const graceTimerRef   = useRef(null);

  const syncWarning = (val) => {
    warningShownRef.current = val;
    setWarningShown(val);
  };

  // ── AUTO-LOGOUT ──────────────────────────────────────────────
  const handleAutoLogout = useCallback((exitData) => {
    console.log('🔴 Auto-logout triggered');

    const sessionData = JSON.parse(localStorage.getItem('customerSession') || '{}');

    localStorage.setItem('lastSessionExit', JSON.stringify({
      ...sessionData,
      exitReason: exitData.reason || 'Left zone',
      exitTime:   new Date().toISOString(),
      zone:       exitData.zone,
    }));

    localStorage.removeItem('customerSession');
    // Also clear table cache so next visit re-detects
    sessionStorage.removeItem('lastTable');

    toast.error('❌ Session ended — you left the cafe zone', {
      autoClose: 3000,
      position:  'top-center',
    });

    setTimeout(() => {
      navigate('/customer/login', {
        state: { message: 'Your session ended because you left the cafe zone.', reason: 'zone_exit' },
      });
    }, 2000);
  }, [navigate]);

  // ── ZONE EXIT ────────────────────────────────────────────────
  // FIX A: use ref for warningShown check — no stale closure
  const handleZoneExit = useCallback((exitData) => {
    console.log('🚪 Zone exit detected:', exitData);
    setIsInZone(false);
    setCurrentZone(null);

    if (showWarnings && !warningShownRef.current) {
      toast.warning('⚠️ You have left the cafe zone. Your session will end soon.', {
        autoClose: 5000,
        position:  'top-center',
      });
      syncWarning(true);
    }

    if (onZoneExitCallback) onZoneExitCallback(exitData);

    // FIX C: clear any existing grace timer before starting a new one
    if (graceTimerRef.current) clearTimeout(graceTimerRef.current);

    graceTimerRef.current = setTimeout(() => {
      handleAutoLogout(exitData);
    }, 3_000);

  }, [showWarnings, onZoneExitCallback, handleAutoLogout]);

  // ── LOCATION UPDATE ──────────────────────────────────────────
  const handleLocationUpdate = useCallback((location) => {
    setCurrentLocation(location);
    if (onLocationUpdateCallback) onLocationUpdateCallback(location);
  }, [onLocationUpdateCallback]);

  // ── ERROR ────────────────────────────────────────────────────
  const handleError = useCallback((error) => {
    console.error('❌ Geofencing error:', error);
    setLocationError(error.message);
    if (showWarnings) toast.error(`Location error: ${error.message}`);
  }, [showWarnings]);

  // ── CLEANUP ──────────────────────────────────────────────────
  // FIX B: useCallback so it can be referenced in the init effect
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up geofencing...');
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    geofencingService.off('onLocationUpdate', handleLocationUpdate);
    geofencingService.off('onZoneExit',       handleZoneExit);
    geofencingService.off('onError',          handleError);
    geofencingService.stopTracking();
    setIsTracking(false);
  }, [handleLocationUpdate, handleZoneExit, handleError]);

  // ── INIT ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!enableTracking) return;

    const init = async () => {
      try {
        console.log('🌍 Initializing customer geofencing...');
        await geofencingService.initialize();

        geofencingService.on('onLocationUpdate', handleLocationUpdate);
        geofencingService.on('onZoneExit',       handleZoneExit);
        geofencingService.on('onError',          handleError);

        geofencingService.startTracking({ checkInterval });
        setIsTracking(true);
        console.log('✅ Geofencing initialized');
      } catch (error) {
        console.error('❌ Geofencing init error:', error);
        setLocationError(error.message);
        if (showWarnings) {
          toast.error('Location tracking unavailable. Some features may be limited.');
        }
      }
    };

    init();
    return cleanup;
  }, [enableTracking, checkInterval, showWarnings, handleLocationUpdate, handleZoneExit, handleError, cleanup]);

  // ── PUBLIC METHODS ───────────────────────────────────────────
  const validateCurrentLocation = useCallback(async () => {
    try {
      const result = await geofencingService.validateLocation();
      if (result.isValid) {
        setIsInZone(true);
        setCurrentZone(result.zone);

        // FIX D: clear grace timer if customer re-entered zone in time
        if (graceTimerRef.current) {
          clearTimeout(graceTimerRef.current);
          graceTimerRef.current = null;
        }
        syncWarning(false); // reset so next exit shows warning again

        return { success: true, zone: result.zone };
      } else {
        setIsInZone(false);
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      const granted = await geofencingService.requestPermission();
      if (granted) { setLocationError(null); return true; }
      setLocationError('Location permission denied');
      return false;
    } catch (error) {
      setLocationError(error.message);
      return false;
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!isTracking) {
      geofencingService.startTracking({ checkInterval });
      setIsTracking(true);
    }
  }, [isTracking, checkInterval]);

  const stopTracking = useCallback(() => {
    if (isTracking) {
      geofencingService.stopTracking();
      setIsTracking(false);
    }
  }, [isTracking]);

  const getCurrentLocation = useCallback(() => geofencingService.getCurrentLocation(), []);

  const getDistanceToZone = useCallback((zone) => {
    if (!currentLocation || !zone?.location?.center) return null;
    return geofencingService.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      zone.location.center.latitude,
      zone.location.center.longitude
    );
  }, [currentLocation]);

  return {
    isTracking,
    currentLocation,
    currentZone,
    isInZone,
    locationError,
    warningShown,
    validateCurrentLocation,
    requestLocationPermission,
    startTracking,
    stopTracking,
    getCurrentLocation,
    getDistanceToZone,
    geofencingService,
  };
};

export default useGeofencing;