import { classNames } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'amber'
}

const colors = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   badge: 'text-blue-700 bg-blue-100' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'text-emerald-700 bg-emerald-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'text-purple-700 bg-purple-100' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  badge: 'text-amber-700 bg-amber-100' },
}

export default function StatsCard({ title, value, change, icon, color = 'blue' }: StatsCardProps) {
  const c = colors[color]
  const isPositive = change !== undefined && change >= 0

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={classNames(
              'text-xs mt-2 font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-500'
            )}>
              {isPositive ? '+' : ''}{change}% vs last month
            </p>
          )}
        </div>
        <div className={classNames('p-3 rounded-xl', c.bg)}>
          <span className={c.icon}>{icon}</span>
        </div>
      </div>
    </div>
  )
}
