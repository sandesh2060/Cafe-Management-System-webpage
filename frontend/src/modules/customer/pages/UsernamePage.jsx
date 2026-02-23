// File: frontend/src/modules/customer/pages/UsernamePage.jsx
// 📝 CUSTOMER USERNAME PAGE - FIXED ORDER OF OPERATIONS
// ✅ Creates customer FIRST, then session (to satisfy FK requirements)

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowRight, Loader, CheckCircle, Bell, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import axios from '../../../api/axios';

const UsernamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state (passed from LoginPage)
  const { tableId, tableNumber, method, location: geoLocation, distance } = location.state || {};

  // Form state
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [error, setError] = useState('');

  // Refs for animations
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // ============================================
  // REDIRECT IF NO TABLE DATA
  // ============================================
  useEffect(() => {
    if (!tableId || !tableNumber) {
      console.error('❌ No table data found in navigation state');
      toast.error('Please select a table first');
      navigate('/customer/login');
      return;
    }

    console.log('✅ Table data received:', { tableId, tableNumber, method });
  }, [tableId, tableNumber, navigate, method]);

  // ============================================
  // ENTRANCE ANIMATIONS
  // ============================================
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 }
    ).fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.3'
    );
  }, []);

  // ============================================
  // HANDLE SUBMIT - FIXED ORDER: Customer → Session → Waiter
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = username.trim();

    // Validation
    if (!name) {
      setError('Please enter your name');
      toast.error('Please enter your name');
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      toast.error('Name must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('🚀 Starting login flow...');
      console.log('📋 Data:', { name, tableId, tableNumber, method });

      // ========================================
      // STEP 1: CREATE CUSTOMER RECORD FIRST
      // ========================================
      console.log('👤 Step 1: Creating customer record...');

      const customerResponse = await axios.post('/customers', {
        name,
        tableNumber,
        tableId,
        method,
      });

      // ✅ FIXED: Axios interceptor returns response.data, so we're already one level deep
      const customer = customerResponse?.data?.customer || customerResponse?.customer || customerResponse;

      if (!customer || !customer._id) {
        throw new Error('Failed to create customer - no customer ID returned');
      }

      console.log('✅ Customer created:', {
        customerId: customer._id,
        name: customer.name,
      });

      // ========================================
      // STEP 2: CREATE TABLE SESSION (with customer ID)
      // ========================================
      console.log('📍 Step 2: Creating table session...');
      
      const sessionResponse = await axios.post('/table-sessions/start', {
        table: tableId,              // ✅ Changed from tableId to table
        customer: customer._id,       // ✅ Changed from customerId to customer
        tableNumber,
        customerName: name,
        method,
        ...(geoLocation && { location: geoLocation }),
      });

      // ✅ FIXED: Axios interceptor returns response.data, so we're already one level deep
      const session = sessionResponse?.data?.session || sessionResponse?.session || sessionResponse;

      if (!session || !session._id) {
        throw new Error('Failed to create session - no session ID returned');
      }

      console.log('✅ Session created:', {
        sessionId: session._id,
        tableNumber: session.tableNumber,
      });

      // ========================================
      // STEP 3: UPDATE CUSTOMER WITH SESSION ID
      // ========================================
      console.log('🔄 Step 3: Linking customer to session...');

      try {
        await axios.put(`/customers/${customer._id}`, {
          sessionId: session._id,
        });
        console.log('✅ Customer updated with session ID');
      } catch (updateErr) {
        console.warn('⚠️ Failed to update customer with session (non-critical):', updateErr.message);
      }

      // ========================================
      // STEP 4: NOTIFY NEAREST WAITER
      // ========================================
      console.log('🔔 Step 4: Notifying nearest waiter...');
      setNotifying(true);

      try {
        const notificationResponse = await axios.post('/requests/customer-arrived', {
          tableId,
          tableNumber,
          customerId: customer._id,
          customerName: name,
          sessionId: session._id,
          message: `${name} has arrived at Table ${tableNumber}`,
          type: 'customer_arrival',
        });

        // ✅ FIXED: Axios interceptor returns response.data
        const notificationData = notificationResponse?.data || notificationResponse;
        
        console.log('✅ Waiter notified:', notificationData);

        toast.success('Waiter notified! 🔔', {
          position: 'top-center',
          autoClose: 2000,
        });
      } catch (notifyErr) {
        console.warn('⚠️ Waiter notification failed (non-critical):', notifyErr.message);
        // Don't block login if notification fails
      }

      // ========================================
      // STEP 5: STORE SESSION IN LOCALSTORAGE
      // ========================================
      console.log('💾 Step 5: Storing session data...');

      const sessionInfo = {
        customerId: customer._id,
        customerName: name,
        tableId,
        tableNumber,
        sessionId: session._id,
        method,
        loginTime: new Date().toISOString(),
        ...(distance && { distance }),
      };

      localStorage.setItem('customerSession', JSON.stringify(sessionInfo));

      console.log('✅ Session stored in localStorage:', sessionInfo);

      // ========================================
      // STEP 6: SUCCESS - NAVIGATE TO MENU
      // ========================================
      console.log('🎉 Step 6: Login complete! Navigating to menu...');

      toast.success(`Welcome, ${name}! 🎉`, {
        position: 'top-center',
        autoClose: 2000,
      });

      // Small delay for better UX
      setTimeout(() => {
        navigate('/customer/menu', {
          state: {
            customerId: customer._id,
            customerName: name,
            tableId,
            tableNumber,
            sessionId: session._id,
          },
        });
      }, 1500);

    } catch (err) {
      console.error('❌ Login flow error:', err);
      
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to complete login. Please try again.';

      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      setNotifying(false);
    }
  };

  // ============================================
  // HANDLE SKIP (Continue as Guest)
  // ============================================
  const handleSkip = () => {
    setUsername('Guest');
    // Trigger form submit after setting username
    setTimeout(() => {
      formRef.current?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Main Container */}
      <div ref={containerRef} className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Icon */}
          <div className="inline-block relative mb-6">
            <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-r from-brand to-secondary opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-brand to-secondary rounded-full flex items-center justify-center shadow-2xl">
              <User className="w-10 h-10 text-white" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-text-primary mb-3 leading-tight">
            <span className="block">Almost There!</span>
            <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
              What's Your Name?
            </span>
          </h1>

          {/* Table Info Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 rounded-full border-2 border-brand/20 mt-2">
            <CheckCircle className="w-4 h-4 text-brand" />
            <span className="text-sm font-semibold text-text-primary">
              Table {tableNumber}
            </span>
            {distance && (
              <span className="text-xs text-text-secondary">
                ({distance.toFixed(1)}m away)
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-bg-elevated rounded-2xl p-6 border-2 border-brand/20 shadow-xl">
            {/* Input */}
            <label className="block mb-4">
              <span className="text-sm font-semibold text-text-primary mb-2 block">
                Your Name
              </span>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-secondary border-2 border-border focus:border-brand rounded-xl text-text-primary placeholder:text-text-tertiary outline-none transition-all"
                  style={{ fontSize: '16px' }}
                  autoFocus
                  maxLength={50}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                This helps us personalize your experience
              </p>
            </label>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl animate-shake flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-error text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Waiter Notification Status */}
            {notifying && (
              <div className="mb-4 p-4 bg-brand/10 border border-brand/30 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-brand animate-bounce" />
                  <div className="flex-1">
                    <p className="font-medium text-brand text-sm">
                      Notifying waiter...
                    </p>
                    <p className="text-xs text-brand/70">
                      A waiter will be with you shortly
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-brand to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {notifying ? 'Notifying waiter...' : 'Creating session...'}
                </>
              ) : (
                <>
                  Start Ordering
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Skip Button (Guest) */}
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-full mt-3 py-3 text-text-secondary hover:text-brand font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue as Guest
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Bell, text: 'Instant Service', color: 'text-warning' },
            { icon: User, text: 'Personal', color: 'text-brand' },
            { icon: CheckCircle, text: 'Easy Order', color: 'text-success' },
          ].map((feature, idx) => (
            <div key={idx} className="text-center">
              <div
                className={`w-10 h-10 ${feature.color.replace('text-', 'bg-')}/10 rounded-full flex items-center justify-center mx-auto mb-2`}
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <p className="text-xs text-text-tertiary font-medium">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center bg-bg-elevated/60 backdrop-blur-sm rounded-xl p-4 border border-border">
          <p className="text-sm text-text-secondary">
            <span className="font-bold text-brand">Why we ask:</span> Your name
            helps our staff personalize your service! 🌟
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default UsernamePage;