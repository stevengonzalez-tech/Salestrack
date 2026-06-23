'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

const TASKS = [
  { type: 'prospecting_call', label: 'Prospección',  icon: '📞' },
  { type: 'followup_call',    label: 'Seguimiento',  icon: '🔁' },
  { type: 'email',            label: 'Email',        icon: '✉️'  },
  { type: 'meeting',          label: 'Reunión',      icon: '🤝' },
  { type: 'proposal',         label: 'Propuesta',    icon: '📄' },
  { type: 'crm',              label: 'CRM',          icon: '💾' },
  { type: 'negotiation',      label: 'Negociación',  icon: '🤜' },
  { type: 'closing',          label: 'Cierre',       icon: '🏁' },
]

interface AgentProgress {
  id: string
  full_name: string
  email: string
  checks: Record<string, boolean>
  done: number
}

export default function TeamProgressBoard() {
  const supabase = createClient()
  const [agents, setAgents] = useState<AgentProgress[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)

    const [profilesRes, checksRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role'),
      supabase.from('daily_checks').select('user_id, task_type, quantity').eq('check_date', date),
    ])

    const profiles = (profilesRes.data ?? []).filter((p) => p.role === 'agent')
    const checks = checksRes.data ?? []

    const checkMap: Record<string, Record<string, boolean>> = {}
    checks.forEach((c) => {
      if (!checkMap[c.user_id]) checkMap[c.user_id] = {}
      checkMap[c.user_id][c.task_type] = c.quantity > 0
    })

    const result: AgentProgress[] = profiles.map((p) => {
      const agentChecks = checkMap[p.id] ?? {}
      const done = TASKS.filter((t) => agentChecks[t.type]).length
      return { id: p.id, full_name: p.full_name, email: p.email, checks: agentChecks, done }
    })

    // Sort by most progress first
    result.sort((a, b) => b.done - a.done)
    setAgents(result)
    setLoading(false)
  }, [supabase, date])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh every 30s to show real-time progress
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const total = TASKS.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Progreso del Equipo</h2>
          <p className="text-xs text-slate-400 mt-0.5">Se actualiza cada 30 segundos</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input w-auto text-sm py-1.5"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">
          No hay agentes registrados aún
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => {
            const pct = Math.round((agent.done / total) * 100)
            const allDone = agent.done === total

            return (
              <div
                key={agent.id}
                className={`card p-4 transition-all ${allDone ? 'ring-2 ring-emerald-300 bg-emerald-50' : ''}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    allDone ? 'bg-emerald-500 text-white' : 'bg-brand-600 text-white'
                  }`}>
                    {allDone ? '✓' : getInitials(agent.full_name)}
                  </div>

                  {/* Name + progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-900 truncate">{agent.full_name}</p>
                      <span className={`text-sm font-bold ml-2 shrink-0 ${allDone ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {agent.done}/{total}
                      </span>
                    </div>
                    <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: allDone
                            ? 'linear-gradient(90deg, #10b981, #059669)'
                            : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Task grid */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {TASKS.map((task) => {
                    const done = !!agent.checks[task.type]
                    return (
                      <div
                        key={task.type}
                        title={task.label}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-all ${
                          done
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <span>{task.icon}</span>
                        <span className="hidden sm:inline">{task.label}</span>
                        {done && <span className="text-emerald-500">✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {agents.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{agents.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Agentes</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {agents.filter((a) => a.done === total).length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Al día completo</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-brand-600">
              {Math.round(agents.reduce((s, a) => s + a.done, 0) / agents.length * 10) / 10}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Promedio tareas</p>
          </div>
        </div>
      )}
    </div>
  )
}
