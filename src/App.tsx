import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from './entities/auth'
import { showMessage } from './entities/globalMessage'
import { Button } from './shared/ui'
import { useAppDispatch, useAppSelector } from './app/store/store'
import { Navigation } from './widgets/navigation'

const titles: Array<[string, string]> = [['/doctors', 'Врачи'], ['/reviews', 'Отзывы'], ['/cities', 'Города'], ['/specialties', 'Специальности'], ['/courses', 'Курсы'], ['/users', 'Пользователи']]

export default function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [collapsed, setCollapsed] = useState(false)
  const title = titles.find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Обзор'
  useEffect(() => {
    const onExpired = () => {
      dispatch(signOut())
      dispatch(showMessage({ type: 'error', text: 'Сессия завершилась. Войдите снова.' }))
    }
    window.addEventListener('nagorneva:auth-expired', onExpired)
    return () => window.removeEventListener('nagorneva:auth-expired', onExpired)
  }, [dispatch])
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <div className="app-shell"><Navigation collapsed={collapsed} onNavigate={() => undefined} /><section className="app-main"><header className="app-header"><div className="app-header__left"><button className="menu-button" onClick={() => setCollapsed((value) => !value)} aria-label="Свернуть меню"><span /><span /><span /></button><span className="app-header__title">{title}</span></div><Button variant="ghost" onClick={() => { dispatch(signOut()); navigate('/login') }}>Выйти</Button></header><main className="app-content"><Outlet /></main></section></div>
}
