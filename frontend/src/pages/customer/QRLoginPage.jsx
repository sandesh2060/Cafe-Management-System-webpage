// frontend/src/pages/customer/QRLoginPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  QrCode, 
  Keyboard, 
  Utensils, 
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Users,
  Clock
} from 'lucide-react'
import QRScanner from '../../components/customer/Auth/QRScanner'
import { useSession } from '../../hooks/common/useSession'

const QRLoginPage = () => {
  const [tableNumber, setTableNumber] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { startSession } = useSession()

  const heroRef = useRef(null)
  const cardRef = useRef(null)
  const featuresRef = useRef(null)

  // Hero Animation
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Animate hero content
    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    )

    // Animate card
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      0.3
    )

    // Animate features
    tl.fromTo(
      featuresRef.current?.children || [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
      0.6
    )

    // Floating animation for decorative elements
    gsap.to('.float-animation', {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [])

  const handleQRScan = async (data) => {
    try {
      // Extract table number from QR data
      const tableId = parseInt(data)
      
      if (tableId > 0 && tableId <= 100) {
        setTableNumber(tableId.toString())
        setError('')
        setScannerOpen(false)
        await handleStartSession(tableId.toString())
      } else {
        setError('Invalid QR code. Please scan a valid table QR code.')
      }
    } catch (err) {
      setError('Failed to read QR code. Please try again.')
    }
  }

  const handleManualEntry = async (e) => {
    e.preventDefault()
    
    if (!tableNumber) {
      setError('Please enter a table number')
      return
    }

    const table = parseInt(tableNumber)
    if (table <= 0 || table > 100) {
      setError('Please enter a valid table number (1-100)')
      return
    }

    await handleStartSession(tableNumber)
  }

  const handleStartSession = async (table) => {
    try {
      setIsLoading(true)
      setError('')

      // Simulate API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 800))

      // Start session
      const sessionData = {
        tableNumber: table,
        sessionId: `SESSION_${Date.now()}`,
        startTime: new Date().toISOString(),
      }

      startSession(sessionData)

      // Animate exit
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          navigate('/customer/menu')
        },
      })
    } catch (err) {
      setError('Failed to start session. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl float-animation" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Utensils className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">DelightDine</h1>
                <p className="text-xs text-gray-600">Premium Dining Experience</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div ref={heroRef} className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles size={16} />
                <span>Welcome to Digital Dining</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Order, Track &<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                  Enjoy
                </span>
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                Scan your table's QR code or enter your table number to get started with our seamless digital menu experience.
              </p>

              {/* Features */}
              <div ref={featuresRef} className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Easy Ordering</p>
                    <p className="text-sm text-gray-600">Browse & order</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Live Tracking</p>
                    <p className="text-sm text-gray-600">Real-time updates</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Social Dining</p>
                    <p className="text-sm text-gray-600">Order together</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Earn Rewards</p>
                    <p className="text-sm text-gray-600">Loyalty points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div ref={cardRef} className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode size={40} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Get Started</h3>
                  <p className="text-orange-100">Select your table to begin ordering</p>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <form onSubmit={handleManualEntry} className="space-y-6">
                    {/* Table Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Table Number
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={tableNumber}
                          onChange={(e) => {
                            setTableNumber(e.target.value)
                            setError('')
                          }}
                          placeholder="Enter your table number"
                          className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition text-lg"
                          disabled={isLoading}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Keyboard size={20} />
                        </div>
                      </div>
                      {error && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full" />
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !tableNumber}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Starting Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ChevronRight size={20} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-500 text-sm font-medium">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* QR Scan Button */}
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    disabled={isLoading}
                    className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:border-gray-300 disabled:text-gray-400 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:cursor-not-allowed"
                  >
                    <QrCode size={20} />
                    <span>Scan Table QR Code</span>
                  </button>
                </div>

                {/* Card Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-8 py-4 text-center">
                  <p className="text-gray-600 text-sm">
                    🔒 Your session will be securely saved to this table
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-700 text-center">
                  💡 <strong>Tip:</strong> Look for the QR code on your table or ask our staff for your table number
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-600 text-sm">
          <p>© 2026 DelightDine. Premium Dining Experience</p>
        </footer>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={scannerOpen}
        onScan={handleQRScan}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  )
}

export default QRLoginPage