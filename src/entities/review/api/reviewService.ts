import { apiRequest } from '../../../shared/api/apiClient'
import type { Review, ReviewPayload } from '../model/types'

const root = '/api/v1/admin/reviews'

export const reviewService = {
  list: () => apiRequest<Review[]>(`${root}/`),
  get: (id: number) => apiRequest<Review>(`${root}/${id}`),
  create: (payload: ReviewPayload) => apiRequest<Review>(`${root}/`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<ReviewPayload>) => apiRequest<Review>(`${root}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: number) => apiRequest<void>(`${root}/${id}`, { method: 'DELETE' }),
}
