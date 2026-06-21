'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Revisa tu correo</p>
          <p className="text-sm text-slate-500 mt-1">
            Enviamos un enlace de acceso a <span className="font-medium text-slate-700">{email}</span>
          </p>
          <p className="text-xs text-slate-400 mt-3">Haz clic en el enlace del correo para ingresar. Puede tardar unos segundos.</p>
        </div>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Usar otro correo
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Correo corporativo</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Enviando enlace…' : 'Enviar enlace de acceso'}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Recibirás un enlace seguro en tu correo para ingresar sin contraseña.
      </p>
    </form>
  )
}
