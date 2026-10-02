import { apiRequest } from '../../../shared/api/apiClient'

interface LoginResponse {
  access_token: string
  token_type: string
}

export const authService = {
  login(email: string, password: string) {
    return apiRequest<LoginResponse>('/api/v1/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
}
