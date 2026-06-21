'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    loadProfile()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadProfile()
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { profile, loading, signOut }
}
