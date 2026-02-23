// ============================================
// FILE: frontend/src/App.jsx
// 🎯 MAIN APP COMPONENT
// ✅ Redux Provider + Session Restoration + Routes
// ✅ FIX: Toast theme now matches app theme (no more white overlay in dark mode)
// ✅ FIX: Toast position moved to bottom-center (avoids fixed header collision)
// ============================================

import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider, useTheme } from './shared/context/ThemeContext';
import store from './store/store';
import { restoreSession } from './store/slices/authSlice';
import './styles/globals.css';

// Wrapper component to access dispatch inside Provider
function AppContent() {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Restore session from localStorage on app mount
  useEffect(() => {
    console.log('🔄 Restoring session from localStorage...');
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <AppRoutes />

        {/* Global Toast Notifications */}
        <ToastContainer
          position="bottom-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          // ✅ FIX: Match toast theme to current app theme
          // "light" theme in dark mode = white toast on dark page = looks like white screen
          theme={theme === 'dark' ? 'dark' : 'colored'}
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
          style={{ zIndex: 99999 }}
        />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      {/* ✅ ThemeProvider wraps AppContent so useTheme() works inside it */}
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;