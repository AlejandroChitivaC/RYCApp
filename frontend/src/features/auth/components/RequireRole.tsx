import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { homePathForRole } from '../roles'
import { useAuthStore } from '../store'

type Props = {
  roles: readonly string[]
  children: ReactNode
  fallbackTo?: string
}

export function RequireRole({ roles, children, fallbackTo }: Props) {
  const user = useAuthStore((s) => s.user)
  const destino = fallbackTo ?? homePathForRole(user?.rol)

  if (!user || !roles.includes(user.rol)) {
    return <Navigate to={destino} replace />
  }

  return <>{children}</>
}
