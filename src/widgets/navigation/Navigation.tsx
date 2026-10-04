import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/doctors', label: 'Врачи', icon: '♟' },
]

export function Navigation({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const location = useLocation()
  return <nav className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} aria-label="Основная навигация">
    <div className="nav-links">{links.map((link) => <NavLink key={link.to} to={link.to} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive || location.pathname.startsWith(link.to) || (link.to === '/doctors' && location.pathname === '/') ? 'nav-link--active' : ''}`}><span className="nav-link__icon">{link.icon}</span>{!collapsed && <span>{link.label}</span>}</NavLink>)}</div>
  </nav>
}
