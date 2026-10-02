import { apiRequest } from '../../../shared/api/apiClient'
import type { Doctor, DoctorPayload } from '../model/types'
import type { Review } from '../../review'

const root = '/api/v1/admin/doctors'

export const doctorService = {
  list: () => apiRequest<Doctor[]>(`${root}/`),
  get: (id: number) => apiRequest<Doctor>(`${root}/${id}`),
  create: (payload: DoctorPayload) => apiRequest<Doctor>(`${root}/`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<DoctorPayload>) => apiRequest<Doctor>(`${root}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: number) => apiRequest<void>(`${root}/${id}`, { method: 'DELETE' }),
  uploadPhoto: (id: number, photo: File) => {
    const form = new FormData()
    form.append('photo', photo)
    return apiRequest<Doctor>(`${root}/${id}/photo`, { method: 'POST', body: form })
  },
  reviews: (id: number) => apiRequest<Review[]>(`${root}/${id}/reviews`),
}
