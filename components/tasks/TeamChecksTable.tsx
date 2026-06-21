'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AgentRow {
  user_id: string
  full_name: string
  email: string
  llamada: number
  email_count: number
  reunion: number
  seguimiento: number
  propuesta: number
  crm: number
  total: number
}

export default function TeamChecksTable() {
  const supabase = createClient()
  const [rows, setRows] = useState<AgentRow[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  const fetchTeamChecks = useCallback(async () => {
    setLoading(true)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')

    const { data: checks } = await supabase
      .from('daily_checks')
      .select('user_id, task_type, quantity')
      .eq('check_date', date)

    if (!profiles) { setLoading(false); return }

    const agents = profiles.filter((p) => p.role === 'agent')
    const checkMap: Record<string, Record<string, number>> = {}
    ;(checks ?? []).forEach((c) => {
      if (!checkMap[c.user_id]) checkMap[c.user_id] = {}
      checkMap[c.user_id][c.task_type] = c.quantity
    })

    const result: AgentRow[] = agents.map((a) => {
      const m = checkMap[a.id] ?? {}
      return {
        user_id: a.id,
        full_name: a.full_name,
        email: a.email,
        llamada: m['llamada'] ?? 0,
        email_count: m['email'] ?? 0,
        reunion: m['reunion'] ?? 0,
        seguimiento: m['seguimiento'] ?? 0,
        propuesta: m['propuesta'] ?? 0,
        crm: m['crm'] ?? 0,
        total: Object.values(m).reduce((s, v) => s + v, 0),
      }
    })

    setRows(result)
    setLoading(false)
  }, [supabase, date])

  useEffect(() => { fetchTeamChecks() }, [fetchTeamChecks])

  const colHeaders = [
    { key: 'llamada',     label: 'Llamadas', icon: '📞' },
    { key: 'email_count', label: 'Emails',   icon: '✉️'  },
    { key: 'reunion',     label: 'Reuniones',icon: '🤝' },
    { key: 'seguimiento', label: 'Seguimientos', icon: '🔄' },
    { key: 'propuesta',   label: 'Propuestas',icon: '📄' },
    { key: 'crm',         label: 'CRM',      icon: '💾' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Gestiones del Equipo</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input w-auto text-sm py-1.5"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Agente</th>
                {colHeaders.map((h) => (
                  <th key={h.key} className="text-center px-3 py-3 font-semibold text-slate-600">
                    <span className="hidden sm:inline">{h.icon} </span>{h.label}
                  </th>
                ))}
                <th className="text-center px-3 py-3 font-semibold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No hay agentes registrados aún
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.user_id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{row.full_name}</p>
                      <p className="text-xs text-slate-400">{row.email}</p>
                    </td>
                    {colHeaders.map((h) => {
                      const val = row[h.key as keyof AgentRow] as number
                      return (
                        <td key={h.key} className="px-3 py-3 text-center">
                          <span className={`font-semibold ${val > 0 ? 'text-brand-600' : 'text-slate-300'}`}>
                            {val}
                          </span>
                        </td>
                      )
                    })}
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        row.total > 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {row.total}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
