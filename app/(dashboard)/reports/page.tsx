export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Reportes' }

const stageLabel: Record<string, string> = {
  prospecting:   'Prospección',
  qualification: 'Calificación',
  proposal:      'Propuesta',
  negotiation:   'Negociación',
  closed_won:    'Ganado',
  closed_lost:   'Perdido',
}

const statusLabel: Record<string, string> = {
  new:         'Nuevo',
  contacted:   'Contactado',
  qualified:   'Calificado',
  unqualified: 'No calificado',
}

const badgeMap: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger' | 'purple'> = {
  new: 'info', contacted: 'warning', qualified: 'success', unqualified: 'danger',
  prospecting: 'default', qualification: 'info', proposal: 'warning',
  negotiation: 'purple', closed_won: 'success', closed_lost: 'danger',
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const [dealsRes, leadsRes, profilesRes, checksRes] = await Promise.all([
    supabase.from('deals').select('stage, value, created_at, assigned_to'),
    supabase.from('leads').select('status, created_at, assigned_to'),
    supabase.from('profiles').select('id, full_name, role').eq('role', 'agent'),
    supabase
      .from('daily_checks')
      .select('user_id, quantity, task_type')
      .eq('check_date', new Date().toISOString().split('T')[0]),
  ])

  const deals = dealsRes.data ?? []
  const leads = leadsRes.data ?? []
  const agents = profilesRes.data ?? []
  const checks = checksRes.data ?? []

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

  // Per-agent performance
  const agentStats = agents.map((agent) => {
    const agentDeals = deals.filter((d) => d.assigned_to === agent.id)
    const agentLeads = leads.filter((l) => l.assigned_to === agent.id)
    const todayChecks = checks.filter((c) => c.user_id === agent.id)
    return {
      id: agent.id,
      full_name: agent.full_name,
      leads: agentLeads.length,
      deals: agentDeals.length,
      won: agentDeals.filter((d) => d.stage === 'closed_won').length,
      revenue: agentDeals.filter((d) => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0),
      gestiones: todayChecks.reduce((s, c) => s + c.quantity, 0),
    }
  })

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
                <Badge variant={badgeMap[status]}>{statusLabel[status]}</Badge>
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
                <Badge variant={badgeMap[stage]}>{stageLabel[stage]}</Badge>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatCurrency(value)}</span>
                  <span className="text-sm font-medium text-slate-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {agentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Agente (hoy)</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 font-semibold text-slate-600">Agente</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-600">Prospectos</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-600">Negocios</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-600">Ganados</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-600">Ingresos</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-600">Gestiones Hoy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {agentStats.sort((a, b) => b.revenue - a.revenue).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-slate-900">{a.full_name}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{a.leads}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{a.deals}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={a.won > 0 ? 'font-bold text-emerald-600' : 'text-slate-300'}>{a.won}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={a.revenue > 0 ? 'font-semibold text-brand-600' : 'text-slate-300'}>
                        {formatCurrency(a.revenue)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        a.gestiones > 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {a.gestiones}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
