export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import RoleSelector from '@/components/team/RoleSelector'
import { getInitials, formatDate } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

export const metadata: Metadata = { title: 'Equipo' }

const roleVariant: Record<UserRole, 'danger' | 'warning' | 'info'> = {
  admin:  'danger',
  leader: 'warning',
  agent:  'info',
}

const roleLabel: Record<UserRole, string> = {
  admin:  'Administrador',
  leader: 'Líder',
  agent:  'Agente',
}

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const isAdmin = currentProfile?.role === 'admin'

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: true })

  const profiles = members ?? []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipo</h1>
          <p className="text-sm text-slate-500 mt-1">{profiles.length} miembros</p>
        </div>
        <div className="card p-4 text-sm text-slate-600 max-w-xs">
          <p className="font-semibold text-slate-900 mb-1">¿Cómo invitar a alguien?</p>
          <p className="text-xs text-slate-500">
            Comparte la URL de la app. Al ingresar con su correo corporativo, el sistema crea su cuenta automáticamente como Agente.
            {isAdmin && ' Luego puedes cambiar su rol desde aquí.'}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden" style={{ padding: 0 }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-3 font-medium text-slate-600">Miembro</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Rol</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Ingresó</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {getInitials(p.full_name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.full_name}</p>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isAdmin && p.id !== user?.id ? (
                    <RoleSelector userId={p.id} currentRole={p.role as UserRole} />
                  ) : (
                    <Badge variant={roleVariant[p.role as UserRole]}>
                      {roleLabel[p.role as UserRole]}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500">{formatDate(p.created_at)}</td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400">Sin miembros en el equipo</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
