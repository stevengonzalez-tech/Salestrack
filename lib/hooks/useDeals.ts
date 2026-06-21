'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Deal } from '@/lib/types'

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setDeals(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  async function createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { error } = await supabase.from('deals').insert([deal])
    if (error) throw error
    await fetchDeals()
  }

  async function updateDeal(id: string, updates: Partial<Deal>) {
    const { error } = await supabase.from('deals').update(updates).eq('id', id)
    if (error) throw error
    await fetchDeals()
  }

  async function deleteDeal(id: string) {
    const { error } = await supabase.from('deals').delete().eq('id', id)
    if (error) throw error
    await fetchDeals()
  }

  return { deals, loading, error, createDeal, updateDeal, deleteDeal, refetch: fetchDeals }
}
