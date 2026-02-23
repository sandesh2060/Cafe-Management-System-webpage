// File: frontend/src/modules/customer/pages/ProfilePage.jsx
// ✅ FIX: Rs. instead of $
// ✅ FIX: Orange/red theme matching MenuPage aesthetic

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, Clock, Gift, Star, LogOut, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { useLoyalty } from '../hooks/useLoyalty';
import { customerAPI, orderAPI } from '../../../api/endpoints';
import { toast } from 'react-toastify';
import ThemeToggle from '../../../shared/components/ThemeToggle';
import { useTheme } from '../../../shared/context/ThemeContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { loyaltyData, fetchLoyaltyData, canClaimReward, loading: loyaltyLoading } = useLoyalty();

  const [session, setSession] = useState({});
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0, completedOrders: 0, totalSpent: 0,
    averageOrderValue: 0, avgRating: 0, visitCount: 0, loyaltyPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getCustomerId = () => {
    const s = JSON.parse(localStorage.getItem('customerSession') || '{}');
    return s.customerId || null;
  };

  const getDisplayName = () =>
    session.customerName || session.username || session.displayName || session.name || 'Guest';

  useEffect(() => {
    const sessionData = JSON.parse(localStorage.getItem('customerSession') || '{}');
    setSession(sessionData);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchLoyaltyData(), fetchUserData()]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast.success('Profile refreshed!', { autoClose: 2000 });
  };

  const fetchUserData = async () => {
    const customerId = getCustomerId();
    if (!customerId) return;

    try {
      const [statsResponse, favoritesResponse, ordersResponse] = await Promise.all([
        customerAPI.getStats(customerId).catch(() => null),
        customerAPI.getFavorites(customerId).catch(() => null),
        orderAPI.getCustomerOrders(customerId, { limit: 3 }).catch(() => null),
      ]);

      if (statsResponse) {
        const statsData = statsResponse?.stats || statsResponse?.data?.stats;
        if (statsData) {
          setStats({
            totalOrders: statsData.totalOrders || 0,
            completedOrders: statsData.completedOrders || 0,
            totalSpent: statsData.totalSpent || 0,
            averageOrderValue: statsData.averageOrderValue || 0,
            avgRating: statsData.avgRating || 0,
            visitCount: statsData.visitCount || 0,
            loyaltyPoints: statsData.loyaltyPoints || 0,
          });
        }
      }

      if (favoritesResponse) {
        const favData = favoritesResponse?.favorites || favoritesResponse?.data?.favorites || [];
        setFavoriteItems(Array.isArray(favData) ? favData.filter(i => i && (i._id || i.id) && i.name) : []);
      }

      if (ordersResponse) {
        const ordersData = ordersResponse?.orders || ordersResponse?.data?.orders;
        setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch user data:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerSession');
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    toast.success('Logged out successfully!');
    navigate('/customer/login');
  };

  // ── Theme tokens — matches MenuPage ────────────────────────────
  const pageBg = isDark
    ? 'bg-[var(--color-bg-primary)]'
    : 'bg-gradient-to-br from-orange-50 via-red-50 to-orange-50';

  const headerBg = isDark
    ? 'bg-[var(--color-bg-elevated)]/95 border-[var(--color-border-primary)]'
    : 'bg-white/95 border-orange-100';

  const cardBg = isDark
    ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]'
    : 'bg-white border-orange-200';

  const rowBg = isDark
    ? 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)]'
    : 'bg-orange-50 hover:bg-orange-100 border-orange-100';

  const textPrimary   = 'text-[var(--color-text-primary)]';
  const textSecondary = 'text-[var(--color-text-secondary)]';
  const textTertiary  = 'text-[var(--color-text-tertiary)]';
  const accentText    = isDark ? 'text-orange-400' : 'text-orange-600';
  const iconBtn       = isDark
    ? 'hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
    : 'hover:bg-orange-100 text-gray-700';

  // Loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen ${pageBg} transition-colors duration-300`}>
        <div className={`sticky top-0 z-40 ${headerBg} backdrop-blur-xl border-b-2 shadow-lg`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${isDark ? 'bg-[var(--color-bg-secondary)]' : 'bg-orange-100'} rounded-xl animate-pulse`} />
              <div className={`h-6 w-24 ${isDark ? 'bg-[var(--color-bg-secondary)]' : 'bg-orange-100'} rounded animate-pulse`} />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${cardBg} border-2 rounded-3xl p-6 animate-pulse`}>
              <div className={`h-6 ${isDark ? 'bg-[var(--color-bg-secondary)]' : 'bg-orange-100'} rounded-2xl w-40 mb-4`} />
              <div className={`h-16 ${isDark ? 'bg-[var(--color-bg-secondary)]' : 'bg-orange-50'} rounded-2xl`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBg} transition-colors duration-300`}>

      {/* ── Header ── */}
      <header className={`sticky top-0 z-40 ${headerBg} backdrop-blur-xl border-b-2 shadow-lg transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/customer/menu')}
                className={`p-2.5 rounded-2xl transition-all ${iconBtn} active:scale-95`}
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2.5 rounded-2xl transition-all ${iconBtn} active:scale-95`}
                aria-label="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* ── Profile Hero Card ── */}
        <div className={`relative overflow-hidden ${cardBg} border-2 rounded-3xl shadow-2xl p-6 sm:p-8 transition-colors duration-300`}>
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-600 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 ring-4 ring-orange-500/20">
              <User className="w-12 h-12 text-white" />
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              <h2 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>
                {getDisplayName()}
              </h2>
              <p className={`text-sm ${textSecondary} mb-5`}>
                {stats.visitCount} {stats.visitCount === 1 ? 'visit' : 'visits'} • Table {session.tableNumber || 'N/A'}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Orders',  value: stats.totalOrders,             color: isDark ? 'from-orange-900/50 border-orange-700 text-orange-400' : 'from-orange-100 border-orange-300 text-orange-700' },
                  { label: 'Spent',   value: `Rs. ${stats.totalSpent.toFixed(0)}`, color: isDark ? 'from-emerald-900/50 border-emerald-700 text-emerald-400' : 'from-emerald-100 border-emerald-300 text-emerald-700' },
                  { label: 'Rating',  value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—',   color: isDark ? 'from-amber-900/50 border-amber-700 text-amber-400' : 'from-amber-100 border-amber-300 text-amber-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`text-center p-3 bg-gradient-to-b ${color} border-2 rounded-2xl`}>
                    <p className="text-lg sm:text-xl font-extrabold flex items-center justify-center gap-1">
                      {label === 'Rating' && stats.avgRating > 0
                        ? <><span>{value}</span><Star className="w-3.5 h-3.5 fill-current" /></>
                        : value}
                    </p>
                    <p className={`text-xs font-semibold ${textSecondary}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Loyalty Card ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-3xl p-6 shadow-2xl shadow-orange-500/30 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Loyalty Progress</h3>
                </div>
                <p className="text-sm text-white/85">
                  {loyaltyData.visits || 0}/10 visits • {loyaltyData.loyaltyPoints || stats.loyaltyPoints || 0} points
                </p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Gift className="w-7 h-7" />
              </div>
            </div>

            <div className="mb-4">
              <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${loyaltyData.currentProgress || 0}%` }}
                />
              </div>
            </div>

            {canClaimReward() ? (
              <button
                onClick={() => navigate('/customer/claim-reward')}
                disabled={loyaltyLoading}
                className="w-full py-3 bg-white text-orange-600 font-bold rounded-2xl hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {loyaltyLoading ? 'Loading...' : '🎁 Claim Your Free Item'}
              </button>
            ) : (
              <p className="text-center text-sm text-white/90">
                {10 - (loyaltyData.visits || 0)} more {10 - (loyaltyData.visits || 0) === 1 ? 'visit' : 'visits'} to your next reward!
              </p>
            )}
          </div>
        </div>

        {/* ── Favorite Items ── */}
        <div className={`${cardBg} border-2 rounded-3xl p-5 sm:p-6 shadow-lg transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              Favorite Items
            </h3>
            <span className={`text-sm font-semibold ${accentText}`}>{favoriteItems.length} items</span>
          </div>

          {favoriteItems.length > 0 ? (
            <div className="space-y-2.5">
              {favoriteItems.slice(0, 3).map((item) => (
                <div
                  key={item._id || item.id}
                  onClick={() => navigate('/customer/menu')}
                  className={`flex items-center gap-3 p-3 ${rowBg} border rounded-2xl cursor-pointer transition-all group`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all">
                    <img
                      src={item.image || '/images/placeholder-food.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={e => { e.target.src = '/images/placeholder-food.jpg'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm ${textPrimary} truncate group-hover:${isDark ? 'text-orange-400' : 'text-orange-600'} transition-colors`}>
                      {item.name}
                    </h4>
                    <p className={`text-xs ${textSecondary} truncate`}>{item.category}</p>
                  </div>
                  {/* ✅ FIX: Rs. not $ */}
                  <span className={`font-bold text-sm ${accentText} flex-shrink-0`}>
                    Rs. {item.price?.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`w-16 h-16 mx-auto mb-3 ${isDark ? 'bg-[var(--color-bg-secondary)]' : 'bg-orange-100'} rounded-2xl flex items-center justify-center`}>
                <Heart className={`w-8 h-8 ${isDark ? 'text-orange-800' : 'text-orange-300'}`} />
              </div>
              <p className={`text-sm ${textSecondary}`}>No favorite items yet</p>
              <p className={`text-xs ${textTertiary} mt-1`}>Start adding items from the menu!</p>
            </div>
          )}

          {favoriteItems.length > 3 && (
            <button
              onClick={() => navigate('/customer/menu')}
              className={`w-full mt-4 py-2.5 ${accentText} font-bold hover:${isDark ? 'bg-orange-900/20' : 'bg-orange-50'} rounded-2xl transition-colors text-sm border-2 ${isDark ? 'border-orange-800' : 'border-orange-200'} hover:border-orange-400`}
            >
              View All Favorites
            </button>
          )}
        </div>

        {/* ── Recent Orders ── */}
        <div className={`${cardBg} border-2 rounded-3xl p-5 sm:p-6 shadow-lg transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              <Clock className={`w-5 h-5 ${accentText}`} />
              Recent Orders
            </h3>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-2.5">
              {recentOrders.map((order) => (
                <div
                  key={order._id || order.id}
                  onClick={() => navigate('/customer/orders', { state: { orderId: order._id || order.id } })}
                  className={`p-3.5 ${rowBg} border rounded-2xl cursor-pointer transition-all group`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold text-sm ${textPrimary} group-hover:${isDark ? 'text-orange-400' : 'text-orange-600'} transition-colors`}>
                      #{order.orderNumber}
                    </span>
                    <span className={`text-xs ${textTertiary}`}>
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textSecondary}`}>{order.items?.length || 0} items</span>
                    {/* ✅ FIX: Rs. not $ */}
                    <span className={`font-bold text-sm ${accentText}`}>
                      Rs. {order.total?.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`w-16 h-16 mx-auto mb-3 ${isDark ? 'bg-[var(--color-bg-secondary)]' : 'bg-orange-100'} rounded-2xl flex items-center justify-center`}>
                <Clock className={`w-8 h-8 ${isDark ? 'text-orange-800' : 'text-orange-300'}`} />
              </div>
              <p className={`text-sm ${textSecondary}`}>No orders yet</p>
              <p className={`text-xs ${textTertiary} mt-1`}>Place your first order to see it here!</p>
            </div>
          )}

          <button
            onClick={() => navigate('/customer/orders')}
            className={`w-full mt-4 py-2.5 ${accentText} font-bold hover:${isDark ? 'bg-orange-900/20' : 'bg-orange-50'} rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 border-2 ${isDark ? 'border-orange-800' : 'border-orange-200'} hover:border-orange-400`}
          >
            View All Orders
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Logout ── */}
        <div className="pb-6">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-red-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;