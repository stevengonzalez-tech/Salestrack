'use client'

import { formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Deal, DealStage } from '@/lib/types'

const stages: { key: DealStage; label: string }[] = [
  { key: 'prospecting',   label: 'Prospecting' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'proposal',      label: 'Proposal' },
  { key: 'negotiation',   label: 'Negotiation' },
  { key: 'closed_won',    label: 'Won' },
  { key: 'closed_lost',   label: 'Lost' },
]

const stageColor: Record<DealStage, 'default' | 'info' | 'warning' | 'purple' | 'success' | 'danger'> = {
  prospecting:   'default',
  qualification: 'info',
  proposal:      'warning',
  negotiation:   'purple',
  closed_won:    'success',
  closed_lost:   'danger',
}

interface KanbanBoardProps {
  deals: Deal[]
  onEdit: (deal: Deal) => void
  onStageChange: (id: string, stage: DealStage) => void
}

export default function KanbanBoard({ deals, onEdit, onStageChange }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.key)
        const total = stageDeals.reduce((sum, d) => sum + d.value, 0)

        return (
          <div key={stage.key} className="w-64 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant={stageColor[stage.key]}>{stage.label}</Badge>
                <span className="text-xs text-slate-400 font-medium">{stageDeals.length}</span>
              </div>
              {total > 0 && (
                <span className="text-xs font-semibold text-slate-600">{formatCurrency(total)}</span>
              )}
            </div>

            <div className="space-y-3 min-h-[200px]">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onEdit(deal)}
                >
                  <p className="font-medium text-sm text-slate-900 truncate">{deal.title}</p>
                  <p className="text-lg font-bold text-brand-600 mt-1">{formatCurrency(deal.value)}</p>
                  {deal.expected_close_date && (
                    <p className="text-xs text-slate-400 mt-2">
                      Closes {new Date(deal.expected_close_date).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {stages
                      .filter((s) => s.key !== stage.key)
                      .slice(0, 3)
                      .map((s) => (
                        <button
                          key={s.key}
                          onClick={(e) => { e.stopPropagation(); onStageChange(deal.id, s.key) }}
                          className="text-xs text-slate-400 hover:text-brand-600 transition-colors"
                        >
                          → {s.label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
