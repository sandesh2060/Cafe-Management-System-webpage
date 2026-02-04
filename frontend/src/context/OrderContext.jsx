// frontend/src/context/OrderContext.jsx
import { createContext, useState } from 'react'

export const OrderContext = createContext(null)

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState(null)
  const [orderHistory, setOrderHistory] = useState([])

  const createOrder = (orderData) => {
    setCurrentOrder(orderData)
  }

  const updateOrder = (updates) => {
    setCurrentOrder(prev => ({ ...prev, ...updates }))
  }

  const completeOrder = () => {
    if (currentOrder) {
      setOrderHistory(prev => [currentOrder, ...prev])
      setCurrentOrder(null)
    }
  }

  const cancelOrder = () => {
    setCurrentOrder(null)
  }

  const value = {
    currentOrder,
    orderHistory,
    createOrder,
    updateOrder,
    completeOrder,
    cancelOrder
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export default OrderContext