import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useItemsWithPurchases } from '../lib/useItems'
import type { Profile } from '../lib/types'
import { HeartIcon, PlusIcon, TrashIcon } from '../components/Icons'

type Props = {
  profile: Profile
}

export function MyListPage({ profile }: Props) {
  const { items, loading, error, reload } = useItemsWithPurchases(profile.id, profile.id)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    const priceNum = price.trim() ? parseFloat(price) : null
    const { error } = await supabase.from('items').insert({
      owner_id: profile.id,
      name: name.trim(),
      price: Number.isFinite(priceNum as number) ? priceNum : null,
    })
    if (!error) {
      setName('')
      setPrice('')
      await reload()
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this item?')) return
    await supabase.from('items').delete().eq('id', id)
    await reload()
  }

  return (
    <div>
      <div className="header-row">
        <h1>My list</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        Add things you want. Your partner can see this list.
      </p>

      <form onSubmit={handleAdd} className="add-row">
        <input
          className="name-input"
          placeholder="What do you want?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="price-input"
          placeholder="₱"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button type="submit" disabled={adding || !name.trim()} aria-label="Add">
          <PlusIcon />
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading && <div className="empty">Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="empty">Nothing here yet. Add something you want above.</div>
      )}

      {items.map((item) => (
        <div key={item.id} className="card">
          <div className="avatar">
            <HeartIcon />
          </div>
          <div className="item-info">
            <div className="item-name">{item.name}</div>
            {item.price != null && (
              <div className="item-meta">₱{item.price.toLocaleString()}</div>
            )}
          </div>
          <button className="delete-btn" onClick={() => handleDelete(item.id)} aria-label="Delete">
            <TrashIcon />
          </button>
        </div>
      ))}
    </div>
  )
}