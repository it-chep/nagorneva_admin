import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  title?: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ title = 'Подтвердите действие', description, confirmLabel = 'Удалить', loading, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-text">{description}</p>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Отмена</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
