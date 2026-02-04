// frontend/src/components/customer/OrderCart/CartItem.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const itemRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        itemRef.current,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const itemTotal = (item.price * item.quantity).toFixed(2);

  return (
    <div
      ref={itemRef}
      className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition"
    >
      {/* Image */}
      <div className="text-3xl flex-shrink-0">{item.image}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
        <p className="text-orange-600 font-bold text-sm">${itemTotal}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.id, -1)}
          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
        >
          -
        </button>
        <span className="px-2 font-semibold text-sm">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.id, 1)}
          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="ml-2 px-2 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded text-sm font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CartItem;