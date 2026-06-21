'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Lead } from '@/lib/types'

interface LeadFormProps {
  initial?: Partial<Lead>
  onSubmit: (data: Partial<Lead>) => Promise<void>
  onCancel: () => void
}

export default function LeadForm({ initial, onSubmit, onCancel }: LeadFormProps) {
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    company: initial?.company ?? '',
    source: initial?.source ?? '',
    status: initial?.status ?? 'new',
    notes: initial?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full name" required value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)} />
        <Input label="Email" type="email" required value={form.email}
          onChange={(e) => update('email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" value={form.phone}
          onChange={(e) => update('phone', e.target.value)} />
        <Input label="Company" value={form.company}
          onChange={(e) => update('company', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
          </select>
        </div>
        <Input label="Source" value={form.source}
          onChange={(e) => update('source', e.target.value)} placeholder="e.g. LinkedIn" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input min-h-[80px] resize-none"
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Save changes' : 'Create lead'}
        </Button>
      </div>
    </form>
  )
}
