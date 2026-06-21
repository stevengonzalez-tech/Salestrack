'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
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
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Deal title" required value={form.title}
        onChange={(e) => update('title', e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Value ($)" type="number" min={0} required value={form.value}
          onChange={(e) => update('value', e.target.value)} />
        <div>
          <label className="label">Stage</label>
          <select className="input" value={form.stage} onChange={(e) => update('stage', e.target.value)}>
            <option value="prospecting">Prospecting</option>
            <option value="qualification">Qualification</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Won</option>
            <option value="closed_lost">Lost</option>
          </select>
        </div>
      </div>
      <Input label="Expected close date" type="date" value={form.expected_close_date}
        onChange={(e) => update('expected_close_date', e.target.value)} />
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[80px] resize-none" value={form.notes}
          onChange={(e) => update('notes', e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initial?.id ? 'Save changes' : 'Create deal'}
        </Button>
      </div>
    </form>
  )
}
