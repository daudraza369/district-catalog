'use client'

import { useState } from 'react'

interface B2BPasswordGateProps {
  onAuthenticated: () => void
  onSkip: () => void
}

export default function B2BPasswordGate({ onAuthenticated, onSkip }: B2BPasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError('')
    const response = await fetch('/api/catalog/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const result = (await response.json()) as { success?: boolean }
    setLoading(false)
    if (result.success) {
      sessionStorage.setItem('b2b_authenticated', 'true')
      onAuthenticated()
      return
    }
    setError('Invalid password')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(32,50,42,0.35)] backdrop-blur-sm p-4">
      <div className="w-full max-w-md border border-brand-border-strong bg-brand-bg p-5">
        <h2 className="font-display text-[26px] text-brand-green">B2B Access</h2>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-brand-green/55">Enter password for wholesale per-stem pricing</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-4 h-10 w-full border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] text-brand-green outline-none focus-brand"
          placeholder="Enter B2B password"
        />
        {error ? <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-rose-600">{error}</p> : null}
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-3 h-10 w-full border border-brand-green bg-brand-green text-[11px] uppercase tracking-[0.12em] text-brand-bg"
        >
          {loading ? 'Checking...' : 'Access Wholesale Catalog'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="mt-2 h-10 w-full border border-brand-border text-[10px] uppercase tracking-[0.12em] text-brand-green/70"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

B2BPasswordGate.displayName = 'B2BPasswordGate'
