import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'Settings' }

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
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your workspace configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <dl className="space-y-4">
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{profile?.full_name}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{profile?.email}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Role</dt>
            <dd>
              <Badge variant="danger">
                {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-500">Plan</span>
            <Badge variant="purple">Pro</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Row Level Security</span>
            <Badge variant="success">Enabled</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Database</span>
            <span className="font-medium text-slate-900">Supabase PostgreSQL</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 font-medium text-slate-600">Feature</th>
                <th className="text-center py-2 px-4 font-medium text-slate-600">Agent</th>
                <th className="text-center py-2 px-4 font-medium text-slate-600">Leader</th>
                <th className="text-center py-2 px-4 font-medium text-slate-600">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {[
                ['Leads (own)', true, true, true],
                ['Leads (all)', false, true, true],
                ['Deals (own)', true, true, true],
                ['Deals (all)', false, true, true],
                ['Contacts', true, true, true],
                ['Reports', false, true, true],
                ['Team', false, true, true],
                ['Settings', false, false, true],
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
