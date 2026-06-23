'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const TASKS = [
  { type: 'prospecting_call', label: 'Llamada de prospección',     icon: '📞', desc: 'Llamada inicial a prospecto nuevo'         },
  { type: 'followup_call',    label: 'Llamada de seguimiento',      icon: '🔁', desc: 'Seguimiento a prospecto contactado'        },
  { type: 'email',            label: 'Email enviado',               icon: '✉️',  desc: 'Email de presentación o seguimiento'      },
  { type: 'meeting',          label: 'Reunión realizada',           icon: '🤝', desc: 'Demo, presentación o reunión con cliente'  },
  { type: 'proposal',         label: 'Propuesta enviada',           icon: '📄', desc: 'Propuesta formal o cotización enviada'     },
  { type: 'crm',              label: 'CRM actualizado',             icon: '💾', desc: 'Registros y notas actualizados en el CRM'  },
  { type: 'negotiation',      label: 'Negociación activa',          icon: '🤜', desc: 'Avance en negociación de cierre'           },
  { type: 'closing',          label: 'Intento de cierre',           icon: '🏁', desc: 'Solicitud formal de compra realizada'      },
]

interface CheckedMap { [type: string]: boolean }

export default function AgentChecklist() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [checked, setChecked] = useState<CheckedMap>({})
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchChecks = useCallback(async () => {
    const { data } = await supabase
      .from('daily_checks')
      .select('task_type, quantity')
      .eq('check_date', today)
    if (data) {
      const map: CheckedMap = {}
      data.forEach((c) => { map[c.task_type] = c.quantity > 0 })
      setChecked(map)
    }
    setLoading(false)
  }, [supabase, today])

  useEffect(() => { fetchChecks() }, [fetchChecks])

  async function toggle(taskType: string) {
    setToggling(taskType)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newVal = !checked[taskType]

    await supabase.from('daily_checks').upsert(
      {
        user_id: user.id,
        check_date: today,
        task_type: taskType,
        quantity: newVal ? 1 : 0,
      },
      { onConflict: 'user_id,check_date,task_type' }
    )

    setChecked((prev) => ({ ...prev, [taskType]: newVal }))
    setToggling(null)
  }

  const done = TASKS.filter((t) => checked[t.type]).length
  const total = TASKS.length
  const pct = Math.round((done / total) * 100)

  const dateLabel = new Date().toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-500 capitalize">{dateLabel}</p>
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-4xl font-bold text-slate-900">{done}</span>
            <span className="text-xl text-slate-400 font-medium">/{total}</span>
            <p className="text-sm text-slate-500 mt-0.5">gestiones completadas</p>
          </div>
          {done === total && (
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              ¡Día completado!
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }}
          />
        </div>
      </div>

      {/* Checklist */}
      {loading ? (
        <div className="space-y-3">
          {TASKS.map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {TASKS.map((task, idx) => {
            const isDone = !!checked[task.type]
            const isToggling = toggling === task.type

            return (
              <button
                key={task.type}
                onClick={() => toggle(task.type)}
                disabled={isToggling}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left
                  ${isDone
                    ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }
                  ${isToggling ? 'opacity-60' : ''}
                `}
              >
                {/* Number / checkmark */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all
                  ${isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Icon + text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{task.icon}</span>
                    <span className={`font-semibold text-sm ${isDone ? 'text-emerald-800 line-through decoration-emerald-400' : 'text-slate-800'}`}>
                      {task.label}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {task.desc}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {isDone ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Hecho
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 font-medium">Pendiente</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
