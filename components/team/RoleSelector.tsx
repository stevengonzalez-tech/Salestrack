'use client'

import { useState } from 'react'
import type { UserRole } from '@/lib/types'

interface RoleSelectorProps {
  userId: string
  currentRole: UserRole
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'agent',  label: 'Agente'         },
  { value: 'leader', label: 'Líder'           },
  { value: 'admin',  label: 'Administrador'   },
]

export default function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const [role, setRole] = useState<UserRole>(currentRole)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(newRole: UserRole) {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/team/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })
    if (res.ok) {
      setRole(newRole)
    } else {
      setError('Error al cambiar rol')
    }
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as UserRole)}
        className="input py-1 text-sm w-40"
      >
        {roles.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-slate-400">Guardando…</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
