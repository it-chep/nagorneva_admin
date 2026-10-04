import { Link } from 'react-router-dom'

const cards = [
  { to: '/doctors', title: 'Врачи', description: 'Карточки, координаты, фотографии и согласия на обработку данных.', icon: '♟' },
  { to: '/reviews', title: 'Отзывы', description: 'Управление текстами, рейтингами, курсами и публикацией отзывов.', icon: '★' },
  { to: '/cities', title: 'Справочники', description: 'Города, специальности, курсы и учётные записи администраторов.', icon: '⌖' },
]

export function DashboardPage() {
  return <section className="content-section dashboard"><div className="dashboard-hero"><h1>Панель управления</h1><p>Все сущности из административного API доступны в одном интерфейсе. Изменения отправляются в Go-сервис сразу после сохранения.</p></div><div className="dashboard-grid">{cards.map((card) => <Link key={card.to} className="dashboard-card" to={card.to}><span className="dashboard-card__icon">{card.icon}</span><div><h2>{card.title}</h2><p>{card.description}</p><span className="dashboard-card__action">Открыть →</span></div></Link>)}</div><div className="hint-box"><strong>Порядок заполнения.</strong> Сначала создайте города, специальности и курсы, затем добавляйте врачей и отзывы. Так в формах будут доступны нужные варианты.</div></section>
}
