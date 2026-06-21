'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Contact } from '@/lib/types'

interface ContactFormProps {
  initial?: Partial<Contact>
  onSubmit: (data: Partial<Contact>) => Promise<void>
  onCancel: () => void
}

export default function ContactForm({ initial, onSubmit, onCancel }: ContactFormProps) {
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    company: initial?.company ?? '',
    position: initial?.position ?? '',
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
      setError(err instanceof Error ? err.message : 'Algo salió mal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre completo" required value={form.full_name}
          onChange={(e) => update('full_name', e.target.value)} />
        <Input label="Email" type="email" required value={form.email}
          onChange={(e) => update('email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Teléfono" value={form.phone}
          onChange={(e) => update('phone', e.target.value)} />
        <Input label="Empresa" value={form.company}
          onChange={(e) => update('company', e.target.value)} />
      </div>
      <Input label="Cargo" value={form.position}
        onChange={(e) => update('position', e.target.value)} placeholder="Ej: VP de Ventas" />
      <div>
        <label className="label">Notas</label>
        <textarea className="input min-h-[80px] resize-none" value={form.notes}
          onChange={(e) => update('notes', e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>
          {initial?.id ? 'Guardar cambios' : 'Crear contacto'}
        </Button>
      </div>
    </form>
  )
}
