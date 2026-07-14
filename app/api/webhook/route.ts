import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function markUserAsPaid(email: string | null | undefined, customerId: string | null | undefined) {
  console.log('markUserAsPaid called with email:', email)

  if (!email) {
    console.log('No email found, skipping.')
    return
  }

  const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  const matchedUser = userData?.users.find(u => u.email === email)

  if (!matchedUser) {
    console.log('No matching user found for email:', email)
    return
  }

  console.log('Matched user id:', matchedUser.id)

  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: matchedUser.id,
        stripe_customer_id: customerId || null,
        plan: 'paid',
        status: 'active',
      },
      { onConflict: 'user_id' }
    )

  if (upsertError) {
    console.error('Error upserting subscription:', upsertError)
  } else {
    console.log('Subscription upserted successfully for user:', matchedUser.id)
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
    await markUserAsPaid(session.customer_details?.email, session.customer as string)
  }

  if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice_payment.paid') {
    const invoice = event.data.object as any
    const email = invoice.customer_email as string | undefined
    const customerId = invoice.customer as string | undefined
    await markUserAsPaid(email, customerId)
  }

  return NextResponse.json({ received: true })
}
