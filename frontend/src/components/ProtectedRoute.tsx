import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}