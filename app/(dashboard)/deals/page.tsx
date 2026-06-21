'use client'

import { useState } from 'react'
import { useDeals } from '@/lib/hooks/useDeals'
import KanbanBoard from '@/components/deals/KanbanBoard'
import DealForm from '@/components/deals/DealForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Deal, DealStage } from '@/lib/types'

export default function DealsPage() {
  const { deals, loading, createDeal, updateDeal } = useDeals()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)

  const totalValue = deals
    .filter((d) => !['closed_lost'].includes(d.stage))
    .reduce((s, d) => s + d.value, 0)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(deal: Deal) {
    setEditing(deal)
    setModalOpen(true)
  }

  async function handleSubmit(data: Partial<Deal>) {
    if (editing) await updateDeal(editing.id, data)
    else await createDeal(data as Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'created_by'>)
    setModalOpen(false)
  }

  async function handleStageChange(id: string, stage: DealStage) {
    await updateDeal(id, { stage })
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Negocios</h1>
          <p className="text-sm text-slate-500 mt-1">
            {deals.length} negocios · Pipeline: {formatCurrency(totalValue)}
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Negocio
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <KanbanBoard deals={deals} onEdit={openEdit} onStageChange={handleStageChange} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Negocio' : 'Nuevo Negocio'}
        size="md"
      >
        <DealForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
