import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store'

type Props = {
  roles: readonly string[]
  children: ReactNode
  fallbackTo?: string
}

export function RequireRole({ roles, children, fallbackTo = '/dashboard' }: Props) {
  const user = useAuthStore((s) => s.user)

  if (!user || !roles.includes(user.rol)) {
    return <Navigate to={fallbackTo} replace />
  }

  return <>{children}</>
}
