import { CreditCard } from "@medusajs/icons"
import Bancontact from "@modules/common/icons/bancontact"
import Ideal from "@modules/common/icons/ideal"
import PayPal from "@modules/common/icons/paypal"
import React from "react"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  "pp_manual-payment_paypal": {
    title: "PayPal",
    icon: <PayPal />,
  },
  "pp_manual-payment_zelle": {
    title: "Zelle",
    icon: <CreditCard />,
  },
  "pp_manual-payment_usdt": {
    title: "USDT (Crypto)",
    icon: <CreditCard />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// Real account/address to show + a scannable QR for each manual "pay
// outside Stripe" method — mirrors the current WalletUp Pro setup, so
// customers send funds directly and staff confirm/capture in admin.
export const manualPaymentAddresses: Record<string, string> = {
  "pp_manual-payment_paypal": "ThuanNguyen220",
  "pp_manual-payment_zelle": "tqnventures@gmail.com",
  "pp_manual-payment_usdt": "0xCbb8C5a7Ab4a39E9aC7296f7621d33AA56264f91",
}

export const isManualPaymentMethod = (providerId?: string) => {
  return !!providerId && providerId in manualPaymentAddresses
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
