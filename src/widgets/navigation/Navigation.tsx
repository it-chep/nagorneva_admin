import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Обзор', icon: '▦', end: true },
  { to: '/doctors', label: 'Врачи', icon: '♟' },
  { to: '/reviews', label: 'Отзывы', icon: '★' },
  { to: '/cities', label: 'Города', icon: '⌖' },
  { to: '/specialties', label: 'Специальности', icon: '✚' },
  { to: '/courses', label: 'Курсы', icon: '▤' },
  { to: '/users', label: 'Пользователи', icon: '◉' },
]

export function Navigation({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const location = useLocation()
  return <nav className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} aria-label="Основная навигация">
    <div className="brand"><div className="brand__mark">N</div>{!collapsed && <div><strong>Nagorneva</strong><span>reviews admin</span></div>}</div>
    <div className="nav-links">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive || (link.to !== '/' && location.pathname.startsWith(link.to)) ? 'nav-link--active' : ''}`}><span className="nav-link__icon">{link.icon}</span>{!collapsed && <span>{link.label}</span>}</NavLink>)}</div>
  </nav>
}
