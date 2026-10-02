import { useParams } from 'react-router-dom'
import { DoctorCard } from '../../widgets/doctor-card'
import { EmptyState } from '../../shared/ui'

export function DoctorPage() {
  const doctorId = Number(useParams().id)
  if (!Number.isSafeInteger(doctorId) || doctorId <= 0) return <EmptyState>Некорректный идентификатор врача.</EmptyState>
  return <DoctorCard doctorId={doctorId} />
}
