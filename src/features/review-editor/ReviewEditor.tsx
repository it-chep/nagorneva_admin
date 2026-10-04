import { useEffect, useState, type FormEvent } from 'react'
import type { Course } from '../../entities/catalog'
import type { Doctor } from '../../entities/doctor'
import type { Review, ReviewPayload } from '../../entities/review'
import { Button, Modal, Select, TextArea, Toggle } from '../../shared/ui'

interface ReviewEditorProps {
  doctors: Doctor[]
  courses: Course[]
  review?: Review
  fixedDoctorId?: number
  onClose: () => void
  onSave: (payload: ReviewPayload) => Promise<void>
}

interface FormState { doctor_id: string; course_id: string; rating: string; comment: string; is_active: boolean }
function initial(review?: Review, fixedDoctorId?: number): FormState {
  return { doctor_id: String(fixedDoctorId ?? review?.doctor_id ?? ''), course_id: String(review?.course_id ?? ''), rating: String(review?.rating ?? 5), comment: review?.comment ?? '', is_active: review?.is_active ?? true }
}

export function ReviewEditor({ doctors, courses, review, fixedDoctorId, onClose, onSave }: ReviewEditorProps) {
  const [form, setForm] = useState(() => initial(review, fixedDoctorId))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const isEdit = Boolean(review)
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))
  useEffect(() => setForm(initial(review, fixedDoctorId)), [review, fixedDoctorId])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const doctorId = Number(form.doctor_id)
    const courseId = Number(form.course_id)
    const rating = Number(form.rating)
    if (!Number.isInteger(doctorId) || !Number.isInteger(courseId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || !form.comment.trim()) {
      setError('Выберите врача и курс, добавьте текст и рейтинг от 1 до 5')
      return
    }
    setPending(true)
    setError('')
    try {
      await onSave({ doctor_id: doctorId, course_id: courseId, rating, comment: form.comment.trim(), is_active: form.is_active })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить отзыв')
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Изменить отзыв' : 'Добавить отзыв'} onClose={onClose} wide>
      <form className="form-grid" onSubmit={onSubmit}>
        <div className="form-grid form-grid--two">
          <Select label="Врач" value={form.doctor_id} onChange={(value) => update('doctor_id', value)} disabled={Boolean(fixedDoctorId)} required>
            <option value="">Выберите врача</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · #{doctor.id}</option>)}
          </Select>
          <Select label="Курс" value={form.course_id} onChange={(value) => update('course_id', value)} required>
            <option value="">Выберите курс</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </Select>
        </div>
        <Select label="Оценка" value={form.rating} onChange={(value) => update('rating', value)} required>
          {[1, 2, 3, 4, 5].map((rating) => <option value={rating} key={rating}>{rating} из 5</option>)}
        </Select>
        <TextArea label="Текст отзыва" rows={5} value={form.comment} onChange={(event) => update('comment', event.target.value)} required />
        <Toggle label="Показывать в публичной выдаче" checked={form.is_active} onChange={(value) => update('is_active', value)} />
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions"><Button variant="secondary" type="button" onClick={onClose} disabled={pending}>Отмена</Button><Button type="submit" loading={pending}>{isEdit ? 'Сохранить' : 'Добавить отзыв'}</Button></div>
      </form>
    </Modal>
  )
}
