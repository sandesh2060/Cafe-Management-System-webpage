// File: frontend/src/modules/manager/components/StaffManagement.jsx
// ✅ UPDATED: Added View Credentials button

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Key, Filter, Users, Eye } from 'lucide-react'; // ✅ Added Eye
import { useNavigate } from 'react-router-dom'; // ✅ Added
import { useStaffManagement } from '../hooks/useStaffManagement';
import CreateStaffModal from './CreateStaffModal';
import StaffCredentialsCard from './StaffCredentialsCard';

const StaffManagement = () => {
  const navigate = useNavigate(); // ✅ Added
  
  const {
    staff,
    stats,
    loading,
    deleting,
    filters,
    pagination,
    deleteStaff,
    resetPassword,
    updateFilters,
    changePage
  } = useStaffManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleDelete = async (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to deactivate ${staffName}?`)) {
      try {
        await deleteStaff(staffId);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleResetPassword = async (staffId, staffName) => {
    if (window.confirm(`Reset password for ${staffName}?`)) {
      try {
        const credentials = await resetPassword(staffId);
        setShowCredentials(credentials);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  // ✅ NEW: Navigate to credentials page
  const handleViewCredentials = (staffId) => {
    navigate(`/manager/staff/${staffId}/credentials`);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      waiter: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
      cook: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
      cashier: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
      manager: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30';
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30'
      : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              </div>
              <div className="text-green-600 dark:text-green-400 text-xl">✓</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Waiters</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.byRole.waiters}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Cooks</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.byRole.cooks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => updateFilters({ role: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="waiter">Waiters</option>
            <option value="cook">Cooks</option>
            <option value="cashier">Cashiers</option>
            <option value="manager">Managers</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading staff...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center text-gray-600 dark:text-gray-400">
            No staff members found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {staff.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.employeeId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {member.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{member.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.phoneNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* ✅ NEW: View Credentials Button */}
                          <button
                            onClick={() => handleViewCredentials(member._id)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="View Credentials"
                          >
                            <Eye size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleResetPassword(member._id, member.name)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                            title="Reset Password"
                          >
                            <Key size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id, member.name)}
                            disabled={deleting}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {staff.length} of {pagination.total} staff members
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-gray-900 dark:text-white">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => changePage(pagination.currentPage + 1)}
                    disabled={!pagination.hasMore}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <CreateStaffModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(credentials) => {
            setShowCreateModal(false);
            setShowCredentials(credentials);
          }}
        />
      )}

      {/* Credentials Display */}
      {showCredentials && (
        <StaffCredentialsCard
          credentials={showCredentials}
          onClose={() => setShowCredentials(null)}
        />
      )}
    </div>
  );
};

export default StaffManagement;