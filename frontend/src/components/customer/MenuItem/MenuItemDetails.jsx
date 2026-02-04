// frontend/src/components/customer/MenuItem/MenuItemDetails.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { X, Flame, Clock, Users } from 'lucide-react';
import CustomizationPanel from './CustomizationPanel';

const MenuItemDetails = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState({});
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      // Backdrop fade in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        }
      );

      // Content slide in
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'back.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleClose = () => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: 'back.in',
      onComplete: onClose,
    });
  };

  const handleAddToCart = () => {
    gsap.to(contentRef.current, {
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        onAddToCart({
          ...item,
          quantity,
          customizations,
        });
        handleClose();
      },
    });
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex items-center justify-between text-white z-10">
          <h2 className="text-2xl font-bold">{item.name}</h2>
          <button
            onClick={handleClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl h-64 flex items-center justify-center">
            <span className="text-9xl">{item.image}</span>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-700 text-lg mb-4">{item.desc}</p>

            {/* Item Info */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
              {item.popular && (
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800">Popular</p>
                  </div>
                </div>
              )}
              {item.prepTime && (
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Prep Time</p>
                    <p className="font-semibold text-gray-800">{item.prepTime}</p>
                  </div>
                </div>
              )}
              {item.servings && (
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Servings</p>
                    <p className="font-semibold text-gray-800">{item.servings}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customizations */}
          <CustomizationPanel
            item={item}
            onCustomizationChange={setCustomizations}
          />

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-800">Quantity:</span>
            <div className="flex items-center border-2 border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-6 py-2 font-bold text-gray-800 border-l border-r border-gray-300">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 border-2 border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Price per item:</span>
              <span className="font-semibold text-gray-800">
                ${item.price}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold text-gray-800">{quantity}x</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between text-lg">
              <span className="font-bold text-gray-800">Total:</span>
              <span className="font-bold text-orange-600">
                ${(item.price * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
            >
              Add to Cart - ${(item.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetails;