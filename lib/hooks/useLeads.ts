'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setLeads(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  async function createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { error } = await supabase.from('leads').insert([lead])
    if (error) throw error
    await fetchLeads()
  }

  async function updateLead(id: string, updates: Partial<Lead>) {
    const { error } = await supabase.from('leads').update(updates).eq('id', id)
    if (error) throw error
    await fetchLeads()
  }

  async function deleteLead(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error
    await fetchLeads()
  }

  return { leads, loading, error, createLead, updateLead, deleteLead, refetch: fetchLeads }
}
