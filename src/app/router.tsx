import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { DoctorPage } from '../pages/doctors/DoctorPage'
import { DoctorsLayout } from '../pages/doctors/DoctorsLayout'
import { DoctorsPage } from '../pages/doctors/DoctorsPage'
import { LoginPage } from '../pages/login/LoginPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/', element: <App />, children: [
      { index: true, element: <Navigate to="/doctors" replace /> },
      {
        path: 'doctors', element: <DoctorsLayout />, children: [
          { index: true, element: <DoctorsPage /> },
          { path: 'cities', element: <CatalogPage resource="cities" /> },
          { path: 'specialties', element: <CatalogPage resource="specialties" /> },
          { path: 'courses', element: <CatalogPage resource="courses" /> },
        ],
      },
      { path: 'doctors/:id', element: <DoctorPage /> },
      { path: 'reviews', element: <Navigate to="/doctors" replace /> },
      { path: 'cities', element: <Navigate to="/doctors/cities" replace /> },
      { path: 'specialties', element: <Navigate to="/doctors/specialties" replace /> },
      { path: 'courses', element: <Navigate to="/doctors/courses" replace /> },
      { path: 'users', element: <Navigate to="/doctors" replace /> },
    ],
  },
])
