import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import { useEffect } from "react"

/**
 * "View Store" sidebar link — Medusa Admin has no built-in equivalent to
 * WordPress's "Visit Site" (admin and storefront are fully separate apps
 * in a headless setup, so the admin has no way to know the storefront's
 * URL on its own). This adds a persistent sidebar entry that opens the
 * storefront in a new tab as soon as it's clicked, with a manual fallback
 * link in case the browser blocks the auto-opened popup.
 *
 * Storefront URL is read from an env var (falls back to the local dev
 * default) so this keeps working once a real domain is deployed later —
 * just set VITE_STOREFRONT_URL when building the admin for production.
 */

const STOREFRONT_URL =
  // @ts-expect-error -- import.meta.env is Vite-injected at build time, not a standard Node global
  import.meta.env?.VITE_STOREFRONT_URL || "http://localhost:8000"

const ViewStorePage = () => {
  useEffect(() => {
    window.open(STOREFRONT_URL, "_blank", "noopener,noreferrer")
  }, [])

  return (
    <Container className="flex flex-col items-center justify-center gap-y-4 py-16">
      <Heading level="h1">Opening the storefront…</Heading>
      <Text className="text-ui-fg-subtle">
        If a new tab didn't open (browser popup blocking), use the button
        below.
      </Text>
      <Button
        variant="primary"
        onClick={() =>
          window.open(STOREFRONT_URL, "_blank", "noopener,noreferrer")
        }
      >
        Open {STOREFRONT_URL} ↗
      </Button>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "View Store",
})

export default ViewStorePage
