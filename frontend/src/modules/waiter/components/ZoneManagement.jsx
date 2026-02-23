// File: frontend/src/modules/waiter/components/ZoneManagement.jsx
// 🌍 PRODUCTION-LEVEL ZONE MANAGEMENT FOR WAITER DASHBOARD

import { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Edit2, Trash2, Eye, Users, Settings, 
  CheckCircle, XCircle, AlertTriangle, Activity, Map
} from 'lucide-react';
import { toast } from 'react-toastify';

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'cafe',
    location: {
      center: {
        latitude: '',
        longitude: ''
      },
      radius: 50,
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      }
    },
    settings: {
      allowLogin: true,
      autoLogout: true,
      logoutGracePeriod: 30,
      requireLocation: true,
      wifiSSID: '',
      maxConcurrentSessions: 100
    },
    status: 'active'
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/zones');
      const data = await response.json();

      if (data.success) {
        setZones(data.data.zones || []);
      }
    } catch (error) {
      console.error('Fetch zones error:', error);
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedZone(null);
    setFormData({
      name: '',
      description: '',
      type: 'cafe',
      location: {
        center: {
          latitude: '',
          longitude: ''
        },
        radius: 50,
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        }
      },
      settings: {
        allowLogin: true,
        autoLogout: true,
        logoutGracePeriod: 30,
        requireLocation: true,
        wifiSSID: '',
        maxConcurrentSessions: 100
      },
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (zone) => {
    setModalMode('edit');
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      type: zone.type,
      location: zone.location,
      settings: zone.settings,
      status: zone.status
    });
    setShowModal(true);
  };

  const handleView = (zone) => {
    setModalMode('view');
    setSelectedZone(zone);
    setShowModal(true);
  };

  const handleDelete = async (zoneId) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;

    try {
      const response = await fetch(`/api/zones/${zoneId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Zone deleted successfully');
        fetchZones();
      } else {
        toast.error(data.message || 'Failed to delete zone');
      }
    } catch (error) {
      console.error('Delete zone error:', error);
      toast.error('Failed to delete zone');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' 
        ? '/api/zones' 
        : `/api/zones/${selectedZone._id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: localStorage.getItem('userId'),
          updatedBy: localStorage.getItem('userId')
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Zone ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
        setShowModal(false);
        fetchZones();
      } else {
        toast.error(data.message || `Failed to ${modalMode} zone`);
      }
    } catch (error) {
      console.error('Submit zone error:', error);
      toast.error(`Failed to ${modalMode} zone`);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              center: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          }));
          toast.success('Location captured!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const getStatusColor = (status) => {
    return {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-gray-600 bg-gray-100',
      maintenance: 'text-yellow-600 bg-yellow-100'
    }[status] || 'text-gray-600 bg-gray-100';
  };

  const getTypeIcon = (type) => {
    return {
      cafe: '☕',
      dining_area: '🍽️',
      terrace: '🌳',
      parking: '🅿️',
      custom: '📍'
    }[type] || '📍';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-emerald-600" />
            Zone Management
          </h1>
          <p className="text-gray-600 mt-1">Manage cafe zones and geofencing</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div
            key={zone._id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Zone Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getTypeIcon(zone.type)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                    <p className="text-sm text-gray-600">{zone.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(zone.status)}`}>
                  {zone.status}
                </span>
              </div>
            </div>

            {/* Zone Stats */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {zone.stats?.activeSessions || 0}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Radius</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {zone.location.radius}m
                  </p>
                </div>
              </div>

              {/* Settings Summary */}
              <div className="mt-4 flex flex-wrap gap-2">
                {zone.settings.allowLogin && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Login OK
                  </span>
                )}
                {zone.settings.autoLogout && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Auto-logout
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <button
                onClick={() => handleView(zone)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => handleEdit(zone)}
                className="flex-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(zone._id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {zones.length === 0 && (
        <div className="text-center py-20">
          <Map className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No zones yet</h3>
          <p className="text-gray-600 mb-6">Create your first zone to start managing cafe areas</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
          >
            Create First Zone
          </button>
        </div>
      )}

      {/* Modal - Create/Edit/View Zone */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' && 'Create New Zone'}
                {modalMode === 'edit' && 'Edit Zone'}
                {modalMode === 'view' && 'Zone Details'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Form will continue in next part */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    disabled={modalMode === 'view'}
                    placeholder="e.g., Main Cafe Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows="3"
                    disabled={modalMode === 'view'}
                    placeholder="Optional description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      disabled={modalMode === 'view'}
                    >
                      <option value="cafe">Cafe</option>
                      <option value="dining_area">Dining Area</option>
                      <option value="terrace">Terrace</option>
                      <option value="parking">Parking</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      disabled={modalMode === 'view'}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Location & Geofencing</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.center.latitude}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          center: {...formData.location.center, latitude: parseFloat(e.target.value)}
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.center.longitude}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          center: {...formData.location.center, longitude: parseFloat(e.target.value)}
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-5 h-5" />
                    Use Current Location
                  </button>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radius (meters) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.location.radius}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: {...formData.location, radius: parseInt(e.target.value)}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={modalMode === 'view'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current radius: {formData.location.radius} meters
                  </p>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Zone Settings</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.allowLogin}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {...formData.settings, allowLogin: e.target.checked}
                      })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      disabled={modalMode === 'view'}
                    />
                    <span className="text-sm font-medium text-gray-700">Allow customer login</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.autoLogout}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {...formData.settings, autoLogout: e.target.checked}
                      })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      disabled={modalMode === 'view'}
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-logout when leaving zone</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.requireLocation}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {...formData.settings, requireLocation: e.target.checked}
                      })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      disabled={modalMode === 'view'}
                    />
                    <span className="text-sm font-medium text-gray-700">Require location permission</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logout Grace Period (seconds)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={formData.settings.logoutGracePeriod}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {...formData.settings, logoutGracePeriod: parseInt(e.target.value)}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Concurrent Sessions
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.settings.maxConcurrentSessions}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {...formData.settings, maxConcurrentSessions: parseInt(e.target.value)}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              {modalMode !== 'view' && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    {modalMode === 'create' ? 'Create Zone' : 'Update Zone'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManagement;