import { apiRequest, publicApiRequest } from '../../../shared/api/apiClient'
import { unwrapEntity, unwrapList } from '../../../shared/api/response'
import type { CatalogDoctor, Doctor, DoctorCatalogFilters, DoctorFilterResult, DoctorPayload } from '../model/types'
import { normalizeReview } from '../../review/api/reviewService'
import type { Review } from '../../review'
import type { City, Course, Specialty } from '../../catalog'

const root = '/api/v1/admin/doctors'

type RawDoctor = Record<string, unknown>

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function asNumber(value: unknown): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true'
}

function normalizeCity(value: unknown): City {
  const city = asRecord(value)
  return { id: asNumber(city.id), name: asString(city.name), lat: asNumber(city.lat), lon: asNumber(city.lon), doctors_count: asNumber(city.doctors_count ?? city.doctorsCount) }
}

function normalizeSpecialty(value: unknown): Specialty {
  const specialty = asRecord(value)
  return { id: asNumber(specialty.id), name: asString(specialty.name), doctors_count: asNumber(specialty.doctors_count ?? specialty.doctorsCount) }
}

function normalizeCourse(value: unknown): Course {
  const course = asRecord(value)
  return { id: asNumber(course.id), name: asString(course.name), doctors_count: asNumber(course.doctors_count ?? course.doctorsCount) }
}

function normalizeDoctor(value: Doctor | RawDoctor): Doctor {
  const doctor = asRecord(value)
  return {
    id: asNumber(doctor.id),
    name: asString(doctor.name),
    full_name: asString(doctor.full_name ?? doctor.fullName),
    photo: asString(doctor.photo),
    personal_data_consent: asBoolean(doctor.personal_data_consent ?? doctor.personalDataConsent),
    city: normalizeCity(doctor.city),
    specialty: normalizeSpecialty(doctor.specialty),
    lat: asNumber(doctor.lat),
    lon: asNumber(doctor.lon),
    is_active: asBoolean(doctor.is_active ?? doctor.isActive),
    reviews_count: asNumber(doctor.reviews_count ?? doctor.reviewsCount),
  }
}

function normalizeCatalogDoctor(value: CatalogDoctor | RawDoctor): CatalogDoctor {
  const doctor = asRecord(value)
  const completedCourses = doctor.completed_courses ?? doctor.completedCourses
  const reviewsCount = doctor.reviews_count ?? doctor.reviewsCount
  return {
    id: asNumber(doctor.id),
    name: asString(doctor.name),
    photo: asString(doctor.photo),
    city: normalizeCity(doctor.city),
    specialty: normalizeSpecialty(doctor.specialty),
    completed_courses: Array.isArray(completedCourses) ? completedCourses.map(normalizeCourse) : [],
    is_active: asBoolean(doctor.is_active ?? doctor.isActive),
    personal_data_consent: asBoolean(doctor.personal_data_consent ?? doctor.personalDataConsent),
    ...(reviewsCount !== undefined ? { reviews_count: asNumber(reviewsCount) } : {}),
  }
}

export const doctorService = {
  list: async () => unwrapList<Doctor>(await apiRequest<Doctor[] | Record<string, unknown>>(`${root}/`), 'doctors').map(normalizeDoctor),
  get: async (id: number) => normalizeDoctor(unwrapEntity<Doctor>(await apiRequest<Doctor | Record<string, unknown>>(`${root}/${id}`), 'doctor')),
  create: async (payload: DoctorPayload) => normalizeDoctor(unwrapEntity<Doctor>(await apiRequest<Doctor | Record<string, unknown>>(`${root}/`, { method: 'POST', body: JSON.stringify(payload) }), 'doctor')),
  update: async (id: number, payload: Partial<DoctorPayload>) => normalizeDoctor(unwrapEntity<Doctor>(await apiRequest<Doctor | Record<string, unknown>>(`${root}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }), 'doctor')),
  remove: (id: number) => apiRequest<void>(`${root}/${id}`, { method: 'DELETE' }),
  uploadPhoto: async (id: number, photo: File) => {
    const form = new FormData()
    form.append('photo', photo)
    return normalizeDoctor(unwrapEntity<Doctor>(await apiRequest<Doctor | Record<string, unknown>>(`${root}/${id}/photo`, { method: 'POST', body: form }), 'doctor'))
  },
  reviews: async (id: number) => unwrapList<Review>(await apiRequest<Review[] | Record<string, unknown>>(`${root}/${id}/reviews`), 'reviews').map(normalizeReview),
  filter: async (filters: DoctorCatalogFilters, signal?: AbortSignal): Promise<DoctorFilterResult> => {
    const response = await publicApiRequest<CatalogDoctor[] | Record<string, unknown>>('/api/v1/doctors/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
      signal,
    })
    const doctors = unwrapList<CatalogDoctor>(response, 'doctors').map(normalizeCatalogDoctor)
    const result = asRecord(response)
    return { doctors, doctor_count: Array.isArray(response) ? doctors.length : asNumber(result.doctor_count ?? result.doctorCount) }
  },
}
