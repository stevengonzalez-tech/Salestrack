'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Activity } from '@/lib/types'

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  call:              { label: 'Llamada',          icon: '📞', color: 'bg-blue-100 text-blue-700'   },
  email:             { label: 'Email',             icon: '✉️',  color: 'bg-indigo-100 text-indigo-700' },
  meeting:           { label: 'Reunión',           icon: '🤝', color: 'bg-purple-100 text-purple-700' },
  note:              { label: 'Nota',              icon: '📝', color: 'bg-slate-100 text-slate-700'  },
  deal_stage_change: { label: 'Cambio de etapa',  icon: '🔄', color: 'bg-amber-100 text-amber-700'  },
}

interface ActivityTimelineProps {
  entityType: 'lead' | 'deal' | 'contact'
  entityId: string
}

export default function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
  const supabase = createClient()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'call', description: '' })
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
    setActivities((data as Activity[]) ?? [])
    setLoading(false)
  }, [supabase, entityType, entityId])

  useEffect(() => { fetch() }, [fetch])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('activities').insert({
      type: form.type,
      description: form.description,
      entity_type: entityType,
      entity_id: entityId,
      performed_by: user.id,
    })
    setForm({ type: 'call', description: '' })
    setShowForm(false)
    await fetch()
    setSaving(false)
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">Historial de actividades</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          {showForm ? 'Cancelar' : '+ Registrar actividad'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2 bg-slate-50 rounded-lg p-3">
          <select
            className="input text-sm py-1.5"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="call">📞 Llamada</option>
            <option value="email">✉️ Email</option>
            <option value="meeting">🤝 Reunión</option>
            <option value="note">📝 Nota</option>
          </select>
          <textarea
            className="input text-sm resize-none min-h-[60px]"
            placeholder="Descripción de la actividad…"
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-1.5 px-3"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Sin actividades registradas</p>
      ) : (
        <div className="space-y-2">
          {activities.map((act) => {
            const cfg = typeConfig[act.type] ?? typeConfig.note
            return (
              <div key={act.id} className="flex gap-3 items-start">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">{act.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(act.created_at).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
