'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function B2BAccessPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

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
      window.location.href = '/'
      return
    }
    setError('INCORRECT ACCESS CODE')
    setShake(true)
    window.setTimeout(() => setShake(false), 420)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <iframe src="/" className="absolute inset-0 h-full w-full scale-[1.02] blur-md opacity-50 pointer-events-none" title="Catalog preview" />
      <div className="absolute inset-0 bg-[rgba(32,50,42,0.18)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className={`w-full max-w-md border border-brand-border-strong bg-brand-bg p-6 ${shake ? '[animation:shakeX_350ms_ease]' : ''}`}>
          <div className="mb-4 flex justify-center">
            <Image src="/8.svg" alt="District Flowers" width={52} height={52} className="object-contain" priority />
          </div>
          <h1 className="text-center font-mono text-[12px] uppercase tracking-[0.18em] text-brand-green">WHOLESALE ACCESS</h1>
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.1em] text-brand-green/55">
            Enter your access code to view wholesale pricing
          </p>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void submit()
              }
            }}
            className="mt-5 h-10 w-full border border-brand-border bg-brand-bg px-3 text-[11px] uppercase tracking-[0.1em] text-brand-green outline-none focus-brand"
            placeholder="Access code"
          />
          {error ? <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-brand-rose">{error}</p> : null}

          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading}
            className="mt-4 h-10 w-full border border-brand-green bg-brand-green text-[11px] uppercase tracking-[0.12em] text-brand-bg"
          >
            {loading ? 'Checking...' : 'ACCESS CATALOG'}
          </button>
        </div>
      </div>
    </main>
  )
}
