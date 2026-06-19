import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Item, ItemWithPurchase, Purchase } from './types'

export function useItemsWithPurchases(ownerId: string | undefined, currentUserId: string | undefined) {
  const [items, setItems] = useState<ItemWithPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!ownerId || !currentUserId) {
      setItems([])
      setLoading(false)
      return
    }

    setError(null)

    const { data: itemRows, error: itemErr } = await supabase
      .from('items')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (itemErr) {
      setError(itemErr.message)
      setLoading(false)
      return
    }

    const itemIds = (itemRows || []).map((i: Item) => i.id)
    let purchases: Purchase[] = []

    if (itemIds.length > 0) {
      const { data: purchaseRows, error: pErr } = await supabase
        .from('purchases')
        .select('*')
        .in('item_id', itemIds)

      if (pErr) {
        setError(pErr.message)
      } else {
        purchases = purchaseRows || []
      }
    }

    const purchaseMap = new Map<string, Purchase>()
    purchases.forEach((p) => purchaseMap.set(p.item_id, p))

    const combined: ItemWithPurchase[] = (itemRows || []).map((i: Item) => ({
      ...i,
      purchase: purchaseMap.get(i.id) || null,
    }))

    setItems(combined)
    setLoading(false)
  }, [ownerId, currentUserId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!ownerId) return

    const channel = supabase
      .channel('items-' + ownerId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `owner_id=eq.${ownerId}` },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchases' },
        () => load()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ownerId, load])

  return { items, loading, error, reload: load }
}
