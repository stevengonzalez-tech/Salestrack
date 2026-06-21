'use client'

import { useState } from 'react'
import { useLeads } from '@/lib/hooks/useLeads'
import LeadCard from '@/components/leads/LeadCard'
import LeadForm from '@/components/leads/LeadForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { Lead } from '@/lib/types'

export default function LeadsPage() {
  const { leads, loading, createLead, updateLead, deleteLead } = useLeads()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')

  const filtered = leads.filter((l) =>
    [l.full_name, l.email, l.company].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  )

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(lead: Lead) {
    setEditing(lead)
    setModalOpen(true)
  }

  async function handleSubmit(data: Partial<Lead>) {
    if (editing) await updateLead(editing.id, data)
    else await createLead(data as Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'created_by'>)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this lead?')) await deleteLead(id)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prospectos</h1>
          <p className="text-sm text-slate-500 mt-1">{leads.length} prospectos en total</p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Prospecto
        </Button>
      </div>

      <input
        className="input max-w-xs"
        placeholder="Buscar prospectos…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Sin prospectos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Prospecto' : 'Nuevo Prospecto'}
        size="lg"
      >
        <LeadForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
