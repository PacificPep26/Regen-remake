"use client"

import { MagnifyingGlassMini, XMark } from "@medusajs/icons"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

/**
 * Header product search — expands into an input on click, submits to
 * /[countryCode]/store?q=... which PaginatedProducts passes straight
 * through to Medusa's Store API `q` full-text search param.
 */
const SearchBar = () => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const router = useRouter()
  const { countryCode } = useParams()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    router.push(`/${countryCode}/store?q=${encodeURIComponent(value.trim())}`)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className="text-regenx-navy/70 hover:text-regenx-navy transition-colors"
      >
        <MagnifyingGlassMini />
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border border-regenx-navy/20 bg-white px-3 h-10"
    >
      <MagnifyingGlassMini className="text-regenx-navy/50 shrink-0" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products..."
        className="text-sm outline-none w-32 small:w-48 text-regenx-navy placeholder:text-regenx-navy/40"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close search"
        className="text-regenx-navy/50 hover:text-regenx-navy shrink-0"
      >
        <XMark />
      </button>
    </form>
  )
}

export default SearchBar
