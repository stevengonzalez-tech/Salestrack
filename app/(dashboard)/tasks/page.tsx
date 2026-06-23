import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AgentChecklist from '@/components/tasks/AgentChecklist'
import TeamProgressBoard from '@/components/tasks/TeamProgressBoard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Gestiones Diarias' }

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user?.id)
    .single()

  const isLeader = profile?.role === 'admin' || profile?.role === 'leader'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestiones Diarias</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isLeader
            ? 'Seguimiento del progreso diario de tu equipo'
            : `Hola ${profile?.full_name?.split(' ')[0]} — marca cada gestión conforme la completes`}
        </p>
      </div>

      {isLeader ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-4">Mis gestiones</h2>
            <AgentChecklist />
          </div>
          <div>
            <TeamProgressBoard />
          </div>
        </div>
      ) : (
        <AgentChecklist />
      )}
    </div>
  )
}
