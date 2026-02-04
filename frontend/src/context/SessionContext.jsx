// frontend/src/context/SessionContext.jsx
import { createContext, useState } from 'react'

export const SessionContext = createContext(null)

export const SessionProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(null)
  const [tableNumber, setTableNumber] = useState(null)

  const startSession = (sessionData) => {
    setActiveSession(sessionData)
    setTableNumber(sessionData.tableNumber)
  }

  const endSession = () => {
    setActiveSession(null)
    setTableNumber(null)
  }

  const updateSession = (updates) => {
    setActiveSession(prev => ({ ...prev, ...updates }))
  }

  const value = {
    activeSession,
    tableNumber,
    startSession,
    endSession,
    updateSession
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export default SessionContext