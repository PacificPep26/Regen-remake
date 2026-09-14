import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "styles/globals.css"

// Modern Clinical direction (pivoted from the earlier warm-luxury serif
// pass per Vu's feedback): a precise, geometric sans for display headings
// — reads as technical/lab-grade rather than editorial-luxury — paired
// with Inter for body copy, on a light/white ground instead of a dark
// navy field.
const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
})
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className="bg-white text-regenx-navy">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
