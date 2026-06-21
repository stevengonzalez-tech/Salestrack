import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="card p-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 mb-4">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">SalesTrack Pro</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your workspace</p>
      </div>
      <LoginForm />
    </div>
  )
}
