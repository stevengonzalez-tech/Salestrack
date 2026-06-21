export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const supabase = await createClient()

  const [dealsRes, leadsRes] = await Promise.all([
    supabase.from('deals').select('stage, value, created_at'),
    supabase.from('leads').select('status, created_at'),
  ])

  const deals = dealsRes.data ?? []
  const leads = leadsRes.data ?? []

  const totalRevenue = deals
    .filter((d) => d.stage === 'closed_won')
    .reduce((s, d) => s + d.value, 0)

  const pipelineValue = deals
    .filter((d) => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((s, d) => s + d.value, 0)

  const winRate = deals.length > 0
    ? Math.round((deals.filter((d) => d.stage === 'closed_won').length / deals.length) * 100)
    : 0

  const leadsByStatus = ['new', 'contacted', 'qualified', 'unqualified'].map((status) => ({
    status,
    count: leads.filter((l) => l.status === status).length,
  }))

  const dealsByStage = [
    'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost',
  ].map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage)
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + d.value, 0),
    }
  })

  const badgeMap: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger' | 'purple'> = {
    new: 'info', contacted: 'warning', qualified: 'success', unqualified: 'danger',
    prospecting: 'default', qualification: 'info', proposal: 'warning',
    negotiation: 'purple', closed_won: 'success', closed_lost: 'danger',
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-sm text-slate-500 mt-1">Resumen de rendimiento de ventas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Ingresos Totales</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Valor del Pipeline</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">{formatCurrency(pipelineValue)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Tasa de Cierre</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{winRate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prospectos por Estado</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {leadsByStatus.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <Badge variant={badgeMap[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: leads.length ? `${(count / leads.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negocios por Etapa</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {dealsByStage.map(({ stage, count, value }) => (
              <div key={stage} className="flex items-center justify-between">
                <Badge variant={badgeMap[stage]}>
                  {stage.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatCurrency(value)}</span>
                  <span className="text-sm font-medium text-slate-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
