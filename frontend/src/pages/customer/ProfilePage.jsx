// frontend/src/pages/customer/ProfilePage.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit2,
  Save,
  X,
  Lock,
  Bell,
  Heart,
  LogOut,
  ChevronRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    avatar: '👤',
    memberSince: 'January 2023',
    totalOrders: 45,
    loyaltyPoints: 2850,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(userData);
  const containerRef = useRef(null);
  const profileRef = useRef(null);
  const sectionsRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Container fade in
      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Profile card animate
      tl.fromTo(
        profileRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out',
        },
        0.2
      );

      // Sections stagger
      gsap.fromTo(
        sectionsRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionsRef.current,
            start: 'top center+=100',
          },
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleSave = () => {
    gsap.to(profileRef.current, {
      scale: 0.98,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        setUserData(editData);
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-orange-50 to-white"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-orange-100 mt-2">Manage your account and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div
          ref={profileRef}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-red-400 relative">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6">
              {/* Avatar and Info */}
              <div className="flex items-end gap-4">
                <div className="text-7xl bg-white rounded-full p-2 shadow-lg border-4 border-white">
                  {userData.avatar}
                </div>
                <div className="text-white mb-2">
                  <h2 className="text-3xl font-bold">{userData.name}</h2>
                  <p className="text-orange-100">Member since {userData.memberSince}</p>
                </div>
              </div>

              {/* Edit/Save Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition transform hover:scale-105 shadow-lg"
              >
                {isEditing ? (
                  <>
                    <X size={20} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 size={20} />
                    Edit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
                <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-orange-600">{userData.totalOrders}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">Loyalty Points</p>
                <p className="text-3xl font-bold text-blue-600">{userData.loyaltyPoints}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                <p className="text-gray-600 text-sm mb-1">Member Status</p>
                <p className="text-3xl font-bold text-green-600">Gold</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Mail size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{userData.email}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{userData.phone}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Address</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{userData.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings Sections */}
        <div ref={sectionsRef} className="space-y-6">
          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell size={24} className="text-orange-500" />
              <h3 className="text-2xl font-bold text-gray-800">Preferences</h3>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Order notifications', checked: true },
                { label: 'Promotional emails', checked: false },
                { label: 'Weekly offers', checked: true },
                { label: 'SMS updates', checked: false },
              ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <label className="font-semibold text-gray-800 cursor-pointer">
                    {pref.label}
                  </label>
                  <input
                    type="checkbox"
                    defaultChecked={pref.checked}
                    className="w-5 h-5 cursor-pointer accent-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart size={24} className="text-red-500" />
              <h3 className="text-2xl font-bold text-gray-800">Favorite Items</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Margherita Pizza', emoji: '🍕' },
                { name: 'Grilled Salmon', emoji: '🐟' },
                { name: 'Chocolate Cake', emoji: '🍰' },
                { name: 'Iced Coffee', emoji: '☕' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-red-300 transition cursor-pointer"
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600">Quick reorder</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} className="text-blue-500" />
              <h3 className="text-2xl font-bold text-gray-800">Security</h3>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <div>
                  <p className="font-semibold text-gray-800">Change Password</p>
                  <p className="text-xs text-gray-600">Update your password regularly</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <div>
                  <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-600">Add extra security to your account</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <div>
                  <p className="font-semibold text-gray-800">Login Activity</p>
                  <p className="text-xs text-gray-600">View recent login attempts</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 space-y-4">
            <h3 className="text-2xl font-bold text-red-700">Danger Zone</h3>

            <button className="w-full flex items-center justify-between p-4 border border-red-300 rounded-lg hover:bg-red-100 transition text-left">
              <div>
                <p className="font-semibold text-red-700">Logout</p>
                <p className="text-xs text-red-600">Sign out from this device</p>
              </div>
              <LogOut size={20} className="text-red-600" />
            </button>

            <button className="w-full flex items-center justify-between p-4 border border-red-300 rounded-lg hover:bg-red-100 transition text-left">
              <div>
                <p className="font-semibold text-red-700">Delete Account</p>
                <p className="text-xs text-red-600">Permanently delete your account and data</p>
              </div>
              <ChevronRight size={20} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;