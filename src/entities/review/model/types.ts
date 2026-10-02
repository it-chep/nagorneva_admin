export interface Review {
  id: number
  doctor_id: number
  rating: number
  comment: string
  course_id: number
  created_at?: string
  is_active: boolean
  course_name?: string
}

export type ReviewPayload = Omit<Review, 'id' | 'created_at' | 'course_name'>
