'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile.full_name)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id)

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' })
    } else {
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{profile.email}</span>
        <span className="text-xs text-slate-400">El correo no es editable</span>
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>Guardar cambios</Button>
      </div>
    </form>
  )
}
