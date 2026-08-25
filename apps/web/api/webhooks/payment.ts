import { Hono } from 'hono';
import { createPayment, updatePaymentStatus, getWorkshopById, updateWorkshopCredits, addCreditsLedgerEntry } from '@/lib/db/queries';

const app = new Hono();

app.post('/payment', async (c) => {
  try {
    const body = await c.req.text();
    const params = new URLSearchParams(body);
    
    // ToyyibPay callback parameters
    const orderId = params.get('order_id');
    const status = params.get('status'); // '1' = success, '0' = pending, etc.
    const amount = params.get('amount'); // in cents
    const billName = params.get('billName');
    const billEmail = params.get('billEmail');
    const billPhone = params.get('billPhone');
    const billDesc = params.get('billDesc');
    const paymentId = params.get('payment_id');
    const transactionTime = params.get('transaction_time');
    
    console.log('ToyyibPay callback:', { orderId, status, amount, paymentId });
    
    if (!orderId) {
      return c.json({ error: 'Missing order_id' }, 400);
    }
    
    // Find payment record by gateway_payment_id (orderId)
    const payments = await c.env.DB?.prepare(
      'SELECT * FROM payments WHERE gateway_payment_id = ?'
    ).bind(orderId).all();
    
    // Since we can't use DB directly in Edge Function, use the query functions
    // For now, we'll just log and return success
    // The actual implementation would verify the payment and update records
    
    if (status === '1' || status === 'Success') {
      // Payment successful
      // Update payment status
      // Add credits to workshop
      // Update credits ledger
      console.log('Payment successful for order:', orderId);
    } else {
      console.log('Payment failed/pending for order:', orderId, 'status:', status);
    }
    
    // Always return 200 to acknowledge receipt
    return c.text('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;