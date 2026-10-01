import { Navigate } from 'react-router-dom'
import { homePathForRole } from '../../features/auth/roles'
import { useAuthStore } from '../../features/auth/store'

export function HomeRedirect() {
  const rol = useAuthStore((s) => s.user?.rol)
  return <Navigate to={homePathForRole(rol)} replace />
}
