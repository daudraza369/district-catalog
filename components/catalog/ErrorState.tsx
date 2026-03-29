'use client'

import { useRouter } from 'next/navigation'

interface ErrorStateProps {
  title: string
  message: string
}

export default function ErrorState({ title, message }: ErrorStateProps) {
  const router = useRouter()

  return (
    <div className="px-4 py-20 text-center">
      <h2 className="font-display text-3xl text-brand-green">{title}</h2>
      <p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-brand-green/55">{message}</p>
      <button
        onClick={() => router.refresh()}
        className="mt-6 border border-brand-green bg-brand-green px-5 py-3 text-[11px] uppercase tracking-[0.1em] text-brand-bg"
      >
        Retry
      </button>
    </div>
  )
}

ErrorState.displayName = 'ErrorState'
