import { useCallback, useEffect, useMemo, useState } from 'react'
import { catalogService, type Course } from '../../entities/catalog'
import { doctorService, type Doctor } from '../../entities/doctor'
import { reviewService, type Review, type ReviewPayload } from '../../entities/review'
import { setGlobalLoading } from '../../entities/globalLoading'
import { showMessage } from '../../entities/globalMessage'
import { ReviewEditor } from '../../features/review-editor'
import { Button, ConfirmDialog, EmptyState } from '../../shared/ui'
import { useAppDispatch } from '../../app/store/store'

interface ReviewListProps { doctor?: Doctor; compact?: boolean }

export function ReviewList({ doctor, compact = false }: ReviewListProps) {
  const dispatch = useAppDispatch()
  const [reviews, setReviews] = useState<Review[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>(doctor ? [doctor] : [])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [editor, setEditor] = useState<Review | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Review | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [reviewItems, courseItems, doctorItems] = await Promise.all([
        doctor ? doctorService.reviews(doctor.id) : reviewService.list(),
        catalogService.courses.list(),
        doctor ? Promise.resolve([doctor]) : doctorService.list(),
      ])
      setReviews(reviewItems)
      setCourses(courseItems)
      setDoctors(doctorItems)
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось загрузить отзывы' }))
    } finally {
      setLoading(false)
    }
  }, [dispatch, doctor])
  useEffect(() => { void load() }, [load])

  const doctorsById = useMemo(() => new Map(doctors.map((item) => [item.id, item.name])), [doctors])
  const coursesById = useMemo(() => new Map(courses.map((item) => [item.id, item.name])), [courses])
  const save = async (payload: ReviewPayload) => {
    dispatch(setGlobalLoading(true))
    try {
      const saved = editor ? await reviewService.update(editor.id, payload) : await reviewService.create(payload)
      setReviews((items) => editor ? items.map((item) => item.id === saved.id ? { ...item, ...saved } : item) : [saved, ...items])
      dispatch(showMessage({ type: 'success', text: editor ? 'Отзыв обновлён' : 'Отзыв добавлен' }))
    } finally {
      dispatch(setGlobalLoading(false))
    }
  }
  const remove = async () => {
    if (!deleting) return
    setDeletePending(true)
    dispatch(setGlobalLoading(true))
    try {
      await reviewService.remove(deleting.id)
      setReviews((items) => items.filter((review) => review.id !== deleting.id))
      setDeleting(null)
      dispatch(showMessage({ type: 'success', text: 'Отзыв удалён' }))
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось удалить отзыв' }))
    } finally {
      setDeletePending(false)
      dispatch(setGlobalLoading(false))
    }
  }

  return <section className={compact ? 'nested-section' : 'content-section'}>
    <div className="page-toolbar"><div>{!compact && <p className="eyebrow">Контент</p>}<h1>{compact ? 'Отзывы врача' : 'Отзывы'}</h1></div><Button onClick={() => setEditor(null)}>Добавить отзыв</Button></div>
    {loading ? <div className="center-loader"><span className="spinner" /></div> : reviews.length === 0 ? <EmptyState>Отзывов пока нет.</EmptyState> : <div className="table-wrap"><table>
      <thead><tr><th>ID</th>{!doctor && <th>Врач</th>}<th>Курс</th><th>Оценка</th><th>Текст</th><th>Статус</th><th className="table-actions">Действия</th></tr></thead>
      <tbody>{reviews.map((review) => <tr key={review.id}>
        <td className="cell-muted">{review.id}</td>{!doctor && <td>{doctorsById.get(review.doctor_id) ?? `#${review.doctor_id}`}</td>}
        <td>{review.course_name ?? coursesById.get(review.course_id) ?? `#${review.course_id}`}</td><td><span className="rating">★ {review.rating}</span></td><td className="review-text">{review.comment}</td>
        <td><span className={`status ${review.is_active ? 'status--active' : 'status--inactive'}`}>{review.is_active ? 'Опубликован' : 'Скрыт'}</span></td>
        <td className="table-actions"><Button variant="ghost" onClick={() => setEditor(review)}>Изменить</Button><Button variant="ghost" className="button--danger-text" onClick={() => setDeleting(review)}>Удалить</Button></td>
      </tr>)}</tbody>
    </table></div>}
    {editor !== undefined && <ReviewEditor doctors={doctors} courses={courses} review={editor ?? undefined} fixedDoctorId={doctor?.id} onClose={() => setEditor(undefined)} onSave={save} />}
    {deleting && <ConfirmDialog description="Удалить этот отзыв? Это действие нельзя отменить." onCancel={() => setDeleting(null)} onConfirm={() => void remove()} loading={deletePending} />}
  </section>
}
