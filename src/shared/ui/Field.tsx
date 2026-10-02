import type { ChangeEventHandler, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  label: string
  hint?: string
  children: ReactNode
}

function FieldShell({ label, hint, children }: FieldShellProps) {
  return <label className="field"><span className="field__label">{label}</span>{children}{hint && <span className="field__hint">{hint}</span>}</label>
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; onValueChange?: ChangeEventHandler<HTMLInputElement> }
export function TextField({ label, hint, onValueChange, ...props }: TextFieldProps) {
  return <FieldShell label={label} hint={hint}><input className="input" onChange={onValueChange} {...props} /></FieldShell>
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }
export function TextArea({ label, hint, ...props }: TextAreaProps) {
  return <FieldShell label={label} hint={hint}><textarea className="input textarea" {...props} /></FieldShell>
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string }
export function Select({ label, hint, children, ...props }: SelectProps) {
  return <FieldShell label={label} hint={hint}><select className="input" {...props}>{children}</select></FieldShell>
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  hint?: string
}
export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <button className={`toggle ${checked ? 'toggle--on' : ''}`} type="button" onClick={() => onChange(!checked)} aria-pressed={checked}>
        <span />{checked ? 'Да' : 'Нет'}
      </button>
    </FieldShell>
  )
}
