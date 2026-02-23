// File: frontend/src/modules/customer/components/TableLogin.jsx
// 🌍 PRODUCTION-LEVEL TABLE LOGIN COMPONENT - UPDATED
// ✅ QR Code Scanning with Professional View | 🌍 Location-Based Login | 🔢 Manual Entry
// ✅ FIXED: Navigate to /customer/biometric (matching route)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Hash, CheckCircle, AlertCircle, Sparkles, Loader, XCircle, Navigation, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../shared/context/ThemeContext';
import { requestLocationAccess, isGeolocationAvailable } from '../../../shared/utils/location';
import QRScannerView from './QRScannerView';
import axios from '../../../api/axios';

const TableLogin = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // State Management
  const [loginMethod, setLoginMethod] = useState('qr'); // 'qr', 'location', 'manual'
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Location State
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  
  // Manual Entry State
  const [manualTableNo, setManualTableNo] = useState('');

  useEffect(() => {
    if (loginMethod === 'location') {
      handleLocationLogin();
    }
  }, [loginMethod]);

  // ============================================
  // QR CODE SCANNING WITH PROFESSIONAL VIEW
  // ============================================

  const handleOpenScanner = () => {
    setShowScanner(true);
    setError(null);
  };

  const handleQRScan = async (data) => {
    try {
      setLoading(true);
      
      console.log('📸 QR Code scanned:', data);

      // Parse QR code data
      const qrData = JSON.parse(data);
      
      if (!qrData.tableId) {
        throw new Error('Invalid QR code format');
      }

      console.log('🔍 Verifying QR code with backend...');

      // Verify QR code with backend
      const response = await axios.post('/tables/verify-qr', {
        tableId: qrData.tableId,
        restaurantId: qrData.restaurantId || 'default',
      });

      console.log('✅ QR verification response:', response);

      const data_res = response?.data || response;
      const table = data_res?.data?.table || data_res?.table;

      if (table) {
        toast.success(`✅ Table ${table.number} verified!`, {
          theme: theme === 'dark' ? 'dark' : 'light',
          autoClose: 2000,
        });
        
        setShowScanner(false);
        
        console.log('➡️ Navigating to biometric page...');
        setTimeout(() => {
          // ✅ FIXED: Navigate to biometric page (matches route)
          navigate('/customer/biometric', { 
            state: { 
              tableId: table._id || table.id,
              tableNumber: table.number,
              method: 'qr',
            } 
          });
        }, 500);
      } else {
        throw new Error('QR code verification failed');
      }
    } catch (err) {
      console.error('❌ QR code processing error:', err);
      setShowScanner(false);
      setError('Invalid QR Code. Please scan the table QR code or try another method.');
      setLoading(false);
      
      toast.error('❌ Invalid QR Code', {
        theme: theme === 'dark' ? 'dark' : 'light',
      });
    }
  };

  // ============================================
  // LOCATION-BASED LOGIN WITH GEOFENCING
  // ============================================

  const handleLocationLogin = async () => {
    if (!isGeolocationAvailable()) {
      setError('Geolocation is not supported by your browser. Please use another method.');
      toast.error('Geolocation not supported', {
        theme: theme === 'dark' ? 'dark' : 'light',
      });
      return;
    }

    try {
      setLocationStatus('detecting');
      setError(null);
      
      console.log('📍 Requesting location access...');

      const locationData = await requestLocationAccess();
      
      console.log('✅ Location obtained:', locationData);

      setLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
      });
      
      setLocationStatus('validating');
      
      await validateLocationWithGeofencing(locationData);
      
    } catch (err) {
      console.error('❌ Location error:', err);
      setLocationStatus('error');
      setError(err.message || 'Location access denied. Please enable location services or use another method.');
      setPermissionDenied(true);
      
      toast.error('❌ Location access denied', {
        theme: theme === 'dark' ? 'dark' : 'light',
      });
    }
  };

  const validateLocationWithGeofencing = async (coords) => {
    try {
      console.log('🔍 Validating location against cafe zones...');

      const zoneResponse = await axios.post('/zones/validate-location', {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      console.log('📥 Zone validation response:', zoneResponse);

      const zoneData = zoneResponse?.data || zoneResponse;

      if (!zoneData.success || !zoneData.data?.isValid) {
        setLocationStatus('error');
        setError(zoneData.message || zoneData.data?.message || 'You are not in the cafe zone. Please move inside the cafe area.');
        
        toast.error('❌ You are outside the cafe zone', {
          theme: theme === 'dark' ? 'dark' : 'light',
        });
        return;
      }

      console.log('✅ Location is valid - customer is in zone:', zoneData.data.primaryZone.name);

      await matchTableByLocation(coords);

    } catch (err) {
      console.error('❌ Geofencing validation error:', err);
      setLocationStatus('error');
      setError('Failed to validate location. Please try again or use another method.');
      
      toast.error('❌ Location validation failed', {
        theme: theme === 'dark' ? 'dark' : 'light',
      });
    }
  };

  const matchTableByLocation = async (coords) => {
    try {
      console.log('🔍 Matching table by location...');

      const response = await axios.post('/tables/match-location', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });

      console.log('✅ Table match response:', response);

      const result = response?.data || response;
      const table = result?.data?.table || result?.table;

      if (result?.success && table) {
        setLocationStatus('success');
        
        toast.success(`✅ Matched to ${table.name || table.number}!`, {
          theme: theme === 'dark' ? 'dark' : 'light',
          autoClose: 2000,
        });
        
        console.log('➡️ Navigating to biometric page...');
        setTimeout(() => {
          // ✅ FIXED: Navigate to biometric page (matches route)
          navigate('/customer/biometric', { 
            state: { 
              tableId: table._id || table.id,
              tableNumber: table.number || table.name,
              method: 'location',
              location: coords,
            } 
          });
        }, 1000);
      } else {
        throw new Error('No nearby table found');
      }
    } catch (err) {
      console.error('❌ Location matching error:', err);
      setLocationStatus('error');
      setError('No nearby table found within 50 meters. Please move closer or use manual entry.');
      
      toast.warning('⚠️ No nearby table found', {
        theme: theme === 'dark' ? 'dark' : 'light',
      });
    }
  };

  // ============================================
  // MANUAL TABLE NUMBER ENTRY
  // ============================================

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!manualTableNo.trim()) {
      toast.error('Please enter a table number', {
        theme: theme === 'dark' ? 'dark' : 'light',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Looking up table number:', manualTableNo.trim());

      const response = await axios.get(`/tables/number/${manualTableNo.trim()}`);

      console.log('✅ Table lookup response:', response);

      const data = response?.data || response;
      const table = data?.data?.table || data?.table;

      if (table) {
        toast.success(`✅ Table ${table.number} found!`, {
          theme: theme === 'dark' ? 'dark' : 'light',
          autoClose: 2000,
        });
        
        console.log('➡️ Navigating to biometric page...');
        // ✅ FIXED: Navigate to biometric page (matches route)
        navigate('/customer/biometric', { 
          state: { 
            tableId: table._id || table.id,
            tableNumber: table.number,
            method: 'manual',
          } 
        });
      } else {
        throw new Error('Table not found');
      }
    } catch (err) {
      console.error('❌ Manual table lookup error:', err);
      setError(`Table "${manualTableNo}" not found. Please check the number and try again.`);
      
      toast.error('❌ Table not found', {
        theme: theme === 'dark' ? 'dark' : 'light',
      });
    } finally {
      setLoading(false);
    }
  };

  const retryMethod = () => {
    setError(null);
    setPermissionDenied(false);
    setLocationStatus('idle');
    setLocation(null);
    
    if (loginMethod === 'qr') {
      handleOpenScanner();
    } else if (loginMethod === 'location') {
      handleLocationLogin();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  // Professional QR Scanner Fullscreen View
  if (showScanner) {
    return (
      <QRScannerView
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
        loading={loading}
      />
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float ${
          theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-200/30'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float ${
          theme === 'dark' ? 'bg-teal-500/10' : 'bg-teal-200/30'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${
          theme === 'dark' ? 'bg-green-500/5' : 'bg-green-200/20'
        }`}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block relative mb-6">
            <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse-slow ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 opacity-20'
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 opacity-40'
            }`}></div>
            
            <div className={`relative p-6 rounded-full shadow-2xl border-4 hover:scale-110 hover:rotate-6 transition-all duration-500 ${
              theme === 'dark'
                ? 'bg-gray-800 border-emerald-700'
                : 'bg-white border-emerald-100'
            }`}>
              <Camera className={`w-14 h-14 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              Welcome!
            </span>
          </h1>
          <p className={`text-lg font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
          }`}>
            Choose your login method
          </p>
        </div>

        {/* Login Method Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => {
              setLoginMethod('qr');
              handleOpenScanner();
            }}
            disabled={loading}
            className={`group p-5 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              loginMethod === 'qr'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-xl shadow-emerald-500/30 scale-105'
                : theme === 'dark'
                ? 'bg-gray-800/80 backdrop-blur-sm border-emerald-700 hover:border-emerald-500 hover:shadow-lg hover:scale-105 hover:bg-gray-700/80'
                : 'bg-white/80 backdrop-blur-sm border-emerald-200 hover:border-emerald-400 hover:shadow-lg hover:scale-105 hover:bg-emerald-50/50'
            }`}
          >
            <Camera className={`w-7 h-7 mx-auto mb-2 transition-transform group-hover:scale-110 ${
              loginMethod === 'qr' 
                ? 'text-white' 
                : theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
            <span className={`text-sm font-bold block ${
              loginMethod === 'qr' 
                ? 'text-white' 
                : theme === 'dark' ? 'text-gray-300' : 'text-slate-700'
            }`}>
              QR Code
            </span>
          </button>

          <button
            onClick={() => {
              setLoginMethod('location');
              setError(null);
            }}
            disabled={loading || locationStatus === 'detecting' || locationStatus === 'validating'}
            className={`group p-5 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              loginMethod === 'location'
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-teal-600 shadow-xl shadow-teal-500/30 scale-105'
                : theme === 'dark'
                ? 'bg-gray-800/80 backdrop-blur-sm border-teal-700 hover:border-teal-500 hover:shadow-lg hover:scale-105 hover:bg-gray-700/80'
                : 'bg-white/80 backdrop-blur-sm border-teal-200 hover:border-teal-400 hover:shadow-lg hover:scale-105 hover:bg-teal-50/50'
            }`}
          >
            <MapPin className={`w-7 h-7 mx-auto mb-2 transition-transform group-hover:scale-110 ${
              loginMethod === 'location' 
                ? 'text-white' 
                : theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
            }`} />
            <span className={`text-sm font-bold block ${
              loginMethod === 'location' 
                ? 'text-white' 
                : theme === 'dark' ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Location
            </span>
          </button>

          <button
            onClick={() => {
              setLoginMethod('manual');
              setError(null);
              setLocationStatus('idle');
            }}
            disabled={loading}
            className={`group p-5 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              loginMethod === 'manual'
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600 shadow-xl shadow-green-500/30 scale-105'
                : theme === 'dark'
                ? 'bg-gray-800/80 backdrop-blur-sm border-green-700 hover:border-green-500 hover:shadow-lg hover:scale-105 hover:bg-gray-700/80'
                : 'bg-white/80 backdrop-blur-sm border-green-200 hover:border-green-400 hover:shadow-lg hover:scale-105 hover:bg-green-50/50'
            }`}
          >
            <Hash className={`w-7 h-7 mx-auto mb-2 transition-transform group-hover:scale-110 ${
              loginMethod === 'manual' 
                ? 'text-white' 
                : theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`text-sm font-bold block ${
              loginMethod === 'manual' 
                ? 'text-white' 
                : theme === 'dark' ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Manual
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-7 animate-slide-up ${
          theme === 'dark'
            ? 'bg-gray-800/90 border-gray-700'
            : 'bg-white/90 border-emerald-100/50'
        }`}>
          {error && (
            <div className={`mb-5 p-4 border-2 rounded-2xl flex items-start gap-3 animate-shake ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-red-900/40' : 'bg-red-100'
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold mb-1 ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-800'
                }`}>
                  Error
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>
                  {error}
                </p>
                {permissionDenied && (
                  <button
                    onClick={retryMethod}
                    className={`mt-3 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-red-800 text-red-200 hover:bg-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Location View */}
          {loginMethod === 'location' && (
            <div className="text-center py-10">
              <div className="inline-block relative mb-6">
                <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse-slow ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 opacity-20'
                    : 'bg-gradient-to-r from-teal-300 to-cyan-300 opacity-50'
                }`}></div>
                <div className={`relative p-8 rounded-full shadow-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-teal-900/50 to-cyan-900/50'
                    : 'bg-gradient-to-br from-teal-100 to-cyan-100'
                }`}>
                  {locationStatus === 'detecting' || locationStatus === 'validating' ? (
                    <Loader className={`w-14 h-14 animate-spin ${
                      theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                    }`} />
                  ) : locationStatus === 'success' ? (
                    <CheckCircle className={`w-14 h-14 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  ) : locationStatus === 'error' ? (
                    <XCircle className={`w-14 h-14 ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`} />
                  ) : (
                    <MapPin className={`w-14 h-14 animate-bounce ${
                      theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                    }`} />
                  )}
                </div>
              </div>

              <h3 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                {locationStatus === 'detecting' && 'Detecting Your Location...'}
                {locationStatus === 'validating' && 'Validating Zone...'}
                {locationStatus === 'success' && 'Location Verified! ✓'}
                {locationStatus === 'error' && 'Location Error'}
                {locationStatus === 'idle' && 'Enable Location'}
              </h3>
              
              <p className={`mb-6 font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
              }`}>
                {locationStatus === 'detecting' && 'Please wait while we detect your location...'}
                {locationStatus === 'validating' && 'Checking if you are in the cafe zone...'}
                {locationStatus === 'success' && 'Successfully matched to your table!'}
                {locationStatus === 'error' && 'Unable to detect location or you are outside the cafe'}
                {locationStatus === 'idle' && 'Allow location access to automatically find your table'}
              </p>
              
              {location && locationStatus !== 'error' && (
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-lg animate-scale-in">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Manual Entry View */}
          {loginMethod === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-bold mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Enter Table Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualTableNo}
                    onChange={(e) => setManualTableNo(e.target.value)}
                    placeholder="e.g., T-12 or 12"
                    disabled={loading}
                    className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:outline-none transition-all text-lg font-semibold placeholder:font-normal disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-gray-500'
                        : 'bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/10 text-gray-900 placeholder:text-slate-400'
                    }`}
                    autoFocus
                  />
                  <Hash className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 ${
                    theme === 'dark' ? 'text-emerald-500' : 'text-emerald-400'
                  }`} />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !manualTableNo.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* QR Code Prompt */}
          {loginMethod === 'qr' && !showScanner && (
            <div className="text-center py-10">
              <div className="mb-6">
                <Camera className={`w-20 h-20 mx-auto ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Ready to Scan
              </h3>
              <p className={`mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
              }`}>
                Click the button to open camera
              </p>
              <button
                onClick={handleOpenScanner}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Open Scanner
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className={`mt-6 text-center backdrop-blur-sm rounded-2xl p-4 border ${
          theme === 'dark'
            ? 'bg-gray-800/60 border-gray-700'
            : 'bg-white/60 border-emerald-100/50'
        }`}>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
          }`}>
            <span className={`font-bold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              Need help?
            </span>{' '}
            Our friendly staff is ready to assist you! 🌿
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-slide-up {
          animation: slide-up 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
        }
        
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default TableLogin;