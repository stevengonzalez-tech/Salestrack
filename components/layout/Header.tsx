'use client'

import { getInitials } from '@/lib/utils'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile: Profile
  onSignOut: () => void
  title: string
}

export default function Header({ profile, onSignOut, title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900">{profile.full_name}</p>
          <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
        </div>

        <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(profile.full_name)}
        </div>

        <button
          onClick={onSignOut}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Sign out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
