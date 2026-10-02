import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { DoctorPage } from '../pages/doctors/DoctorPage'
import { DoctorsPage } from '../pages/doctors/DoctorsPage'
import { LoginPage } from '../pages/login/LoginPage'
import { ReviewsPage } from '../pages/reviews/ReviewsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/', element: <App />, children: [
      { index: true, element: <DashboardPage /> },
      { path: 'doctors', element: <DoctorsPage /> },
      { path: 'doctors/:id', element: <DoctorPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'cities', element: <CatalogPage resource="cities" /> },
      { path: 'specialties', element: <CatalogPage resource="specialties" /> },
      { path: 'courses', element: <CatalogPage resource="courses" /> },
      { path: 'users', element: <CatalogPage resource="users" /> },
    ],
  },
])
