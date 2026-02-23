// File: frontend/src/modules/manager/pages/StaffCredentialsPage.jsx
// 🔐 Staff Credentials Detail Page - Fully Responsive with Light/Dark Mode

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Mail, 
  Key, 
  User, 
  Calendar,
  Shield,
  Building,
  Phone,
  MapPin,
  Clock,
  Download,
  RefreshCw,
  Printer,
  Lock,
  X,
  AlertTriangle
} from 'lucide-react';
import { managerAPI } from '@/api/endpoints';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const StaffCredentialsPage = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  
  // Password verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  // Fetch staff details
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await managerAPI.getStaffMember(staffId);
        const staffData = response.user || response.staff || response;
        
        // ✅ CHECK: Prevent managers from viewing admin/superadmin credentials
        if (currentUser?.role === 'manager' && ['admin', 'superadmin'].includes(staffData.role)) {
          toast.error('You do not have permission to view admin credentials');
          navigate('/manager/dashboard?tab=staff');
          return;
        }
        
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff details');
        navigate('/manager/dashboard?tab=staff');
      } finally {
        setLoading(false);
      }
    };

    if (staffId) {
      fetchStaff();
    }
  }, [staffId, navigate, currentUser]);

  // Verify manager password
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    
    if (!managerPassword.trim()) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setVerifying(true);
      
      // Call API to verify manager password
      const response = await managerAPI.verifyPassword({
        password: managerPassword
      });

      if (response.success) {
        setIsPasswordVerified(true);
        setShowVerificationModal(false);
        setShowPassword(true);
        setManagerPassword('');
        toast.success('Password verified successfully');
      }
    } catch (error) {
      console.error('Password verification failed:', error);
      toast.error(error.response?.data?.message || 'Invalid password');
      setManagerPassword('');
    } finally {
      setVerifying(false);
    }
  };

  // Handle show/hide password toggle
  const handleTogglePassword = () => {
    if (!showPassword && !isPasswordVerified) {
      // Need to verify password first
      setShowVerificationModal(true);
    } else {
      setShowPassword(!showPassword);
    }
  };

  // Copy to clipboard
  const handleCopy = async (text, field) => {
    // For password, verify first
    if (field === 'Password' && !isPasswordVerified) {
      setShowVerificationModal(true);
      return;
    }

    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  // Copy all credentials
  const copyAllCredentials = async () => {
    if (!staff) return;

    // If there's a temporary password and it's not verified, verify first
    if (staff.temporaryPassword && !isPasswordVerified) {
      setShowVerificationModal(true);
      return;
    }

    const text = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    STAFF CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: ${staff.name}
📧 Email: ${staff.email}
🔑 Employee ID: ${staff.employeeId}
💼 Role: ${staff.role}
🏢 Department: ${staff.department || 'N/A'}
📱 Phone: ${staff.phoneNumber || 'N/A'}
📍 Address: ${staff.address || 'N/A'}

${staff.temporaryPassword ? `🔐 Temporary Password: ${staff.temporaryPassword}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('All credentials copied to clipboard!');
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!window.confirm(`Reset password for ${staff.name}?`)) return;

    try {
      setResettingPassword(true);
      const response = await managerAPI.resetStaffPassword(staffId);
      
      // Update staff with new temporary password
      setStaff(prev => ({
        ...prev,
        temporaryPassword: response.password || response.newPassword
      }));
      
      // Reset verification state so manager needs to verify again for new password
      setIsPasswordVerified(false);
      setShowPassword(false);
      
      toast.success('Password reset successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  // Print credentials
  const handlePrint = () => {
    window.print();
  };

  // Download as text file
  const handleDownload = async () => {
    if (!staff) return;

    // If there's a temporary password and it's not verified, verify first
    if (staff.temporaryPassword && !isPasswordVerified) {
      setShowVerificationModal(true);
      return;
    }

    const text = `
STAFF CREDENTIALS
=================

Name: ${staff.name}
Email: ${staff.email}
Employee ID: ${staff.employeeId}
Role: ${staff.role}
Department: ${staff.department || 'N/A'}
Phone: ${staff.phoneNumber || 'N/A'}
Address: ${staff.address || 'N/A'}

${staff.temporaryPassword ? `Temporary Password: ${staff.temporaryPassword}` : ''}

Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${staff.employeeId}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Credentials downloaded!');
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      waiter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cook: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      cashier: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      superadmin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Staff not found</p>
          <button
            onClick={() => navigate('/manager/dashboard?tab=staff')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Back to Staff Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Password Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Lock className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Verify Your Identity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your password to view sensitive data
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setManagerPassword('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="text-gray-500 dark:text-gray-400" size={20} />
              </button>
            </div>

            <form onSubmit={handleVerifyPassword} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Password
                </label>
                <input
                  type="password"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  placeholder="Enter your manager password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  autoFocus
                  disabled={verifying}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  🔒 This verifies you have permission to view the temporary password
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setManagerPassword('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                  disabled={verifying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={verifying || !managerPassword.trim()}
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/manager/dashboard?tab=staff')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-gray-600 dark:text-gray-400" size={24} />
              </button>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Staff Credentials
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {staff.name} • {staff.employeeId}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAllCredentials}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Copy size={18} />
                <span className="hidden sm:inline">Copy All</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Download</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Printer size={18} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {staff.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                
                {/* Name */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {staff.name}
                </h2>
                
                {/* Role Badge */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(staff.role)}`}>
                  {staff.role?.charAt(0)?.toUpperCase() + staff.role?.slice(1)}
                </span>
                
                {/* Status Badge */}
                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(staff.status)}`}>
                  {staff.status === 'active' ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="w-full px-4 py-3 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  {resettingPassword ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Key size={18} />
                      Reset Password
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate(`/manager/staff/${staffId}/edit`)}
                  className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-3"
                >
                  <User size={18} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Credentials */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Warning */}
            {staff.temporaryPassword && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                      ⚠️ Security Notice
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      This is a temporary password. The staff member should change it upon first login.
                      {!isPasswordVerified && ' You need to verify your identity to view the password.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Credentials */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Key className="text-blue-600 dark:text-blue-400" size={20} />
                  Login Credentials
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={staff.email}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <button
                      onClick={() => handleCopy(staff.email, 'Email')}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Copy email"
                    >
                      {copied === 'Email' ? (
                        <Check size={20} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={20} className="text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User size={16} className="inline mr-2" />
                    Employee ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={staff.employeeId}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <button
                      onClick={() => handleCopy(staff.employeeId, 'Employee ID')}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Copy employee ID"
                    >
                      {copied === 'Employee ID' ? (
                        <Check size={20} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy size={20} className="text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Temporary Password */}
                {staff.temporaryPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Key size={16} className="inline mr-2" />
                      Temporary Password
                      {!isPasswordVerified && (
                        <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                          🔒 Verification required
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword && isPasswordVerified ? 'text' : 'password'}
                          value={isPasswordVerified ? staff.temporaryPassword : '••••••••••••'}
                          readOnly
                          className="w-full px-4 py-2 pr-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <button
                          onClick={handleTogglePassword}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800/30 rounded"
                          type="button"
                          title={!isPasswordVerified ? "Verify password to view" : (showPassword ? "Hide password" : "Show password")}
                        >
                          {!isPasswordVerified ? (
                            <Lock size={18} className="text-yellow-600 dark:text-yellow-400" />
                          ) : showPassword ? (
                            <EyeOff size={18} className="text-gray-600 dark:text-gray-400" />
                          ) : (
                            <Eye size={18} className="text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => handleCopy(staff.temporaryPassword, 'Password')}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 rounded-lg transition-colors"
                        title={!isPasswordVerified ? "Verify password to copy" : "Copy password"}
                      >
                        {copied === 'Password' ? (
                          <Check size={20} className="text-green-600 dark:text-green-400" />
                        ) : !isPasswordVerified ? (
                          <Lock size={20} className="text-yellow-700 dark:text-yellow-400" />
                        ) : (
                          <Copy size={20} className="text-yellow-700 dark:text-yellow-400" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
                      💡 This password must be changed on first login
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="text-blue-600 dark:text-blue-400" size={20} />
                  Personal Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Building size={16} className="inline mr-2" />
                      Department
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {staff.department || 'Not specified'}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Phone size={16} className="inline mr-2" />
                      Phone Number
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {staff.phoneNumber || 'Not specified'}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <MapPin size={16} className="inline mr-2" />
                      Address
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {staff.address || 'Not specified'}
                    </p>
                  </div>

                  {/* Created At */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar size={16} className="inline mr-2" />
                      Created
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Last Updated */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Clock size={16} className="inline mr-2" />
                      Last Updated
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(staff.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles - ✅ FIXED: Removed jsx attribute */}
      <style>{`
        @media print {
          .sticky { position: static !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default StaffCredentialsPage;