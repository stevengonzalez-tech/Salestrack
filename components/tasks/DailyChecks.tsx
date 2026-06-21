'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TaskDef {
  type: string
  label: string
  icon: string
  color: string
}

const TASK_DEFS: TaskDef[] = [
  { type: 'llamada',      label: 'Llamadas realizadas',       icon: '📞', color: 'blue'   },
  { type: 'email',        label: 'Emails enviados',           icon: '✉️',  color: 'indigo' },
  { type: 'reunion',      label: 'Reuniones realizadas',      icon: '🤝', color: 'purple' },
  { type: 'seguimiento',  label: 'Seguimientos realizados',   icon: '🔄', color: 'amber'  },
  { type: 'propuesta',    label: 'Propuestas enviadas',       icon: '📄', color: 'green'  },
  { type: 'crm',          label: 'Registros CRM actualizados',icon: '💾', color: 'slate'  },
]

const colorClasses: Record<string, { bg: string; text: string; ring: string; btn: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200',   btn: 'bg-blue-600 hover:bg-blue-700'   },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200', btn: 'bg-purple-600 hover:bg-purple-700' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'ring-amber-200',  btn: 'bg-amber-500 hover:bg-amber-600'  },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  ring: 'ring-green-200',  btn: 'bg-green-600 hover:bg-green-700'  },
  slate:  { bg: 'bg-slate-50',  text: 'text-slate-700',  ring: 'ring-slate-200',  btn: 'bg-slate-600 hover:bg-slate-700'  },
}

interface Check {
  id: string
  task_type: string
  quantity: number
  notes: string | null
}

export default function DailyChecks() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [checks, setChecks] = useState<Record<string, Check>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const fetchChecks = useCallback(async () => {
    const { data } = await supabase
      .from('daily_checks')
      .select('id, task_type, quantity, notes')
      .eq('check_date', today)
    if (data) {
      const map: Record<string, Check> = {}
      data.forEach((c) => { map[c.task_type] = c })
      setChecks(map)
    }
    setLoading(false)
  }, [supabase, today])

  useEffect(() => { fetchChecks() }, [fetchChecks])

  async function upsert(taskType: string, quantity: number) {
    setSaving((s) => ({ ...s, [taskType]: true }))
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('daily_checks').upsert(
      { user_id: user.id, check_date: today, task_type: taskType, quantity },
      { onConflict: 'user_id,check_date,task_type' }
    )
    await fetchChecks()
    setSaving((s) => ({ ...s, [taskType]: false }))
  }

  const totalCompleted = TASK_DEFS.filter((t) => (checks[t.type]?.quantity ?? 0) > 0).length
  const totalTasks = TASK_DEFS.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Gestiones del Día</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-600">{totalCompleted}/{totalTasks}</p>
          <p className="text-xs text-slate-500">tareas registradas</p>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-brand-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(totalCompleted / totalTasks) * 100}%` }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {TASK_DEFS.map((t) => (
            <div key={t.type} className="card p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {TASK_DEFS.map((task) => {
            const check = checks[task.type]
            const qty = check?.quantity ?? 0
            const c = colorClasses[task.color]
            const done = qty > 0

            return (
              <div
                key={task.type}
                className={`card p-5 ring-1 transition-all ${done ? `${c.bg} ${c.ring}` : 'ring-slate-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{task.icon}</span>
                    <span className={`text-sm font-medium ${done ? c.text : 'text-slate-600'}`}>
                      {task.label}
                    </span>
                  </div>
                  {done && (
                    <span className={`text-xs font-bold ${c.text} ${c.bg} px-2 py-0.5 rounded-full`}>
                      ✓ {qty}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    disabled={saving[task.type] || qty <= 0}
                    onClick={() => upsert(task.type, Math.max(0, qty - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 text-lg font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-xl font-bold text-slate-800">{qty}</span>
                  <button
                    disabled={saving[task.type]}
                    onClick={() => upsert(task.type, qty + 1)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg font-bold transition-colors ${c.btn}`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
