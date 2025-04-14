import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading indicator while checking auth status
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Render outlet (child routes) if authenticated
  return <Outlet />
}

export default ProtectedRoute
