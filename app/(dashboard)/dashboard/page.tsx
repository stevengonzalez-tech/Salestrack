import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import SalesChart from '@/components/dashboard/SalesChart'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Panel' }

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default async function DashboardPage() {
  const supabase = await createClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const [leadsRes, dealsRes, activitiesRes, wonDealsRes] = await Promise.all([
    supabase.from('leads').select('id, created_at, status'),
    supabase.from('deals').select('id, value, stage, created_at'),
    supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(10),
    supabase
      .from('deals')
      .select('value, created_at')
      .eq('stage', 'closed_won')
      .gte('created_at', sixMonthsAgo.toISOString()),
  ])

  const leads = leadsRes.data ?? []
  const deals = dealsRes.data ?? []
  const activities = activitiesRes.data ?? []
  const wonDeals = wonDealsRes.data ?? []

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const leadsThisMonth = leads.filter((l) => l.created_at >= startOfMonth).length
  const allWon = deals.filter((d) => d.stage === 'closed_won')
  const wonThisMonth = allWon.filter((d) => d.created_at >= startOfMonth)
  const revenueTotal = allWon.reduce((s, d) => s + d.value, 0)
  const revenueThisMonth = wonThisMonth.reduce((s, d) => s + d.value, 0)
  const conversionRate = leads.length > 0
    ? Math.round((allWon.length / leads.length) * 100)
    : 0

  // Build last 6 months chart data from real closed_won deals
  const monthlyMap: Record<string, { revenue: number; deals: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    monthlyMap[key] = { revenue: 0, deals: 0 }
  }
  wonDeals.forEach((deal) => {
    const d = new Date(deal.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += deal.value
      monthlyMap[key].deals += 1
    }
  })
  const chartData = Object.entries(monthlyMap).map(([key, val]) => {
    const [, monthIdx] = key.split('-')
    return { month: MONTH_LABELS[Number(monthIdx)], ...val }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
        <p className="text-sm text-slate-500 mt-1">Bienvenido — aquí está tu resumen de ventas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Prospectos"
          value={leads.length}
          change={leadsThisMonth}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Negocios Activos"
          value={deals.filter((d) => !['closed_won','closed_lost'].includes(d.stage)).length}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatsCard
          title="Ingresos del Mes"
          value={formatCurrency(revenueThisMonth)}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Tasa de Conversión"
          value={`${conversionRate}%`}
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <div>
          <RecentActivity activities={activities} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">Ingresos Totales</p>
          <p className="text-3xl font-bold text-emerald-600">{formatCurrency(revenueTotal)}</p>
          <p className="text-xs text-slate-400 mt-1">Todos los negocios cerrados</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">Pipeline Activo</p>
          <p className="text-3xl font-bold text-brand-600">
            {formatCurrency(deals.filter((d) => !['closed_won','closed_lost'].includes(d.stage)).reduce((s,d) => s+d.value, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">Valor en negociación</p>
        </div>
      </div>
    </div>
  )
}
