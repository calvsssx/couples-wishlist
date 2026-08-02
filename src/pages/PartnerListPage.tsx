import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useItemsWithPurchases } from '../lib/useItems'
import type { Profile } from '../lib/types'
import { CheckIcon, LockIcon } from '../components/Icons'

type Props = {
  profile: Profile
}

export function PartnerListPage({ profile }: Props) {
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

  async function markBought(itemId: string) {
    await supabase.from('purchases').insert({
      item_id: itemId,
      bought_by: profile.id,
    })
    await reload()
  }

  // Items you've already bought move out of this list and into the Archive tab,
  // so this view only shows what's still left to get.
  const toBuy = items.filter((i) => !i.purchase)
  const boughtCount = items.length - toBuy.length

  return (
    <div>
      <div className="header-row">
        <h1>{partnerName}'s list</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Tap the circle to secretly mark something as already bought — it'll move to your Archive tab.
      </p>

      <div className="stats">
        <span className="stat-pill">{toBuy.length} items</span>
        {boughtCount > 0 && <span className="stat-pill">{boughtCount} archived</span>}
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="empty">Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="empty">{partnerName} hasn't added anything yet.</div>
      )}

      {!loading && items.length > 0 && toBuy.length === 0 && (
        <div className="empty">You've got everything on this list — check your Archive tab.</div>
      )}

      {toBuy.map((item) => (
        <div key={item.id} className="card">
          <button
            className="check-button"
            onClick={() => markBought(item.id)}
            aria-label="Mark as bought"
          >
            <CheckIcon />
          </button>
          <div className="item-info">
            <div className="item-name">{item.name}</div>
            {item.price != null && (
              <div className="item-meta">₱{item.price.toLocaleString()}</div>
            )}
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div className="lock-hint">
          <LockIcon />
          <span>{partnerName} can't see which items you've marked as bought.</span>
        </div>
      )}
    </div>
  )
}
