import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51RvdXeFg23GXTtGm9n2Rs6Oj5bZbZbS1m8rFleChO6jFzwZdqzOKYSJgoelQXJtcgmMKQR11gC8WDiuHdBcjhHSy00GGtmygqW', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request) {
  try {
    const { items, customerEmail, metadata = {} } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        source: 'website',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session', details: error.message },
      { status: 500 }
    );
  }
}
