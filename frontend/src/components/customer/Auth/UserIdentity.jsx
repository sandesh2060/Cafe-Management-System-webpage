// frontend/src/components/customer/Auth/UserIdentity.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { User, LogIn, UserPlus } from 'lucide-react';
import RegisteredUserLogin from './RegisteredUserLogin';
import GuestNameForm from './GuestNameForm';
import QuickRegister from './QuickRegister';
import Button from '@/components/common/Button/Button';

const UserIdentity = ({ onConfirm }) => {
  const [mode, setMode] = useState('select'); // select -> guest -> registered -> register
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleModeChange = (newMode) => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => setMode(newMode),
    });
  };

  const animateSuccess = (callback) => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: callback,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Who are you?</h1>
          <p className="text-orange-100">Help us personalize your experience</p>
        </div>

        {/* Content */}
        <div ref={contentRef} className="p-8">
          {mode === 'select' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleModeChange('guest')}
                className="p-6 border-2 border-orange-200 hover:border-orange-500 rounded-xl transition group cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-full flex items-center justify-center transition">
                    <User size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Guest User</h3>
                    <p className="text-sm text-gray-600 mt-1">Quick and easy</p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleModeChange('registered')}
                className="p-6 border-2 border-blue-200 hover:border-blue-500 rounded-xl transition group cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition">
                    <LogIn size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Existing User</h3>
                    <p className="text-sm text-gray-600 mt-1">Login to account</p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleModeChange('register')}
                className="p-6 border-2 border-green-200 hover:border-green-500 rounded-xl transition group cursor-pointer md:col-span-2"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition">
                    <UserPlus size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">New User</h3>
                    <p className="text-sm text-gray-600 mt-1">Create account for loyalty rewards</p>
                  </div>
                </div>
              </Button>
            </div>
          )}

          {mode === 'guest' && (
            <GuestNameForm
              onConfirm={(name) => {
                animateSuccess(() => onConfirm({ type: 'guest', name }));
              }}
              onBack={() => handleModeChange('select')}
            />
          )}

          {mode === 'registered' && (
            <RegisteredUserLogin
              onConfirm={(user) => {
                animateSuccess(() => onConfirm({ type: 'registered', user }));
              }}
              onBack={() => handleModeChange('select')}
              onRegister={() => handleModeChange('register')}
            />
          )}

          {mode === 'register' && (
            <QuickRegister
              onConfirm={(user) => {
                animateSuccess(() => onConfirm({ type: 'registered', user }));
              }}
              onBack={() => handleModeChange('select')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserIdentity;