import { apiRequest } from '../../../shared/api/apiClient'
import { unwrapEntity, unwrapList } from '../../../shared/api/response'
import type { CatalogEntity, CatalogResource, City, Course, Specialty, User } from '../model/types'

const root = '/api/v1/admin'
const collectionPath = (resource: CatalogResource) => `${root}/${resource}/`

function normalizeEntity<T extends CatalogEntity>(entity: T): T {
  const value = entity as unknown as Record<string, unknown>
  const doctorsCount = Number(value.doctors_count ?? value.doctorsCount)
  const siteLink = value.site_link ?? value.siteLink
  return {
    ...entity,
    id: Number(entity.id),
    doctors_count: Number.isFinite(doctorsCount) ? doctorsCount : 0,
    ...(typeof siteLink === 'string' ? { site_link: siteLink } : {}),
  } as T
}

async function list<T extends CatalogEntity>(resource: CatalogResource) {
  const response = await apiRequest<T[] | Record<string, unknown>>(collectionPath(resource))
  return unwrapList<T>(response, resource).map(normalizeEntity)
}

async function create<T extends CatalogEntity>(resource: CatalogResource, key: string, data: Record<string, unknown>) {
  const response = await apiRequest<T | Record<string, unknown>>(collectionPath(resource), { method: 'POST', body: JSON.stringify(data) })
  return normalizeEntity(unwrapEntity<T>(response, key))
}

async function update<T extends CatalogEntity>(resource: CatalogResource, key: string, id: number, data: Record<string, unknown>) {
  const response = await apiRequest<T | Record<string, unknown>>(`${root}/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  return normalizeEntity(unwrapEntity<T>(response, key))
}

async function remove(resource: CatalogResource, id: number) {
  return apiRequest<void>(`${root}/${resource}/${id}`, { method: 'DELETE' })
}

export const catalogService = {
  users: {
    list: () => list<User>('users'),
    create: (data: { email: string; password: string }) => create<User>('users', 'user', data),
    update: (id: number, data: Partial<{ email: string; password: string }>) => update<User>('users', 'user', id, data),
    remove: (id: number) => remove('users', id),
  },
  cities: {
    list: () => list<City>('cities'),
    create: (data: Omit<City, 'id'>) => create<City>('cities', 'city', data),
    update: (id: number, data: Partial<Omit<City, 'id'>>) => update<City>('cities', 'city', id, data),
    remove: (id: number) => remove('cities', id),
  },
  specialties: {
    list: () => list<Specialty>('specialties'),
    create: (data: Omit<Specialty, 'id'>) => create<Specialty>('specialties', 'specialty', data),
    update: (id: number, data: Partial<Omit<Specialty, 'id'>>) => update<Specialty>('specialties', 'specialty', id, data),
    remove: (id: number) => remove('specialties', id),
  },
  courses: {
    list: () => list<Course>('courses'),
    create: (data: Omit<Course, 'id'>) => create<Course>('courses', 'course', data),
    update: (id: number, data: Partial<Omit<Course, 'id'>>) => update<Course>('courses', 'course', id, data),
    remove: (id: number) => remove('courses', id),
  },
}
