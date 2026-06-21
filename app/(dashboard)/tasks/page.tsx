import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import DailyChecks from '@/components/tasks/DailyChecks'
import TeamChecksTable from '@/components/tasks/TeamChecksTable'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Gestiones Diarias' }

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const isLeader = profile?.role === 'admin' || profile?.role === 'leader'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestiones Diarias</h1>
        <p className="text-sm text-slate-500 mt-1">Registra tus actividades del día</p>
      </div>

      <DailyChecks />

      {isLeader && (
        <div className="border-t border-slate-100 pt-8">
          <TeamChecksTable />
        </div>
      )}
    </div>
  )
}
