// ================================================================
// FILE: frontend/src/modules/customer/components/FingerprintCapture.jsx
// 🔐 FINGERPRINT AUTHENTICATION COMPONENT
// ✅ Placeholder - Fingerprint coming soon!
// ================================================================

import React from "react";
import { Fingerprint, ArrowLeft, AlertCircle } from "lucide-react";

const FingerprintCapture = ({ tableData, onSuccess, onCancel }) => {
  return (
    <div className="space-y-6">
      <div className="bg-bg-elevated rounded-3xl p-8 border-2 border-brand/20 shadow-xl text-center">
        {/* Icon */}
        <div className="inline-block relative mb-6">
          <div className="absolute inset-0 rounded-full blur-2xl bg-purple-500/30 animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <Fingerprint className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-text-primary mb-3">
          Fingerprint Login
        </h2>
        <p className="text-text-secondary mb-8 text-lg">
          Fingerprint authentication coming soon!
        </p>

        {/* Info Box */}
        <div className="bg-info/10 border border-info/20 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-info flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="font-bold text-info mb-2">Why Fingerprint?</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Ultra-secure biometric authentication</li>
                <li>• Instant recognition</li>
                <li>• No passwords needed</li>
                <li>• Works with most modern devices</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Table Info */}
        {tableData && (
          <div className="bg-bg-secondary rounded-xl p-4 mb-6">
            <p className="text-sm text-text-tertiary mb-1">Selected Table</p>
            <p className="text-2xl font-bold text-text-primary">
              Table {tableData.tableNumber}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onCancel}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Use Another Method
          </button>
          
          <p className="text-xs text-text-tertiary">
            For now, please use face recognition or username login
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-bg-elevated rounded-2xl p-6 border border-border">
        <h4 className="text-sm font-semibold text-brand mb-3">
          Alternative Login Methods Available:
        </h4>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand rounded-full" />
            <span>Face Recognition (Recommended)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand rounded-full" />
            <span>Username Login</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand rounded-full" />
            <span>QR Code Scan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FingerprintCapture;