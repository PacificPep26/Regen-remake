import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Mirrors the provider ids/options registered in medusa-config.ts.
const MANUAL_PAYMENT_METHODS = [
  { provider_id: "pp_manual-payment_paypal", label: "PayPal", address: "ThuanNguyen220" },
  { provider_id: "pp_manual-payment_zelle", label: "Zelle", address: "tqnventures@gmail.com" },
  {
    provider_id: "pp_manual-payment_usdt",
    label: "USDT (Tether, TRC20/ERC20)",
    address: "0xCbb8C5a7Ab4a39E9aC7296f7621d33AA56264f91",
  },
]

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({ manual_payment_methods: MANUAL_PAYMENT_METHODS })
}
