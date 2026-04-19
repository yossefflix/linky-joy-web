import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Paddle Webhook Handler
 * Listens for `transaction.completed` events.
 *
 * TODO: Add signature verification using PADDLE_WEBHOOK_SECRET
 * See: https://developer.paddle.com/webhooks/signature-verification
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    if (!event || !event.event_type) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    console.log(`[Paddle Webhook] Received: ${event.event_type}`);

    if (event.event_type === 'transaction.completed') {
      const { data } = event;
      const customerId = data?.customer_id;
      const transactionId = data?.id;
      const items = data?.items;

      console.log(`[Paddle] Transaction completed: ${transactionId}, customer: ${customerId}`);
      console.log(`[Paddle] Items:`, JSON.stringify(items));

      // TODO: Activate subscription in your database
      // - Look up user by customerId or email from data.customer
      // - Set subscription plan & expiry based on purchased price_id
      // - Example:
      //   const priceId = items?.[0]?.price?.id;
      //   await activateSubscription(customerId, priceId, transactionId);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Paddle Webhook] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
