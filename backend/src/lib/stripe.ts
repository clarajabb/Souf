import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Stripe is lazily initialised so the server boots without real keys.
// Payment routes will fail gracefully if the key is a placeholder.
const key = process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder';

export const stripe = new Stripe(key, {
  apiVersion: '2023-10-16',
});
