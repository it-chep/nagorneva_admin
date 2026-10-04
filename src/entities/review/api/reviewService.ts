import { apiRequest } from '../../../shared/api/apiClient'
import { unwrapEntity, unwrapList } from '../../../shared/api/response'
import type { Review, ReviewPayload } from '../model/types'

const root = '/api/v1/admin/reviews'

type RawReview = Record<string, unknown>

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

export function normalizeReview(value: Review | RawReview): Review {
  const review = asRecord(value)
  const createdAt = asString(review.created_at ?? review.createdAt)
  const courseName = asString(review.course_name ?? review.courseName)

  return {
    id: asNumber(review.id),
    doctor_id: asNumber(review.doctor_id ?? review.doctorId),
    rating: asNumber(review.rating),
    comment: asString(review.comment),
    course_id: asNumber(review.course_id ?? review.courseId),
    created_at: createdAt || undefined,
    is_active: asBoolean(review.is_active ?? review.isActive),
    course_name: courseName || undefined,
  }
}

export const reviewService = {
  list: async () => unwrapList<Review>(await apiRequest<Review[] | Record<string, unknown>>(`${root}/`), 'reviews').map(normalizeReview),
  get: async (id: number) => normalizeReview(unwrapEntity<Review>(await apiRequest<Review | Record<string, unknown>>(`${root}/${id}`), 'review')),
  create: async (payload: ReviewPayload) => normalizeReview(unwrapEntity<Review>(await apiRequest<Review | Record<string, unknown>>(`${root}/`, { method: 'POST', body: JSON.stringify(payload) }), 'review')),
  update: async (id: number, payload: Partial<ReviewPayload>) => normalizeReview(unwrapEntity<Review>(await apiRequest<Review | Record<string, unknown>>(`${root}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }), 'review')),
  remove: (id: number) => apiRequest<void>(`${root}/${id}`, { method: 'DELETE' }),
}
