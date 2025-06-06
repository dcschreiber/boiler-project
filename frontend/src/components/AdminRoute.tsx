import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function AdminRoute() {
  const { isAdmin } = useAuthStore()

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />
}