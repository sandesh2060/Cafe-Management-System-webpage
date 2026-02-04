// frontend/src/components/customer/MenuItem/CustomizationPanel.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChefHat } from 'lucide-react';

const CustomizationPanel = ({ item, onCustomizationChange }) => {
  const [customizations, setCustomizations] = useState({});
  const panelRef = useRef(null);

  const customizationOptions = {
    spiceLevel: [
      { id: 'mild', label: 'Mild', icon: '🟢' },
      { id: 'medium', label: 'Medium', icon: '🟡' },
      { id: 'hot', label: 'Hot', icon: '🔴' },
      { id: 'extra_hot', label: 'Extra Hot', icon: '🌶️' },
    ],
    dressing: [
      { id: 'oil_vinegar', label: 'Oil & Vinegar' },
      { id: 'ranch', label: 'Ranch' },
      { id: 'lemon', label: 'Lemon' },
      { id: 'garlic', label: 'Garlic Parmesan' },
    ],
    extras: [
      { id: 'extra_cheese', label: 'Extra Cheese', price: 1.5 },
      { id: 'bacon', label: 'Bacon Bits', price: 2.0 },
      { id: 'avocado', label: 'Avocado', price: 1.5 },
      { id: 'egg', label: 'Extra Egg', price: 1.0 },
    ],
    allergies: [
      { id: 'no_nuts', label: 'No Nuts' },
      { id: 'no_dairy', label: 'No Dairy' },
      { id: 'no_gluten', label: 'No Gluten' },
      { id: 'vegan', label: 'Vegan' },
    ],
  };

  useGSAP(
    () => {
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current?.children,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
          }
        );
      }
    },
    { revertOnUpdate: true }
  );

  const handleCustomizationChange = (category, value, isToggle = false) => {
    const updated = { ...customizations };

    if (isToggle) {
      if (updated[category]?.includes(value)) {
        updated[category] = updated[category].filter((v) => v !== value);
      } else {
        updated[category] = [...(updated[category] || []), value];
      }
    } else {
      updated[category] = value;
    }

    setCustomizations(updated);
    onCustomizationChange(updated);
  };

  return (
    <div ref={panelRef} className="space-y-6 border-t border-b border-gray-200 py-6">
      {/* Spice Level */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <ChefHat size={20} className="text-orange-500" />
          Spice Level
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {customizationOptions.spiceLevel.map((option) => (
            <button
              key={option.id}
              onClick={() =>
                handleCustomizationChange('spiceLevel', option.id)
              }
              className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                customizations.spiceLevel === option.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dressing (if applicable) */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Dressing Preference</h3>
        <div className="grid grid-cols-2 gap-2">
          {customizationOptions.dressing.map((option) => (
            <button
              key={option.id}
              onClick={() =>
                handleCustomizationChange('dressing', option.id)
              }
              className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                customizations.dressing === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Add Extras</h3>
        <div className="grid grid-cols-2 gap-2">
          {customizationOptions.extras.map((option) => (
            <button
              key={option.id}
              onClick={() =>
                handleCustomizationChange('extras', option.id, true)
              }
              className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                customizations.extras?.includes(option.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div>{option.label}</div>
              <span className="text-xs text-gray-600">+${option.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Allergies & Preferences</h3>
        <div className="grid grid-cols-2 gap-2">
          {customizationOptions.allergies.map((option) => (
            <button
              key={option.id}
              onClick={() =>
                handleCustomizationChange('allergies', option.id, true)
              }
              className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                customizations.allergies?.includes(option.id)
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      <div>
        <label className="font-bold text-gray-800 block mb-2">
          Special Instructions
        </label>
        <textarea
          placeholder="E.g., Extra sauce on the side, no onions, etc."
          onChange={(e) =>
            handleCustomizationChange('instructions', e.target.value)
          }
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-none text-sm"
          rows="3"
        />
      </div>
    </div>
  );
};

export default CustomizationPanel;