import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useItemsWithPurchases } from '../lib/useItems'
import type { Profile } from '../lib/types'
import { CheckIcon } from '../components/Icons'

type Props = {
  profile: Profile
}

export function ArchivePage({ profile }: Props) {
  const partnerId = profile.partner_id!
  const { items, loading, error, reload } = useItemsWithPurchases(partnerId, profile.id)
  const [partnerName, setPartnerName] = useState<string>('your partner')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', partnerId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setPartnerName(data.display_name)
      })
  }, [partnerId])

  async function unmarkBought(purchaseId: string) {
    await supabase.from('purchases').delete().eq('id', purchaseId)
    await reload()
  }

  const archived = items
    .filter((i) => i.purchase)
    .sort((a, b) => (b.purchase!.bought_at > a.purchase!.bought_at ? 1 : -1))

  const totalSpent = archived.reduce((sum, i) => sum + (i.price || 0), 0)

  return (
    <div>
      <div className="header-row">
        <h1>Archive</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Things you've already bought for {partnerName}. Still hidden from them — tap the check to undo.
      </p>

      <div className="stats">
        <span className="stat-pill">{archived.length} bought</span>
        {totalSpent > 0 && <span className="stat-pill">₱{totalSpent.toLocaleString()} spent</span>}
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="empty">Loading…</div>}

      {!loading && archived.length === 0 && (
        <div className="empty">
          Nothing here yet. Mark something as bought from {partnerName}'s list and it'll show up here.
        </div>
      )}

      {archived.map((item) => (
        <div key={item.id} className="card dimmed">
          <button
            className="check-button checked"
            onClick={() => unmarkBought(item.purchase!.id)}
            aria-label="Move back to their list"
          >
            <CheckIcon />
          </button>
          <div className="item-info">
            <div className="item-name">{item.name}</div>
            <div className="item-meta">
              {item.price != null && `₱${item.price.toLocaleString()} · `}
              bought {new Date(item.purchase!.bought_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
