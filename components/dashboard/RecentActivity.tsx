import { formatRelativeTime } from '@/lib/utils'
import type { Activity } from '@/lib/types'

interface RecentActivityProps {
  activities: Activity[]
}

const typeConfig = {
  call:              { label: 'Call',       color: 'bg-blue-100 text-blue-600' },
  email:             { label: 'Email',      color: 'bg-purple-100 text-purple-600' },
  meeting:           { label: 'Meeting',    color: 'bg-amber-100 text-amber-600' },
  note:              { label: 'Note',       color: 'bg-slate-100 text-slate-600' },
  deal_stage_change: { label: 'Stage',      color: 'bg-emerald-100 text-emerald-600' },
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="card p-6">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((a) => {
            const cfg = typeConfig[a.type]
            return (
              <li key={a.id} className="flex items-start gap-3">
                <span className={`badge ${cfg.color} mt-0.5 shrink-0`}>{cfg.label}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 truncate">{a.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(a.created_at)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
