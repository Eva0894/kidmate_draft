import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;

if (!stripeSecret || !priceId) {
  console.error('❌ 缺少 STRIPE_SECRET_KEY 或 STRIPE_PRICE_ID，请检查 .env 文件');
  process.exit(1);
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2022-11-15',
});

const app = express();
app.use(cors()); // 如果你的前端与后端不在同一个端口，需要允许跨域
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: process.env.SUCCESS_URL || 'http://localhost:4242/success',
      cancel_url: process.env.CANCEL_URL || 'http://localhost:4242/cancel',
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error('❌ 创建 session 出错:', error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`✅ Stripe server running on http://localhost:${PORT}`);
});
