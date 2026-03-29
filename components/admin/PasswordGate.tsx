'use client'

import { FormEvent, useState } from 'react'

interface PasswordGateProps {
  onAuthenticated: (password: string) => void
}

export default function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        setError('Incorrect admin password.')
        return
      }

      localStorage.setItem('admin_authenticated', 'true')
      localStorage.setItem('admin_password', password)
      onAuthenticated(password)
    } catch {
      setError('Unable to authenticate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-brand-border bg-brand-bg-secondary p-8">
        <h1 className="font-display text-2xl font-bold text-brand-green">District Admin</h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-brand-green/55">Password Protected Access</p>

        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-6 h-11 w-full border border-brand-border bg-brand-bg px-3 text-[12px] uppercase tracking-[0.08em] text-brand-green outline-none focus-brand focus:border-brand-border-strong"
          placeholder="ENTER PASSWORD"
          required
        />
        {error ? <p className="mt-3 text-[11px] text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-11 w-full border border-brand-green bg-brand-green text-[11px] uppercase tracking-[0.12em] text-brand-bg disabled:opacity-60"
        >
          {loading ? 'CHECKING...' : 'ENTER ADMIN PANEL'}
        </button>
      </form>
    </div>
  )
}

PasswordGate.displayName = 'PasswordGate'
