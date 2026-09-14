import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    // Card payments via Vu's own Stripe account (Phase 6a — priority payment
    // method). Requires STRIPE_API_KEY / STRIPE_WEBHOOK_SECRET in .env; the
    // provider registers even without real keys (Medusa boots fine), it
    // just won't process real charges until Vu adds them.
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          // Stripe requires a real apiKey to even boot — skip registering
          // it until Vu adds STRIPE_API_KEY, instead of crashing the whole
          // server on an empty-string key.
          ...(process.env.STRIPE_API_KEY
            ? [
                {
                  resolve: "@medusajs/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                  },
                },
              ]
            : []),
          // Manual "pay outside Stripe" methods (Phase 6b) — real accounts
          // from Vu's current WalletUp Pro setup. Address/handle shown at
          // checkout is stored in `options.address`, read by the storefront
          // via /store/manual-payment-methods.
          {
            resolve: "./src/modules/manual-payment",
            id: "paypal",
            options: { label: "PayPal", address: "ThuanNguyen220" },
          },
          {
            resolve: "./src/modules/manual-payment",
            id: "zelle",
            options: { label: "Zelle", address: "tqnventures@gmail.com" },
          },
          {
            resolve: "./src/modules/manual-payment",
            id: "usdt",
            options: {
              label: "USDT (Tether, TRC20/ERC20)",
              address: "0xCbb8C5a7Ab4a39E9aC7296f7621d33AA56264f91",
            },
          },
        ],
      },
    },
  ],
})
