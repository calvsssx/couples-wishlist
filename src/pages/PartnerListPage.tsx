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

  async function toggleBought(itemId: string, currentPurchaseId: string | null) {
    if (currentPurchaseId) {
      await supabase.from('purchases').delete().eq('id', currentPurchaseId)
    } else {
      await supabase.from('purchases').insert({
        item_id: itemId,
        bought_by: profile.id,
      })
    }
    await reload()
  }

  const boughtCount = items.filter((i) => i.purchase).length

  return (
    <div>
      <div className="header-row">
        <h1>{partnerName}'s list</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Tap the circle to secretly mark something as already bought.
      </p>

      <div className="stats">
        <span className="stat-pill">{items.length} items</span>
        <span className="stat-pill">{boughtCount} secretly bought</span>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="empty">Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="empty">{partnerName} hasn't added anything yet.</div>
      )}

      {items.map((item) => {
        const bought = !!item.purchase
        return (
          <div key={item.id} className={'card' + (bought ? ' dimmed' : '')}>
            <button
              className={'check-button' + (bought ? ' checked' : '')}
              onClick={() => toggleBought(item.id, item.purchase?.id || null)}
              aria-label={bought ? 'Unmark bought' : 'Mark as bought'}
            >
              {bought && <CheckIcon />}
            </button>
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              {item.price != null && (
                <div className="item-meta">
                  ₱{item.price.toLocaleString()}
                  {bought && ` · bought (hidden from ${partnerName})`}
                </div>
              )}
              {item.price == null && bought && (
                <div className="item-meta">bought (hidden from {partnerName})</div>
              )}
            </div>
          </div>
        )
      })}

      {items.length > 0 && (
        <div className="lock-hint">
          <LockIcon />
          <span>{partnerName} can't see which items you've marked as bought.</span>
        </div>
      )}
    </div>
  )
}