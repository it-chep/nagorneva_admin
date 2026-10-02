import { Navigate } from 'react-router-dom'
import { LoginForm } from '../../features/auth/login'
import { useAppSelector } from '../../app/store/store'

export function LoginPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <main className="login-page"><section className="login-card"><LoginForm /></section></main>
}
