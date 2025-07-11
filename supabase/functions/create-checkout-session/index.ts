// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

// @ts-ignore
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-08-16',
})

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    })
  }

  try {
    const { user_id, price_id } = await req.json()

    if (!user_id || !price_id) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'payment',
      success_url: 'https://picture-recipes-payment.vercel.app/success',
      cancel_url: 'https://picture-recipes-payment.vercel.app/cancel',
      metadata: { user_id },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Stripe error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
})
