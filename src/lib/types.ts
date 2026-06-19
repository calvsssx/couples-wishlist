export type Profile = {
  id: string
  display_name: string
  partner_id: string | null
  pair_code: string | null
  created_at: string
}

export type Item = {
  id: string
  owner_id: string
  name: string
  price: number | null
  note: string | null
  created_at: string
}

export type Purchase = {
  id: string
  item_id: string
  bought_by: string
  note: string | null
  bought_at: string
}

export type ItemWithPurchase = Item & {
  purchase: Purchase | null
}
