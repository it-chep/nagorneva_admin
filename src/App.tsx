import { useEffect } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from './entities/auth'
import { showMessage } from './entities/globalMessage'
import { Button } from './shared/ui'
import { useAppDispatch, useAppSelector } from './app/store/store'

export default function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  useEffect(() => {
    const onExpired = () => {
      dispatch(signOut())
      dispatch(showMessage({ type: 'error', text: 'Сессия завершилась. Войдите снова.' }))
    }
    window.addEventListener('nagorneva:auth-expired', onExpired)
    return () => window.removeEventListener('nagorneva:auth-expired', onExpired)
  }, [dispatch])
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <div className="app-shell">
    <header className="app-header">
      <nav className="doctor-tabs" aria-label="Разделы врачей">
        <NavLink end to="/doctors" className={({ isActive }) => isActive ? 'active' : undefined}>Врачи</NavLink>
        <NavLink to="/doctors/cities" className={({ isActive }) => isActive ? 'active' : undefined}>Города врачей</NavLink>
        <NavLink to="/doctors/specialties" className={({ isActive }) => isActive ? 'active' : undefined}>Специальности врачей</NavLink>
        <NavLink to="/doctors/courses" className={({ isActive }) => isActive ? 'active' : undefined}>Курсы</NavLink>
      </nav>
      <Button variant="ghost" onClick={() => { dispatch(signOut()); navigate('/login') }}>Выйти</Button>
    </header>
    <section className="app-body">
      <section className="app-main"><main className="app-content"><Outlet /></main></section>
    </section>
  </div>
}
