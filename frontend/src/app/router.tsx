import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './shell/AppLayout'
import { HomeRedirect } from './shell/HomeRedirect'
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
import { CostosPage } from '../features/costos/pages/CostosPage'
import { TiposCostoPage } from '../features/costos/pages/TiposCostoPage'
import { OperacionesPage } from '../features/operaciones/pages/OperacionesPage'
import { HistorialOperacionesPage } from '../features/operaciones/pages/HistorialOperacionesPage'
import { TicketsPage } from '../features/tickets/pages/TicketsPage'
import { SiigoConnectionPage } from '../features/siigo/pages/SiigoConnectionPage'
import { RequireRole } from '../features/auth/components/RequireRole'
import {
  ROLES_ADMIN,
  ROLES_ADMIN_CONTADOR,
  ROLES_SIIGO,
  ROLES_TICKETS,
} from '../features/auth/roles'

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
      { path: '/', element: <HomeRedirect /> },
      {
        path: '/dashboard',
        element: (
          <RequireRole roles={ROLES_ADMIN_CONTADOR}>
            <DashboardPage />
          </RequireRole>
        ),
      },
      {
        path: '/lineas-negocio',
        element: (
          <RequireRole roles={ROLES_ADMIN}>
            <LineasNegocioPage />
          </RequireRole>
        ),
      },
      {
        path: '/usuarios',
        element: (
          <RequireRole roles={ROLES_ADMIN}>
            <UsuariosPage />
          </RequireRole>
        ),
      },
      {
        path: '/materiales',
        element: (
          <RequireRole roles={ROLES_ADMIN}>
            <MaterialesPage />
          </RequireRole>
        ),
      },
      {
        path: '/proveedores',
        element: (
          <RequireRole roles={ROLES_ADMIN}>
            <ProveedoresPage />
          </RequireRole>
        ),
      },
      {
        path: '/vehiculos',
        element: (
          <RequireRole roles={ROLES_ADMIN}>
            <VehiculosPage />
          </RequireRole>
        ),
      },
      {
        path: '/costos',
        element: (
          <RequireRole roles={ROLES_ADMIN_CONTADOR}>
            <CostosPage />
          </RequireRole>
        ),
      },
      {
        path: '/tipos-costo',
        element: (
          <RequireRole roles={ROLES_ADMIN}>
            <TiposCostoPage />
          </RequireRole>
        ),
      },
      {
        path: '/operaciones',
        element: (
          <RequireRole roles={ROLES_ADMIN_CONTADOR}>
            <OperacionesPage />
          </RequireRole>
        ),
      },
      {
        path: '/historial-operaciones',
        element: (
          <RequireRole roles={ROLES_ADMIN_CONTADOR}>
            <HistorialOperacionesPage />
          </RequireRole>
        ),
      },
      {
        path: '/tickets',
        element: (
          <RequireRole roles={ROLES_TICKETS}>
            <TicketsPage />
          </RequireRole>
        ),
      },
      {
        path: '/siigo',
        element: (
          <RequireRole roles={ROLES_SIIGO}>
            <SiigoConnectionPage />
          </RequireRole>
        ),
      },
    ],
  },
])
