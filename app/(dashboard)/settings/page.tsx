export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ProfileForm from '@/components/settings/ProfileForm'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = { title: 'Configuración' }

const roleLabel: Record<string, string> = {
  admin:  'Administrador',
  leader: 'Líder',
  agent:  'Agente',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">Administra tu perfil y espacio de trabajo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
        </CardHeader>
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
            {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile?.full_name}</p>
            <Badge variant={profile?.role === 'admin' ? 'danger' : profile?.role === 'leader' ? 'warning' : 'info'}>
              {roleLabel[profile?.role] ?? profile?.role}
            </Badge>
          </div>
        </div>
        {profile && <ProfileForm profile={profile as Profile} />}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Espacio de Trabajo</CardTitle>
        </CardHeader>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-500">Plan</span>
            <Badge variant="purple">Pro</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Seguridad por Filas (RLS)</span>
            <Badge variant="success">Activo</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Base de Datos</span>
            <span className="font-medium text-slate-900">Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Autenticación</span>
            <span className="font-medium text-slate-900">Magic Link (sin contraseña)</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por Rol</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 font-medium text-slate-600">Función</th>
                <th className="text-center py-2 px-4 font-medium text-slate-600">Agente</th>
                <th className="text-center py-2 px-4 font-medium text-slate-600">Líder</th>
                <th className="text-center py-2 px-4 font-medium text-slate-600">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {[
                ['Prospectos (propios)', true, true, true],
                ['Prospectos (todo el equipo)', false, true, true],
                ['Negocios (propios)', true, true, true],
                ['Negocios (todo el equipo)', false, true, true],
                ['Contactos', true, true, true],
                ['Gestiones Diarias', true, true, true],
                ['Reportes', false, true, true],
                ['Equipo', false, true, true],
                ['Configuración', false, false, true],
              ].map(([feature, agent, leader, admin]) => (
                <tr key={String(feature)}>
                  <td className="py-2 pr-4">{feature}</td>
                  {[agent, leader, admin].map((allowed, i) => (
                    <td key={i} className="text-center py-2 px-4">
                      {allowed ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
