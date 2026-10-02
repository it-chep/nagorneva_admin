import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="button__spinner" />}
      {children}
    </button>
  )
}
