import React, { useState } from 'react';
import { X, Copy, Check, Eye, EyeOff } from 'lucide-react';

const StaffCredentialsCard = ({ credentials, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAllCredentials = () => {
    const text = `
Login Credentials
==================
Email: ${credentials.email}
Password: ${credentials.password || credentials.newPassword}
Employee ID: ${credentials.employeeId}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">🔐 Login Credentials</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-400">
              ⚠️ <strong>IMPORTANT:</strong> Save these credentials securely. 
              The password will not be shown again!
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={credentials.email}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
              <button
                onClick={() => handleCopy(credentials.email)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Copy"
              >
                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password || credentials.newPassword}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  type="button"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={() => handleCopy(credentials.password || credentials.newPassword)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Copy"
              >
                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Employee ID
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={credentials.employeeId}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
              <button
                onClick={() => handleCopy(credentials.employeeId)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Copy"
              >
                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={copyAllCredentials}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              Copy All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCredentialsCard;