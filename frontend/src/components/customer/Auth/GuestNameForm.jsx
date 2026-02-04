// frontend/src/components/customer/Auth/GuestNameForm.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button/Button';

const GuestNameForm = ({ onConfirm, onBack }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        formRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    gsap.to(formRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => onConfirm(name.trim()),
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          As a guest, you can place orders but won't earn loyalty points. Consider registering for exclusive rewards!
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <ArrowLeft size={20} />
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
        >
          Continue as Guest
        </Button>
      </div>
    </form>
  );
};

export default GuestNameForm;