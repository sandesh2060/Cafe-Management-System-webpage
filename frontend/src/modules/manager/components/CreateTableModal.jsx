// File: frontend/src/modules/manager/components/CreateTableModal.jsx

import { useState } from 'react';
import { X, MapPin, Users, Radio } from 'lucide-react';
import { useTableManagement } from '../hooks/useTableManagement';

const CreateTableModal = ({ onClose, onSuccess }) => {
  const { createTable, creating } = useTableManagement();
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    longitude: '',
    latitude: '',
    radius: '0.9144', // default = 3ft in metres
    restaurant: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number) {
      newErrors.number = 'Table number is required';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (!formData.longitude || !formData.latitude) {
      newErrors.location = 'Location coordinates are required';
    }

    const lng = parseFloat(formData.longitude);
    const lat = parseFloat(formData.latitude);

    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    const rad = parseFloat(formData.radius);
    if (isNaN(rad) || rad < 0.5 || rad > 50) {
      newErrors.radius = 'Radius must be between 0.5 and 50 metres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const tableData = {
        number: formData.number,
        capacity: parseInt(formData.capacity),
        radius: parseFloat(formData.radius) || 0.9144,
        location: {
          coordinates: [
            parseFloat(formData.longitude),
            parseFloat(formData.latitude)
          ]
        }
      };

      if (formData.restaurant) {
        tableData.restaurant = formData.restaurant;
      }

      console.log('🔄 Submitting table data:', tableData);
      const result = await createTable(tableData);
      console.log('✅ Create result:', result);

      const tableResult = result?.table || result?.data?.table || result;
      const qrCodeImage = result?.qrCodeImage || result?.data?.qrCodeImage || tableResult?.qrCode;

      console.log('📊 Calling onSuccess with:', { table: tableResult, qrCodeImage });

      onSuccess({
        table: tableResult,
        qrCodeImage: qrCodeImage
      });
    } catch (error) {
      console.error('❌ Submit error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            longitude: position.coords.longitude.toFixed(6),
            latitude: position.coords.latitude.toFixed(6)
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  // Helper: convert metres input to feet for display hint
  const metresToFeet = (m) => {
    const val = parseFloat(m);
    if (isNaN(val)) return '';
    return (val * 3.28084).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add New Table
          </h2>
          <button
            onClick={onClose}
            disabled={creating}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Table Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Table Number *
            </label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              disabled={creating}
              className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border ${
                errors.number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              placeholder="e.g., 1, A1, VIP-5"
            />
            {errors.number && (
              <p className="mt-1 text-sm text-red-500">{errors.number}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Capacity (Number of Seats) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="text-gray-400" size={20} />
              </div>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                disabled={creating}
                min="1"
                max="20"
                className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border ${
                  errors.capacity ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                placeholder="4"
              />
            </div>
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>
            )}
          </div>

          {/* Detection Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detection Radius *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Radio className="text-gray-400" size={20} />
              </div>
              <input
                type="number"
                name="radius"
                value={formData.radius}
                onChange={handleChange}
                disabled={creating}
                min="0.5"
                max="50"
                step="0.0001"
                className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border ${
                  errors.radius ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                placeholder="0.9144"
              />
            </div>
            {/* Live ft conversion hint */}
            {formData.radius && !isNaN(parseFloat(formData.radius)) && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                ≈ {metresToFeet(formData.radius)} ft
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              💡 Default is 3 ft (0.9144 m). Tighten for closely packed tables to avoid conflicts.
            </p>
            {errors.radius && (
              <p className="mt-1 text-sm text-red-500">{errors.radius}</p>
            )}
          </div>

          {/* Location Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location Coordinates *
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={creating}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <MapPin size={14} />
                Use Current Location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  disabled={creating}
                  step="0.000001"
                  className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border ${
                    errors.longitude ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                  placeholder="-122.419416"
                />
                {errors.longitude && (
                  <p className="mt-1 text-xs text-red-500">{errors.longitude}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  disabled={creating}
                  step="0.000001"
                  className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border ${
                    errors.latitude ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                  placeholder="37.774929"
                />
                {errors.latitude && (
                  <p className="mt-1 text-xs text-red-500">{errors.latitude}</p>
                )}
              </div>
            </div>

            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              💡 Coordinates help identify table location on the restaurant floor plan.
            </p>
          </div>

          {/* Restaurant ID (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Restaurant ID (Optional)
            </label>
            <input
              type="text"
              name="restaurant"
              value={formData.restaurant}
              onChange={handleChange}
              disabled={creating}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Leave empty for default restaurant"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ A QR code will be automatically generated for this table.
              Customers can scan it to place orders.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Create Table'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTableModal;