import { apiRequest } from '../../../shared/api/apiClient'
import type { CatalogEntity, CatalogResource, City, Course, Specialty, User } from '../model/types'

const root = '/api/v1/admin'
const collectionPath = (resource: CatalogResource) => `${root}/${resource}/`

async function list<T extends CatalogEntity>(resource: CatalogResource) {
  return apiRequest<T[]>(collectionPath(resource))
}

async function create<T extends CatalogEntity>(resource: CatalogResource, data: Record<string, unknown>) {
  return apiRequest<T>(collectionPath(resource), { method: 'POST', body: JSON.stringify(data) })
}

async function update<T extends CatalogEntity>(resource: CatalogResource, id: number, data: Record<string, unknown>) {
  return apiRequest<T>(`${root}/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

async function remove(resource: CatalogResource, id: number) {
  return apiRequest<void>(`${root}/${resource}/${id}`, { method: 'DELETE' })
}

export const catalogService = {
  users: {
    list: () => list<User>('users'),
    create: (data: { email: string; password: string }) => create<User>('users', data),
    update: (id: number, data: Partial<{ email: string; password: string }>) => update<User>('users', id, data),
    remove: (id: number) => remove('users', id),
  },
  cities: {
    list: () => list<City>('cities'),
    create: (data: Omit<City, 'id'>) => create<City>('cities', data),
    update: (id: number, data: Partial<Omit<City, 'id'>>) => update<City>('cities', id, data),
    remove: (id: number) => remove('cities', id),
  },
  specialties: {
    list: () => list<Specialty>('specialties'),
    create: (data: Omit<Specialty, 'id'>) => create<Specialty>('specialties', data),
    update: (id: number, data: Partial<Omit<Specialty, 'id'>>) => update<Specialty>('specialties', id, data),
    remove: (id: number) => remove('specialties', id),
  },
  courses: {
    list: () => list<Course>('courses'),
    create: (data: Omit<Course, 'id'>) => create<Course>('courses', data),
    update: (id: number, data: Partial<Omit<Course, 'id'>>) => update<Course>('courses', id, data),
    remove: (id: number) => remove('courses', id),
  },
}
