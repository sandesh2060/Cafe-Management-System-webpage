// File: frontend/src/modules/customer/components/QRScanner.jsx
// ✅ FIXED: Removed double play() call that caused AbortError
// ✅ FIXED: video element always in DOM so qr-scanner can attach properly

import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Hash, CheckCircle, AlertCircle, Sparkles, Loader, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../../../shared/context/ThemeContext';
import { tableAPI } from '../../../api/endpoints';
import { requestLocationAccess, isGeolocationAvailable } from '../../../shared/utils/location';

const QRScanner = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [location, setLocation] = useState(null);
  const [manualTableNo, setManualTableNo] = useState('');
  const [loginMethod, setLoginMethod] = useState('qr');
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');

  useEffect(() => {
    if (loginMethod === 'qr' && scanning) {
      initScanner();
    }
    return () => stopCamera();
  }, [scanning, loginMethod]);

  useEffect(() => {
    if (loginMethod === 'location') {
      handleLocationLogin();
    }
  }, [loginMethod]);

  // ✅ KEY FIX: Let qr-scanner own the video element entirely.
  // No manual getUserMedia or play() — that caused the AbortError.
  const initScanner = async () => {
    try {
      setLoading(true);
      setError(null);

      const QrScanner = (await import('qr-scanner')).default;

      // Small delay so the video element is fully mounted in the DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => handleQRSuccess(result.data),
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment',
        }
      );

      await qrScannerRef.current.start();
      setLoading(false);

      console.log('✅ QR Scanner started successfully');
    } catch (err) {
      console.error('❌ QR Scanner init error:', err);
      setLoading(false);

      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        setError('Camera access denied. Please enable camera permissions or use manual entry.');
        setPermissionDenied(true);
        toast.error('Camera access denied', { theme: theme === 'dark' ? 'dark' : 'light' });
      } else {
        setError('Failed to start camera. Please try another method.');
        toast.error('Camera failed to start', { theme: theme === 'dark' ? 'dark' : 'light' });
      }
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const handleQRSuccess = async (data) => {
    try {
      stopCamera();
      setLoading(true);

      // ✅ Parse and log QR data
      let tableId, tableNumber, restaurantId;
      let parsedData = { raw: data };

      try {
        const url = new URL(data);
        const params = new URLSearchParams(url.search);
        tableId = params.get('tableId');
        tableNumber = params.get('tableNumber');
        restaurantId = params.get('restaurantId') || 'default';
        parsedData = { raw: data, tableId, tableNumber, restaurantId, allParams: Object.fromEntries(params.entries()) };
      } catch {
        try {
          const qrData = JSON.parse(data);
          tableId = qrData.tableId;
          tableNumber = qrData.tableNumber;
          restaurantId = qrData.restaurantId || 'default';
          parsedData = { raw: data, ...qrData };
        } catch {
          parsedData = { raw: data, note: 'Plain string — not a URL or JSON' };
        }
      }

      console.group('📱 QR Code Scanned');
      console.log('Raw data     :', parsedData.raw);
      console.log('tableId      :', parsedData.tableId     ?? '—');
      console.log('tableNumber  :', parsedData.tableNumber  ?? '—');
      console.log('restaurantId :', parsedData.restaurantId ?? '—');
      console.log('All params   :', parsedData.allParams    ?? parsedData);
      console.groupEnd();

      if (!tableId) {
        throw new Error('Invalid QR code: Missing table ID');
      }

      const response = await tableAPI.verifyQRCode({ tableId, restaurantId });
      const table = response?.data?.table || response?.table;

      if (table) {
        toast.success(`Table ${table.number} verified! ✓`, {
          theme: theme === 'dark' ? 'dark' : 'light',
        });
        navigate('/customer/username', {
          state: { tableId: table._id || table.id, tableNumber: table.number, method: 'qr' },
        });
      } else {
        throw new Error('QR code verification failed');
      }
    } catch (err) {
      console.error('❌ QR code processing error:', err);
      setError('Invalid QR Code. Please scan the table QR code or try another method.');
      setLoading(false);
      setScanning(false);
      toast.error('Invalid QR Code', { theme: theme === 'dark' ? 'dark' : 'light' });
    }
  };

  const handleLocationLogin = async () => {
    if (!isGeolocationAvailable()) {
      setError('Geolocation is not supported by your browser. Please use another method.');
      toast.error('Geolocation not supported', { theme: theme === 'dark' ? 'dark' : 'light' });
      return;
    }
    try {
      setLocationStatus('detecting');
      setError(null);
      const locationData = await requestLocationAccess();
      setLocation({ latitude: locationData.latitude, longitude: locationData.longitude, accuracy: locationData.accuracy });
      setLocationStatus('matching');
      await matchTableByLocation(locationData);
    } catch (err) {
      console.error('Location error:', err);
      setLocationStatus('error');
      setError(err.message || 'Location access denied. Please enable location services or use another method.');
      setPermissionDenied(true);
      toast.error('Location access denied', { theme: theme === 'dark' ? 'dark' : 'light' });
    }
  };

  const matchTableByLocation = async (coords) => {
    try {
      const response = await tableAPI.matchLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
      const result = response?.data || response;
      const table = result?.table;
      if (result?.success && table) {
        setLocationStatus('success');
        toast.success(`Matched to ${table.name || table.number}!`, { theme: theme === 'dark' ? 'dark' : 'light', autoClose: 2000 });
        setTimeout(() => {
          navigate('/customer/username', {
            state: { tableId: table._id || table.id, tableNumber: table.number || table.name, method: 'location', location: coords },
          });
        }, 1000);
      } else {
        throw new Error('No nearby table found');
      }
    } catch (err) {
      console.error('Location matching error:', err);
      setLocationStatus('error');
      setError('No nearby table found within 50 meters. Please move closer or use manual entry.');
      toast.warning('No nearby table found', { theme: theme === 'dark' ? 'dark' : 'light' });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualTableNo.trim()) {
      toast.error('Please enter a table number', { theme: theme === 'dark' ? 'dark' : 'light' });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await tableAPI.getByNumber(manualTableNo.trim());
      const table = response?.data?.table || response?.table;
      if (table) {
        toast.success(`Table ${table.number} found!`, { theme: theme === 'dark' ? 'dark' : 'light' });
        navigate('/customer/username', { state: { tableId: table._id || table.id, tableNumber: table.number, method: 'manual' } });
      } else {
        throw new Error('Table not found');
      }
    } catch (err) {
      console.error('Manual table lookup error:', err);
      setError(`Table "${manualTableNo}" not found. Please check the number and try again.`);
      toast.error('Table not found', { theme: theme === 'dark' ? 'dark' : 'light' });
    } finally {
      setLoading(false);
    }
  };

  const retryMethod = () => {
    setError(null);
    setPermissionDenied(false);
    setLocationStatus('idle');
    setLocation(null);
    if (loginMethod === 'qr') setScanning(false);
    setTimeout(() => {
      if (loginMethod === 'qr') setScanning(true);
      else if (loginMethod === 'location') handleLocationLogin();
    }, 100);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-200/30'}`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float ${theme === 'dark' ? 'bg-teal-500/10' : 'bg-teal-200/30'}`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${theme === 'dark' ? 'bg-green-500/5' : 'bg-green-200/20'}`}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block relative mb-6">
            <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse-slow ${theme === 'dark' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 opacity-20' : 'bg-gradient-to-r from-emerald-400 to-teal-400 opacity-40'}`}></div>
            <div className={`relative p-6 rounded-full shadow-2xl border-4 hover:scale-110 hover:rotate-6 transition-all duration-500 ${theme === 'dark' ? 'bg-gray-800 border-emerald-700' : 'bg-white border-emerald-100'}`}>
              <Camera className={`w-14 h-14 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">Welcome Back!</span>
          </h1>
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Choose your preferred login method</p>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { key: 'qr', label: 'QR Code', Icon: Camera, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
            { key: 'location', label: 'Location', Icon: MapPin, color: 'teal', gradient: 'from-teal-500 to-cyan-600' },
            { key: 'manual', label: 'Manual', Icon: Hash, color: 'green', gradient: 'from-green-500 to-emerald-600' },
          ].map(({ key, label, Icon, color, gradient }) => (
            <button
              key={key}
              onClick={() => {
                setLoginMethod(key);
                setScanning(key === 'qr');
                setError(null);
                setLocationStatus('idle');
              }}
              disabled={loading || (key === 'location' && (locationStatus === 'detecting' || locationStatus === 'matching'))}
              className={`group p-5 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                loginMethod === key
                  ? `bg-gradient-to-br ${gradient} text-white border-${color}-600 shadow-xl shadow-${color}-500/30 scale-105`
                  : theme === 'dark'
                  ? `bg-gray-800/80 backdrop-blur-sm border-${color}-700 hover:border-${color}-500 hover:shadow-lg hover:scale-105`
                  : `bg-white/80 backdrop-blur-sm border-${color}-200 hover:border-${color}-400 hover:shadow-lg hover:scale-105`
              }`}
            >
              <Icon className={`w-7 h-7 mx-auto mb-2 transition-transform group-hover:scale-110 ${loginMethod === key ? 'text-white' : theme === 'dark' ? `text-${color}-400` : `text-${color}-600`}`} />
              <span className={`text-sm font-bold block ${loginMethod === key ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-7 animate-slide-up ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-emerald-100/50'}`}>
          {error && (
            <div className={`mb-5 p-4 border-2 rounded-2xl flex items-start gap-3 animate-shake ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-red-900/40' : 'bg-red-100'}`}>
                <AlertCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>Error</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
                {permissionDenied && (
                  <button onClick={retryMethod} className={`mt-3 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${theme === 'dark' ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* QR Scanner — ✅ video is ALWAYS in DOM when loginMethod === 'qr', just hidden while loading */}
          {loginMethod === 'qr' && scanning && (
            <div className="space-y-5">
              <div className={`relative aspect-square rounded-2xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-slate-900'}`}>
                {/* Loading spinner overlay */}
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                    <Loader className="w-12 h-12 text-emerald-400 animate-spin" />
                  </div>
                )}

                {/* ✅ video always rendered — qr-scanner needs it in the DOM */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Overlay UI (only when not loading) */}
                {!loading && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50"></div>
                    <div className="absolute inset-0 border-4 border-emerald-400/60 rounded-2xl">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-4 border-emerald-400 rounded-2xl animate-pulse-slow shadow-lg shadow-emerald-400/50">
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-400 rounded-tl-2xl"></div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-tr-2xl"></div>
                        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-400 rounded-bl-2xl"></div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-400 rounded-br-2xl"></div>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan"></div>
                  </>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                  {loading ? 'Starting camera...' : 'Scanning for QR Code...'}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
                  Point your camera at the table QR code
                </p>
              </div>
            </div>
          )}

          {/* QR idle state — show start button */}
          {loginMethod === 'qr' && !scanning && !error && (
            <div className="text-center py-8">
              <button
                onClick={() => setScanning(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <Camera className="w-6 h-6" />
                Start Camera
              </button>
            </div>
          )}

          {/* Location View */}
          {loginMethod === 'location' && (
            <div className="text-center py-10">
              <div className="inline-block relative mb-6">
                <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse-slow ${theme === 'dark' ? 'bg-gradient-to-r from-teal-600 to-cyan-600 opacity-20' : 'bg-gradient-to-r from-teal-300 to-cyan-300 opacity-50'}`}></div>
                <div className={`relative p-8 rounded-full shadow-xl ${theme === 'dark' ? 'bg-gradient-to-br from-teal-900/50 to-cyan-900/50' : 'bg-gradient-to-br from-teal-100 to-cyan-100'}`}>
                  {locationStatus === 'detecting' || locationStatus === 'matching' ? (
                    <Loader className={`w-14 h-14 animate-spin ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
                  ) : locationStatus === 'success' ? (
                    <CheckCircle className={`w-14 h-14 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  ) : locationStatus === 'error' ? (
                    <XCircle className={`w-14 h-14 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                  ) : (
                    <MapPin className={`w-14 h-14 animate-bounce ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
                  )}
                </div>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                {locationStatus === 'detecting' && 'Detecting Your Location...'}
                {locationStatus === 'matching' && 'Finding Your Table...'}
                {locationStatus === 'success' && 'Location Detected! ✓'}
                {locationStatus === 'error' && 'Location Error'}
                {locationStatus === 'idle' && 'Enable Location'}
              </h3>
              <p className={`mb-6 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                {locationStatus === 'detecting' && 'Please wait while we detect your location...'}
                {locationStatus === 'matching' && 'Matching you to the nearest table...'}
                {locationStatus === 'success' && 'Successfully matched to your table!'}
                {locationStatus === 'error' && 'Unable to detect location'}
                {locationStatus === 'idle' && 'Allow location access to automatically find your table'}
              </p>
              {location && locationStatus !== 'error' && (
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Accuracy: ±{Math.round(location.accuracy)}m</span>
                </div>
              )}
              {(locationStatus === 'detecting' || locationStatus === 'matching') && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-teal-400' : 'bg-teal-600'}`} style={{ animationDelay: `${delay}s` }}></div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual Entry */}
          {loginMethod === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-bold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>Enter Table Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualTableNo}
                    onChange={(e) => setManualTableNo(e.target.value)}
                    placeholder="e.g., T-12 or 12"
                    disabled={loading}
                    className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:outline-none transition-all text-lg font-semibold placeholder:font-normal disabled:opacity-50 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-gray-500'
                        : 'bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/10 text-gray-900 placeholder:text-slate-400'
                    }`}
                    autoFocus
                  />
                  <Hash className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-400'}`} />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !manualTableNo.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <><Loader className="w-5 h-5 animate-spin" /><span>Verifying...</span></>
                ) : (
                  <><span>Continue to Menu</span><CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /></>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Help Text */}
        <div className={`mt-6 text-center backdrop-blur-sm rounded-2xl p-4 border ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-emerald-100/50'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            <span className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>Need help?</span>{' '}
            Our friendly staff is ready to assist you! 🌿
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-slide-up { animation: slide-up 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both; }
        .animate-shake { animation: shake 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default QRScanner;