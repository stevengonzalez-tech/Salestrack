export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import { getInitials, formatDate } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

export const metadata: Metadata = { title: 'Team' }

const roleVariant: Record<UserRole, 'danger' | 'warning' | 'info'> = {
  admin:  'danger',
  leader: 'warning',
  agent:  'info',
}

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: true })

  const profiles = members ?? []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="text-sm text-slate-500 mt-1">{profiles.length} members</p>
      </div>

      <div className="card overflow-hidden" style={{ padding: 0 }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-3 font-medium text-slate-600">Member</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Role</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Joined</th>
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
                  <Badge variant={roleVariant[p.role as UserRole]}>
                    {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-slate-500">{formatDate(p.created_at)}</td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No team members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
