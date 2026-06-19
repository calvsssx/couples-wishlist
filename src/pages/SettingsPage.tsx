import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

type Props = {
  profile: Profile
  onSignOut: () => void
}

export function SettingsPage({ profile, onSignOut }: Props) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile.partner_id) return
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', profile.partner_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setPartnerName(data.display_name)
      })
  }, [profile.partner_id])

  async function saveName() {
    if (!displayName.trim()) return
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', profile.id)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function unpair() {
    if (!confirm('Unpair from your partner? You can re-pair later with a new code.')) return
    await supabase.from('profiles').update({ partner_id: null }).eq('id', profile.id)
    if (profile.partner_id) {
      await supabase.from('profiles').update({ partner_id: null }).eq('id', profile.partner_id)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Settings</h1>

      <h3 style={{ marginBottom: 8 }}>Display name</h3>
      <div className="row" style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <button
          onClick={saveName}
          disabled={saving || !displayName.trim() || displayName === profile.display_name}
        >
          {saved ? 'Saved!' : saving ? '…' : 'Save'}
        </button>
      </div>

      <h3 style={{ marginBottom: 8 }}>Partner</h3>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="item-info">
          <div className="item-name">{partnerName || 'Loading…'}</div>
          <div className="item-meta">Paired</div>
        </div>
        <button onClick={unpair} className="secondary" style={{ fontSize: 13, padding: '8px 12px' }}>
          Unpair
        </button>
      </div>

      <h3 style={{ marginBottom: 8 }}>Account</h3>
      <button onClick={onSignOut} className="secondary" style={{ width: '100%' }}>
        Sign out
      </button>

      <p style={{ color: 'var(--text-faint)', fontSize: 12, textAlign: 'center', marginTop: 32 }}>
        Wishlist for two · made with Supabase
      </p>
    </div>
  )
}
