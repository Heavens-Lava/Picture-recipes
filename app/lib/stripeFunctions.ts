import { supabase } from './supabase'

export const startStripeCheckout = async (userId: string, priceId: string) => {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, price_id: priceId }),
  })

  if (error) {
    throw new Error(error.message)
  }

  // 'data' here is Uint8Array, convert to string then JSON
  const text = new TextDecoder().decode(data)
  const json = JSON.parse(text)
  if (json.error) {
    throw new Error(json.error)
  }

  return json.url
}
