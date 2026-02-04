// frontend/src/components/common/Loader/Loader.jsx
import React from 'react'
import { Utensils } from 'lucide-react'

const Loader = ({ fullScreen = false, size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            {/* Spinning rings */}
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
              <div className="w-20 h-20 border-4 border-red-200 border-b-red-500 rounded-full" />
            </div>
            
            {/* Icon */}
            <div className="w-20 h-20 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center animate-pulse">
                <Utensils className="text-white" size={20} />
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-gray-600 font-medium">{message}</p>
          
          {/* Loading dots */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin`} />
    </div>
  )
}

export default Loader