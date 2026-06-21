'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ActivityTimeline from '@/components/activities/ActivityTimeline'
import type { Deal, DealStage } from '@/lib/types'

interface DealFormProps {
  initial?: Partial<Deal>
  onSubmit: (data: Partial<Deal>) => Promise<void>
  onCancel: () => void
}

export default function DealForm({ initial, onSubmit, onCancel }: DealFormProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    value: initial?.value ?? 0,
    stage: (initial?.stage ?? 'prospecting') as DealStage,
    expected_close_date: initial?.expected_close_date ?? '',
    notes: initial?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ ...form, value: Number(form.value) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Título del negocio" required value={form.title}
        onChange={(e) => update('title', e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Valor ($)" type="number" min={0} required value={form.value}
          onChange={(e) => update('value', e.target.value)} />
        <div>
          <label className="label">Etapa</label>
          <select className="input" value={form.stage} onChange={(e) => update('stage', e.target.value)}>
            <option value="prospecting">Prospección</option>
            <option value="qualification">Calificación</option>
            <option value="proposal">Propuesta</option>
            <option value="negotiation">Negociación</option>
            <option value="closed_won">Ganado</option>
            <option value="closed_lost">Perdido</option>
          </select>
        </div>
      </div>
      <Input label="Fecha estimada de cierre" type="date" value={form.expected_close_date}
        onChange={(e) => update('expected_close_date', e.target.value)} />
      <div>
        <label className="label">Notas</label>
        <textarea className="input min-h-[80px] resize-none" value={form.notes}
          onChange={(e) => update('notes', e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>
          {initial?.id ? 'Guardar cambios' : 'Crear negocio'}
        </Button>
      </div>

      {initial?.id && (
        <ActivityTimeline entityType="deal" entityId={initial.id} />
      )}
    </form>
  )
}
