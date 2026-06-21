'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()
  const [role, setRole] = useState<UserRole>(currentRole)
  const [saving, setSaving] = useState(false)

  async function handleChange(newRole: UserRole) {
    setSaving(true)
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setRole(newRole)
    setSaving(false)
  }

  return (
    <select
      value={role}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      className="input py-1 text-sm w-36"
    >
      {roles.map((r) => (
        <option key={r.value} value={r.value}>{r.label}</option>
      ))}
    </select>
  )
}
