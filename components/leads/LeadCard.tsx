import Badge from '@/components/ui/Badge'
import { formatRelativeTime } from '@/lib/utils'
import type { Lead } from '@/lib/types'

const statusVariant = {
  new:          'info',
  contacted:    'warning',
  qualified:    'success',
  unqualified:  'danger',
} as const

const statusLabel = {
  new:          'Nuevo',
  contacted:    'Contactado',
  qualified:    'Calificado',
  unqualified:  'No calificado',
} as const

interface LeadCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
}

export default function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{lead.full_name}</p>
          <p className="text-sm text-slate-500 truncate">{lead.email}</p>
          {lead.company && <p className="text-xs text-slate-400 truncate mt-0.5">{lead.company}</p>}
        </div>
        <Badge variant={statusVariant[lead.status]}>
          {statusLabel[lead.status]}
        </Badge>
      </div>

      {lead.phone && (
        <p className="text-xs text-slate-400 mt-2">📞 {lead.phone}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-400">{formatRelativeTime(lead.created_at)}</p>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(lead)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
