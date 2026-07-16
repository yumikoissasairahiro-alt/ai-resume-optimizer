import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRICE_SINGLE = process.env.STRIPE_PRICE_SINGLE!
const PRICE_PACK = process.env.STRIPE_PRICE_PACK!
const PRICE_UNLIMITED = process.env.STRIPE_PRICE_UNLIMITED!

async function findUserIdByEmail(email: string | null | undefined): Promise<string | null> {
  if (!email) return null

  const { data: userData, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    console.error('Error listing users:', error)
    return null
  }

  const matchedUser = userData?.users.find(u => u.email === email)
  return matchedUser?.id || null
}

async function addCredits(userId: string, amount: number, customerId: string | null) {
  const { data: existing } = await supabaseAdmin
    .from('credits')
    .select('remaining_generations')
    .eq('user_id', userId)
    .maybeSingle()

  const newTotal = (existing?.remaining_generations ?? 0) + amount

  const { error } = await supabaseAdmin
    .from('credits')
    .upsert(
      {
        user_id: userId,
        remaining_generations: newTotal,
        stripe_customer_id: customerId,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Error adding credits:', error)
  } else {
    console.log(`Added ${amount} credits to user ${userId}, new total: ${newTotal}`)
  }
}

async function setUnlimited(userId: string, customerId: string | null, value: boolean) {
  const { error } = await supabaseAdmin
    .from('credits')
    .upsert(
      {
        user_id: userId,
        is_unlimited: value,
        stripe_customer_id: customerId,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Error setting unlimited status:', error)
  } else {
    console.log(`Set is_unlimited=${value} for user ${userId}`)
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Received event type:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_details?.email
    const customerId = (session.customer as string) || null

    const userId = await findUserIdByEmail(email)
    if (!userId) {
      console.log('No matching user found for email:', email)
      return NextResponse.json({ received: true })
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price'],
    })

    const priceId = lineItems.data[0]?.price?.id

    if (priceId === PRICE_SINGLE) {
      await addCredits(userId, 1, customerId)
    } else if (priceId === PRICE_PACK) {
      await addCredits(userId, 5, customerId)
    } else if (priceId === PRICE_UNLIMITED) {
      await setUnlimited(userId, customerId, true)
    } else {
      console.log('Unrecognized price ID:', priceId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const { data: creditsRow } = await supabaseAdmin
      .from('credits')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (creditsRow?.user_id) {
      await setUnlimited(creditsRow.user_id, customerId, false)
    }
  }

  return NextResponse.json({ received: true })
}