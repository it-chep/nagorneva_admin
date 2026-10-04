import { apiRequest } from '../../../shared/api/apiClient'
import { unwrapEntity, unwrapList } from '../../../shared/api/response'
import type { Review, ReviewPayload } from '../model/types'

const root = '/api/v1/admin/reviews'

export const reviewService = {
  list: async () => unwrapList<Review>(await apiRequest<Review[] | Record<string, unknown>>(`${root}/`), 'reviews'),
  get: async (id: number) => unwrapEntity<Review>(await apiRequest<Review | Record<string, unknown>>(`${root}/${id}`), 'review'),
  create: async (payload: ReviewPayload) => unwrapEntity<Review>(await apiRequest<Review | Record<string, unknown>>(`${root}/`, { method: 'POST', body: JSON.stringify(payload) }), 'review'),
  update: async (id: number, payload: Partial<ReviewPayload>) => unwrapEntity<Review>(await apiRequest<Review | Record<string, unknown>>(`${root}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }), 'review'),
  remove: (id: number) => apiRequest<void>(`${root}/${id}`, { method: 'DELETE' }),
}
