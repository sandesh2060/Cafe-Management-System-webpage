// File: frontend/src/modules/waiter/components/CustomerRequests.jsx
// 🔔 CUSTOMER REQUESTS COMPONENT - Display and manage customer assistance requests
// ✅ Real-time notifications, priority sorting, quick actions

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, Users, Clock, CheckCircle, XCircle, 
  AlertCircle, MessageSquare, ArrowRight 
} from 'lucide-react';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import waiterService from '../services/waiterService';
import { getRelativeTime } from '@/shared/utils/formatters';

const CustomerRequests = ({ waiterId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'all'
  
  const requestCardsRef = useRef([]);

  /**
   * Fetch customer requests
   */
  const fetchRequests = async () => {
    if (!waiterId) return;

    try {
      setLoading(true);
      const response = await waiterService.getCustomerRequests(waiterId, {
        status: filter === 'pending' ? 'pending' : undefined
      });

      const requestsList = response.requests || response.data?.requests || [];
      setRequests(requestsList);
    } catch (error) {
      console.error('❌ Fetch requests error:', error);
      // Don't show error toast if endpoint doesn't exist
      if (error.status !== 404) {
        toast.error('Failed to load customer requests');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark request as completed
   */
  const handleComplete = async (requestId) => {
    try {
      await waiterService.completeRequest(requestId, waiterId);
      
      // Remove from list or update status
      setRequests(prev => 
        prev.filter(r => r._id !== requestId && r.id !== requestId)
      );
      
      toast.success('Request completed! 🎉');
    } catch (error) {
      console.error('❌ Complete request error:', error);
      toast.error('Failed to complete request');
    }
  };

  /**
   * Acknowledge request
   */
  const handleAcknowledge = async (requestId) => {
    try {
      await waiterService.acknowledgeRequest(requestId, waiterId);
      
      // Update request status
      setRequests(prev =>
        prev.map(r =>
          (r._id === requestId || r.id === requestId)
            ? { ...r, acknowledged: true, acknowledgedAt: new Date() }
            : r
        )
      );
      
      toast.success('Request acknowledged');
    } catch (error) {
      console.error('❌ Acknowledge request error:', error);
      toast.error('Failed to acknowledge request');
    }
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[priority] || colors.medium;
  };

  /**
   * Get request type icon
   */
  const getRequestIcon = (type) => {
    const icons = {
      assistance: Bell,
      bill: Users,
      complaint: AlertCircle,
      refill: Clock,
      other: MessageSquare,
    };
    return icons[type] || Bell;
  };

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchRequests();
  }, [waiterId, filter]);

  /**
   * Auto-refresh every 30 seconds
   */
  useEffect(() => {
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [waiterId, filter]);

  /**
   * Animate request cards
   */
  useEffect(() => {
    if (!loading && requestCardsRef.current.length > 0) {
      gsap.from(requestCardsRef.current, {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  }, [loading, requests.length]);

  // Loading state
  if (loading) {
    return (
      <div className="mt-6 bg-bg-elevated rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Customer Requests
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-bg-secondary rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-bg-tertiary rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter pending requests
  const filteredRequests = filter === 'pending' 
    ? requests.filter(r => r.status === 'pending' || !r.completed)
    : requests;

  // Sort by priority and time
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority] || 2;
    const bPriority = priorityOrder[b.priority] || 2;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="mt-6 bg-bg-elevated rounded-2xl p-6 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Customer Requests
            </h2>
            <p className="text-sm text-text-tertiary">
              {sortedRequests.length} {filter === 'pending' ? 'pending' : 'total'} request{sortedRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'pending'
                ? 'bg-brand text-white shadow-lg'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-brand text-white shadow-lg'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Requests List */}
      {sortedRequests.length === 0 ? (
        <div className="text-center py-12 bg-bg-secondary rounded-xl">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            All Clear! 🎉
          </h3>
          <p className="text-sm text-text-secondary">
            No pending customer requests
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRequests.map((request, index) => {
            const requestId = request._id || request.id;
            const RequestIcon = getRequestIcon(request.type);
            const isUrgent = request.priority === 'urgent';
            const isAcknowledged = request.acknowledged;

            return (
              <div
                key={requestId}
                ref={el => requestCardsRef.current[index] = el}
                className={`
                  relative bg-bg-secondary rounded-xl p-4 border-2 transition-all
                  ${isUrgent 
                    ? 'border-error shadow-lg shadow-error/20 animate-pulse-slow' 
                    : 'border-transparent hover:border-brand/30'
                  }
                `}
              >
                {/* Urgent Indicator */}
                {isUrgent && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-error rounded-full animate-ping" />
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isUrgent ? 'bg-error/10' : 'bg-brand/10'
                  }`}>
                    <RequestIcon className={`w-6 h-6 ${
                      isUrgent ? 'text-error' : 'text-brand'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          Table {request.tableNumber}
                        </h3>
                        <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {getRelativeTime(request.createdAt)}
                        </p>
                      </div>

                      {/* Priority Badge */}
                      <span className={`px-3 py-1 rounded-lg font-semibold text-xs border ${getPriorityColor(request.priority)}`}>
                        {request.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="mb-3">
                      <p className="text-sm text-text-primary">
                        {request.message || `${request.type} request from table ${request.tableNumber}`}
                      </p>
                      
                      {request.details && (
                        <p className="text-xs text-text-tertiary mt-1">
                          {request.details}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!isAcknowledged && (
                        <button
                          onClick={() => handleAcknowledge(requestId)}
                          className="px-4 py-2 bg-info/10 hover:bg-info/20 text-info rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Acknowledge
                        </button>
                      )}

                      <button
                        onClick={() => handleComplete(requestId)}
                        className="px-4 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>

                      <button
                        onClick={() => window.location.href = `/waiter/tables?table=${request.tableId}`}
                        className="px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Go to Table
                      </button>
                    </div>

                    {/* Acknowledged Badge */}
                    {isAcknowledged && (
                      <div className="mt-2 text-xs text-success flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Acknowledged {request.acknowledgedAt && `• ${getRelativeTime(request.acknowledgedAt)}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerRequests;