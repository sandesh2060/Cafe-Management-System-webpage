// File: frontend/src/shared/components/NotificationToast.jsx

import { useState, useEffect } from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';

const NotificationToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const notification = event.detail;
      
      const toast = {
        id: Date.now(),
        ...notification,
        timestamp: new Date()
      };

      setToasts(prev => [toast, ...prev].slice(0, 5)); // Keep max 5 toasts

      // Auto-remove after 5 seconds (unless urgent)
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          removeToast(toast.id);
        }, 5000);
      }
    };

    window.addEventListener('show-notification-toast', handleShowToast);
    
    return () => {
      window.removeEventListener('show-notification-toast', handleShowToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type, priority) => {
    if (priority === 'urgent' || type === 'alert') {
      return <AlertCircle className="text-red-500" size={24} />;
    }
    if (type === 'order_served' || type === 'success') {
      return <CheckCircle className="text-green-500" size={24} />;
    }
    if (type === 'message' || type === 'announcement') {
      return <Info className="text-blue-500" size={24} />;
    }
    return <Bell className="text-blue-500" size={24} />;
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'normal':
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
        return 'border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getPriorityStyles(toast.priority)} rounded-lg shadow-lg p-4 animate-slide-in-right`}
        >
          <div className="flex items-start gap-3">
            {getIcon(toast.type, toast.priority)}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {toast.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {toast.message}
              </p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;