"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const GATE_COOKIE = "regenx_gate_ack"

export async function acknowledgeGate(formData: FormData) {
  const countryCode = String(formData.get("country_code") || "us")
  const redirectTo = String(formData.get("redirect") || `/${countryCode}`)
  const ageOk = formData.get("age_confirmed") === "on"
  const ruoOk = formData.get("ruo_confirmed") === "on"
  const researcherType = String(formData.get("researcher_type") || "")

  if (!ageOk || !ruoOk || !researcherType) {
    redirect(
      `/${countryCode}/gate?redirect=${encodeURIComponent(
        redirectTo
      )}&error=missing`
    )
  }

  ;(await cookies()).set(GATE_COOKIE, "1", {
    maxAge: 60 * 60 * 24,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  redirect(redirectTo)
}
