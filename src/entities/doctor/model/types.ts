import type { City, Course, Specialty } from '../../catalog'

export interface Doctor {
  id: number
  name: string
  full_name: string
  photo: string
  personal_data_consent: boolean
  city: City
  specialty: Specialty
  lat: number
  lon: number
  is_active: boolean
  reviews_count: number
}

export interface DoctorPayload {
  name: string
  full_name: string
  city_id: number
  specialty_id: number
  lat: number
  lon: number
  personal_data_consent: boolean
  is_active: boolean
}

export interface DoctorCatalogFilters {
  cityIds?: string[]
  specialtyIds?: string[]
  courseIds?: string[]
  isActive?: boolean
  personalDataConsent?: boolean
  reviewsSort?: 'REVIEWS_SORT_DESC' | 'REVIEWS_SORT_ASC'
}

export interface CatalogDoctor {
  id: number
  name: string
  photo: string
  city: City
  specialty: Specialty
  completed_courses: Course[]
  is_active: boolean
  personal_data_consent: boolean
  reviews_count?: number
}

export interface DoctorFilterResult {
  doctors: CatalogDoctor[]
  doctor_count: number
}
