import type { City, Specialty } from '../../catalog'

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
