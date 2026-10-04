export interface EntityWithId {
  id: number
}

export interface User extends EntityWithId {
  email: string
}

export interface City extends EntityWithId {
  name: string
  lat: number
  lon: number
  doctors_count: number
}

export interface Specialty extends EntityWithId {
  name: string
  doctors_count: number
}

export interface Course extends EntityWithId {
  name: string
  doctors_count: number
  site_link: string
}

export type CatalogResource = 'users' | 'cities' | 'specialties' | 'courses'
export type CatalogEntity = User | City | Specialty | Course
