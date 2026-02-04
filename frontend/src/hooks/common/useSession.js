// frontend/src/hooks/common/useSession.js
import { useContext } from 'react'
import { SessionContext } from '../../context/SessionContext'

/**
 * useSession Hook
 * Provides session state and methods
 */
export const useSession = () => {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }

  return context
}

export default useSession