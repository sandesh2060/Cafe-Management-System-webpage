// frontend/src/components/customer/OrderCart/OrderCart.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

gsap.registerPlugin(ScrollTrigger);

const OrderCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Margherita Pizza',
      price: 12.99,
      quantity: 2,
      image: '🍕',
      customizations: { spiceLevel: 'medium' },
    },
    {
      id: 2,
      name: 'Grilled Salmon',
      price: 18.99,
      quantity: 1,
      image: '🐟',
      customizations: {},
    },
  ]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const containerRef = useRef(null);
  const itemsRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleQuantityChange = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );

    gsap.fromTo(
      `[data-item-id="${id}"]`,
      { scale: 0.95 },
      {
        scale: 1,
        duration: 0.3,
        ease: 'back.out',
      }
    );
  };

  const handleRemoveItem = (id) => {
    gsap.to(`[data-item-id="${id}"]`, {
      opacity: 0,
      x: 100,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
      },
    });
  };

  const handleApplyPromo = () => {
    if (promoCode === 'SAVE10') {
      setDiscount(0.1);
      gsap.to('[data-discount]', {
        duration: 0.4,
        ease: 'elastic.out',
      });
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = subtotal * discount;
  const tax = (subtotal - discountAmount) * 0.1;
  const total = subtotal - discountAmount + tax;

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full sticky top-4"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart size={24} />
          <h2 className="text-2xl font-bold">Your Order</h2>
        </div>
        <p className="text-orange-100">Items: {cartItems.length}</p>
      </div>

      {/* Items */}
      <div
        ref={itemsRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
      >
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div
              key={item.id}
              data-item-id={item.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-orange-300 transition"
            >
              <div className="flex gap-3">
                {/* Image */}
                <div className="text-4xl flex-shrink-0">{item.image}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {item.name}
                  </h4>
                  <p className="text-orange-600 font-bold text-sm my-1">
                    ${item.price}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 font-semibold text-gray-800 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Customizations */}
              {Object.keys(item.customizations).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600">
                  {Object.entries(item.customizations).map(([key, value]) => (
                    <p key={key}>
                      <span className="font-semibold capitalize">{key}:</span>{' '}
                      {value}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>Your cart is empty</p>
          </div>
        )}
      </div>

      {/* Promo Code */}
      {cartItems.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleApplyPromo}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition transform hover:scale-105"
            >
              Apply
            </button>
          </div>
          {discount > 0 && (
            <p className="text-xs text-green-600 mt-2 font-semibold">
              ✓ Promo applied! Save ${discountAmount.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Summary */}
      {cartItems.length > 0 && (
        <CartSummary
          subtotal={subtotal}
          discount={discountAmount}
          tax={tax}
          total={total}
        />
      )}
    </div>
  );
};

export default OrderCart;