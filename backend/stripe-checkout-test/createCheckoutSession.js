// createCheckoutSession.js
require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET);

// ✅ 替换为你从 Stripe 后台复制的真实 price_id（例如 Standard Plan 的）
const priceId = 'price_1RJcr3Gbv5899LUhybVivfnv';  // 👈 请在此处填写你真实的价格 ID

// ✅ 替换为你 Supabase 中的 user_id（例如从 supabase.auth.getUser().id 获取）
const supabaseUserId = '846638a8-3620-4625-9af3-3a395745331e';      // 👈 请替换成你测试用的 Supabase user_id

async function main() {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    client_reference_id: supabaseUserId,
    metadata: {
      plan: 'Standard Plan',  // 或 'Premium Plan (Yearly)' / 'Premium Plan (Quarterly)'
    },
  });

  console.log('✅ 打开这个链接进行测试付款：\n', session.url);
}

main().catch((err) => {
  console.error('❌ 出错：', err.message);
});

