// File: frontend/src/shared/components/NotificationSettings.jsx
// ⚙️ NOTIFICATION SETTINGS - Sound & Vibration Controls

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Vibrate, Smartphone, Play, Settings } from 'lucide-react';
import soundPlayer from '../utils/soundPlayer';
import vibrationManager from '../utils/vibration';

const NotificationSettings = ({ isOpen, onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(soundPlayer.isEnabled());
  const [volume, setVolume] = useState(soundPlayer.getVolume());
  const [vibrationEnabled, setVibrationEnabled] = useState(vibrationManager.isEnabled());
  const [vibrationSupported, setVibrationSupported] = useState(vibrationManager.isDeviceSupported());

  useEffect(() => {
    // Update state when settings change externally
    setSoundEnabled(soundPlayer.isEnabled());
    setVolume(soundPlayer.getVolume());
    setVibrationEnabled(vibrationManager.isEnabled());
  }, [isOpen]);

  // ============================================
  // SOUND CONTROLS
  // ============================================

  const handleSoundToggle = () => {
    const newState = soundPlayer.toggle();
    setSoundEnabled(newState);
    
    if (newState) {
      // Play test sound
      soundPlayer.play('ding');
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    soundPlayer.setVolume(newVolume);
    setVolume(newVolume);
  };

  const testSound = (soundName) => {
    soundPlayer.test(soundName);
    vibrationManager.tap();
  };

  // ============================================
  // VIBRATION CONTROLS
  // ============================================

  const handleVibrationToggle = () => {
    const newState = vibrationManager.toggle();
    setVibrationEnabled(newState);
  };

  const testVibration = (patternName) => {
    vibrationManager.test(patternName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-bg-elevated rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-brand to-secondary p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">
                Notifications
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="text-white text-2xl">×</span>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">
            Customize your sound and haptic feedback
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* ============================================ */}
          {/* SOUND SETTINGS */}
          {/* ============================================ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6 text-brand" />
                ) : (
                  <VolumeX className="w-6 h-6 text-text-tertiary" />
                )}
                <div>
                  <h3 className="font-bold text-text-primary">
                    Notification Sounds
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Play sounds for orders and alerts
                  </p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={handleSoundToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-brand' : 'bg-border-secondary'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume Control */}
            {soundEnabled && (
              <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-text-primary">
                    Volume
                  </label>
                  <span className="text-sm font-bold text-brand">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-border-primary rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>
            )}

            {/* Sound Test Buttons */}
            {soundEnabled && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-primary mb-2">
                  Test Sounds:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => testSound('newOrder')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">New Order</span>
                  </button>
                  
                  <button
                    onClick={() => testSound('orderReady')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-600 rounded-xl hover:bg-green-500/20 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">Order Ready</span>
                  </button>
                  
                  <button
                    onClick={() => testSound('waiterCall')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 rounded-xl hover:bg-yellow-500/20 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">Waiter Call</span>
                  </button>
                  
                  <button
                    onClick={() => testSound('newGuest')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 border border-purple-500/30 text-purple-600 rounded-xl hover:bg-purple-500/20 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">New Guest</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-border-primary"></div>

          {/* ============================================ */}
          {/* VIBRATION SETTINGS */}
          {/* ============================================ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {vibrationEnabled ? (
                  <Vibrate className="w-6 h-6 text-brand" />
                ) : (
                  <Smartphone className="w-6 h-6 text-text-tertiary" />
                )}
                <div>
                  <h3 className="font-bold text-text-primary">
                    Haptic Feedback
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Vibrate on actions and alerts
                  </p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={handleVibrationToggle}
                disabled={!vibrationSupported}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  vibrationEnabled ? 'bg-brand' : 'bg-border-secondary'
                } ${!vibrationSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    vibrationEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Not Supported Warning */}
            {!vibrationSupported && (
              <div className="bg-warning-light border border-warning rounded-xl p-3">
                <p className="text-xs text-warning font-medium">
                  ⚠️ Vibration not supported on this device
                </p>
              </div>
            )}

            {/* Vibration Test Buttons */}
            {vibrationEnabled && vibrationSupported && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-primary mb-2">
                  Test Vibrations:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => testVibration('tap')}
                    className="px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl hover:bg-bg-tertiary transition-colors"
                  >
                    <span className="text-sm font-semibold text-text-primary">Tap</span>
                  </button>
                  
                  <button
                    onClick={() => testVibration('success')}
                    className="px-4 py-3 bg-success-light border border-success rounded-xl hover:bg-success-light/80 transition-colors"
                  >
                    <span className="text-sm font-semibold text-success">Success</span>
                  </button>
                  
                  <button
                    onClick={() => testVibration('notification')}
                    className="px-4 py-3 bg-info-light border border-info rounded-xl hover:bg-info-light/80 transition-colors"
                  >
                    <span className="text-sm font-semibold text-info">Alert</span>
                  </button>
                  
                  <button
                    onClick={() => testVibration('orderPlaced')}
                    className="px-4 py-3 bg-brand-lighter border border-brand rounded-xl hover:bg-brand-light transition-colors"
                  >
                    <span className="text-sm font-semibold text-brand">Order</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-info-light border border-info rounded-xl p-4">
            <p className="text-xs text-info">
              💡 <strong>Tip:</strong> These settings help you stay notified without missing important updates. 
              Vibration works best on mobile devices.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-elevated border-t border-border-primary p-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-brand to-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;