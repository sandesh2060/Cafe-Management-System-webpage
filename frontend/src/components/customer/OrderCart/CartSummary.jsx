// frontend/src/components/customer/OrderCart/CartSummary.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Check } from 'lucide-react';

const CartSummary = ({ subtotal, discount, tax, total }) => {
  const summaryRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        summaryRef.current?.children,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleCheckout = () => {
    gsap.to(summaryRef.current, {
      scale: 0.98,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  };

  return (
    <div ref={summaryRef} className="bg-gray-50 border-t border-gray-200 p-6 space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between text-sm text-gray-700">
        <span>Subtotal</span>
        <span className="font-semibold">${subtotal.toFixed(2)}</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600 bg-green-50 -mx-6 -mb-1 px-6 py-2">
          <span className="flex items-center gap-1">
            <Check size={16} />
            Discount
          </span>
          <span className="font-semibold">-${discount.toFixed(2)}</span>
        </div>
      )}

      {/* Tax */}
      <div className="flex justify-between text-sm text-gray-700 py-2 border-t border-gray-300">
        <span>Tax (10%)</span>
        <span className="font-semibold">${tax.toFixed(2)}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-3 border-t-2 border-orange-300">
        <span className="text-lg font-bold text-gray-800">Total</span>
        <span className="text-3xl font-bold text-orange-600">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <Check size={20} />
        Proceed to Checkout
      </button>

      {/* Info */}
      <p className="text-xs text-gray-600 text-center pt-2">
        Your order will be confirmed and sent to kitchen
      </p>
    </div>
  );
};

export default CartSummary;