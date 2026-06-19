import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

type Props = {
  profile: Profile
  onSignOut: () => void
}

export function PairPage({ profile, onSignOut }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handlePair(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.rpc('pair_with_code', {
        input_code: code.trim().toUpperCase(),
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not pair')
    } finally {
      setLoading(false)
    }
  }

  async function copyCode() {
    if (!profile.pair_code) return
    try {
      await navigator.clipboard.writeText(profile.pair_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="center-screen">
      <div className="auth-card">
        <h1 style={{ marginBottom: 6 }}>Pair with your partner</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
          Share your code with your partner, or enter theirs.
        </p>

        <h3 style={{ marginTop: 8, marginBottom: 4 }}>Your code</h3>
        <div className="pair-code">{profile.pair_code || '—'}</div>
        <button onClick={copyCode} className="secondary" style={{ width: '100%' }}>
          {copied ? 'Copied!' : 'Copy code'}
        </button>

        <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />

        <h3 style={{ marginBottom: 8 }}>Or enter their code</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handlePair} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 18,
              letterSpacing: 4,
              textAlign: 'center',
            }}
          />
          <button type="submit" disabled={loading || code.length !== 6}>
            {loading ? '…' : 'Pair'}
          </button>
        </form>

        <button onClick={onSignOut} className="muted-link" style={{ width: '100%', marginTop: 24 }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
