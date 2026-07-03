import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './shell/AppLayout'
import { RequireAuth } from '../features/auth/components/RequireAuth'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { LineasNegocioPage } from '../features/lineasNegocio/pages/LineasNegocioPage'
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage'
import { MaterialesPage } from '../features/materiales/pages/MaterialesPage'
import { ProveedoresPage } from '../features/proveedores/pages/ProveedoresPage'
import { VehiculosPage } from '../features/vehiculos/pages/VehiculosPage'
import { OperacionesPage } from '../features/operaciones/pages/OperacionesPage'
import { HistorialOperacionesPage } from '../features/operaciones/pages/HistorialOperacionesPage'
import { TicketsPage } from '../features/tickets/pages/TicketsPage'
import { RequireRole } from '../features/auth/components/RequireRole'
import { ROLES_CONSULTA_HISTORIAL, ROLES_TICKETS_CARGA, ROLES_TICKETS_CONSULTA } from '../features/auth/roles'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  { path: '/verificar-correo', element: <VerifyEmailPage /> },
  { path: '/recuperar-contrasena', element: <ForgotPasswordPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/lineas-negocio', element: <LineasNegocioPage /> },
      { path: '/usuarios', element: <UsuariosPage /> },
      { path: '/materiales', element: <MaterialesPage /> },
      { path: '/proveedores', element: <ProveedoresPage /> },
      { path: '/vehiculos', element: <VehiculosPage /> },
      { path: '/operaciones', element: <OperacionesPage /> },
      {
        path: '/historial-operaciones',
        element: (
          <RequireRole roles={ROLES_CONSULTA_HISTORIAL}>
            <HistorialOperacionesPage />
          </RequireRole>
        ),
      },
      {
        path: '/tickets',
        element: (
          <RequireRole roles={[...ROLES_TICKETS_CARGA, ...ROLES_TICKETS_CONSULTA]}>
            <TicketsPage />
          </RequireRole>
        ),
      },
    ],
  },
])
