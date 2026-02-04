import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Suspense } from 'react'

// Redux Store
import store from './redux/store'

// Context Providers
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import { LoyaltyProvider } from './context/LoyaltyContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { SessionProvider } from './context/SessionContext'

// Routes
import AppRoutes from './routes/AppRoutes'

// Components
import Loader from './components/common/Loader/Loader'
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary'

/**
 * Main App Component
 * Clean, light-themed application
 */
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <SessionProvider>
                  <CartProvider>
                    <OrderProvider>
                      <LoyaltyProvider>
                        <Suspense 
                          fallback={
                            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                              </div>
                            </div>
                          }
                        >
                          <div className="app min-h-screen">
                            <AppRoutes />
                          </div>
                        </Suspense>
                      </LoyaltyProvider>
                    </OrderProvider>
                  </CartProvider>
                </SessionProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  )
}

export default App