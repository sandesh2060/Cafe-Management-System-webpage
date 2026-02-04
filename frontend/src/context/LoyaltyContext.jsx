// frontend/src/context/LoyaltyContext.jsx
import { createContext, useState } from 'react'

export const LoyaltyContext = createContext(null)

export const LoyaltyProvider = ({ children }) => {
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [rewardsHistory, setRewardsHistory] = useState([])

  const addPoints = (points) => {
    setLoyaltyPoints(prev => prev + points)
  }

  const redeemPoints = (points, reward) => {
    if (loyaltyPoints >= points) {
      setLoyaltyPoints(prev => prev - points)
      setRewardsHistory(prev => [...prev, { ...reward, redeemedAt: new Date() }])
      return true
    }
    return false
  }

  const value = {
    loyaltyPoints,
    rewardsHistory,
    addPoints,
    redeemPoints
  }

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
}

export default LoyaltyContext