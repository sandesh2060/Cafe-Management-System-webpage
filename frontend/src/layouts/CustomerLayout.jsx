// frontend/src/layouts/CustomerLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'

const CustomerLayout = () => {
  return (
    <div className="customer-layout min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Outlet />
    </div>
  )
}

export default CustomerLayout