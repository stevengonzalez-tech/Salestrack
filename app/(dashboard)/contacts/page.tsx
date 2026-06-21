'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ContactForm from '@/components/contacts/ContactForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import type { Contact } from '@/lib/types'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    setContacts(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const filtered = contacts.filter((c) =>
    [c.full_name, c.email, c.company].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  )

  async function handleSubmit(data: Partial<Contact>) {
    if (editing) {
      await supabase.from('contacts').update(data).eq('id', editing.id)
    } else {
      await supabase.from('contacts').insert([data])
    }
    setModalOpen(false)
    fetchContacts()
  }

  async function handleDelete(id: string) {
    if (confirm('¿Eliminar este contacto?')) {
      await supabase.from('contacts').delete().eq('id', id)
      fetchContacts()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contactos</h1>
          <p className="text-sm text-slate-500 mt-1">{contacts.length} contactos en total</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Contacto
        </Button>
      </div>

      <input className="input max-w-xs" placeholder="Buscar contactos…"
        value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden" style={{ padding: 0 }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 font-medium text-slate-600">Nombre</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Empresa</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Cargo</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Agregado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(contact.full_name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{contact.full_name}</p>
                        <p className="text-xs text-slate-500">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{contact.company ?? '—'}</td>
                  <td className="px-6 py-4">
                    {contact.position ? <Badge>{contact.position}</Badge> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatRelativeTime(contact.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-end">
                      <button className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        onClick={() => { setEditing(contact); setModalOpen(true) }}>
                        Edit
                      </button>
                      <button className="text-xs text-red-500 hover:text-red-600 font-medium"
                        onClick={() => handleDelete(contact.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Sin contactos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Contacto' : 'Nuevo Contacto'} size="lg">
        <ContactForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
