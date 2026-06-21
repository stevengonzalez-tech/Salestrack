import { classNames } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-slate-100 text-slate-700',
  success:  'bg-emerald-100 text-emerald-700',
  warning:  'bg-amber-100 text-amber-700',
  danger:   'bg-red-100 text-red-700',
  info:     'bg-blue-100 text-blue-700',
  purple:   'bg-purple-100 text-purple-700',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={classNames('badge', variants[variant], className)}>
      {children}
    </span>
  )
}
