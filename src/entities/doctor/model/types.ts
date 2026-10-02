export interface Doctor {
  id: number
  name: string
  full_name: string
  photo: string
  personal_data_consent: boolean
  city_id: number
  specialty_id: number
  lat: number
  lon: number
  is_active: boolean
}

export type DoctorPayload = Omit<Doctor, 'id' | 'photo'>
