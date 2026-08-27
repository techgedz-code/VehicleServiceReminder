import { Hono } from 'hono';
import { createPayment, updatePaymentStatus, getWorkshopById, updateWorkshopCredits, addCreditsLedgerEntry } from '../../src/lib/db/queries';

const app = new Hono();

app.post('/payment', async (c) => {
  try {
    const body = await c.req.text();
    const params = new URLSearchParams(body);
    
    const orderId = params.get('order_id');
    const status = params.get('status');
    const amount = params.get('amount');
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
    
    if (status === '1' || status === 'Success') {
      console.log('Payment successful for order:', orderId);
    } else {
      console.log('Payment failed/pending for order:', orderId, 'status:', status);
    }
    
    return c.text('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;