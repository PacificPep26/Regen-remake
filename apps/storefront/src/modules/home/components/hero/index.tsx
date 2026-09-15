import LocalizedClientLink from "@modules/common/components/localized-client-link"
import UsFlag from "@modules/common/icons/us-flag"
import { MEDUSA_BACKEND_URL } from "@lib/config"

// A 2x2 collage of real product photos reads as "the full catalog" rather
// than one arbitrary product — same idea as the original WordPress hero's
// multi-vial grid (Wolverine/GHK-Cu/Tesamorelin/BPC157). Swap these for
// dedicated hero photography later if Vu commissions a real studio shot;
// this is a real-asset stand-in, not a placeholder/stock image.
const HERO_COLLAGE = [
  `${MEDUSA_BACKEND_URL}/static/1789364985831-regenx-ref-p017.png`, // Thymosin Alpha-1
  `${MEDUSA_BACKEND_URL}/static/1789364985841-regenx-ref-248-10mg.png`, // SS-31
  `${MEDUSA_BACKEND_URL}/static/1789364985822-regenx-ref-p015.png`, // Kisspeptin-10
  `${MEDUSA_BACKEND_URL}/static/1789364985846-regenx-ref-p013.png`, // NAD+
]

/**
 * RegenX Labs hero — "Modern Clinical" direction (pivoted from an earlier
 * dark-luxury pass per Vu's feedback — "cảm giác không hợp"): light
 * ground, precise hairline grid, data-forward framing (reads like a lab
 * dossier/spec sheet rather than an editorial magazine spread), squared
 * (not rounded) CTAs, a technical/geometric display font. Split layout —
 * copy left, real product photo right in a bordered frame — instead of a
 * full-bleed dark photo background.
 */
const Hero = () => {
  return (
    <div className="relative w-full bg-white border-b border-regenx-navy/10">
      {/* Faint technical grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#051224 1px, transparent 1px), linear-gradient(90deg, #051224 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="content-container relative z-10 grid grid-cols-1 small:grid-cols-2 gap-10 small:gap-16 items-center py-16 small:py-24 min-h-0 small:min-h-[80vh]">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-regenx-crimson border border-regenx-crimson/30 px-3 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 bg-regenx-crimson" />
            Research Use Only
          </span>
          <h1 className="font-display text-4xl small:text-6xl leading-[1.08] font-medium tracking-tight text-regenx-navy mb-6">
            Laboratory-Grade
            <br />
            Research Peptides.
          </h1>
          <p className="text-sm small:text-base leading-relaxed text-regenx-muted max-w-md mb-10">
            Manufactured in the USA. Every batch independently tested and
            documented. Not for human or veterinary consumption, diagnostic
            or therapeutic use.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center bg-regenx-navy hover:bg-regenx-navy-light transition-colors text-white text-xs uppercase tracking-widest font-semibold px-8 py-4 min-h-[44px]"
            >
              Shop Products
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center border border-regenx-navy/20 hover:border-regenx-navy text-regenx-navy text-xs uppercase tracking-widest font-semibold px-8 py-4 min-h-[44px] transition-colors"
            >
              View Lab Results
            </LocalizedClientLink>
          </div>

          {/* USA manufacturing badge — moved here to be prominent, per
              Vu's request (trust/credibility signal). */}
          <div className="inline-flex items-center gap-3 border border-regenx-navy/15 bg-regenx-cream/60 pl-2 pr-4 py-2">
            <UsFlag className="w-6 h-auto shrink-0 rounded-[2px]" />
            <span className="text-[11px] uppercase tracking-widest font-semibold text-regenx-navy">
              Manufactured &amp; Packaged in the USA
            </span>
          </div>
        </div>

        <div className="relative aspect-[4/3] small:aspect-square max-h-[420px] border border-regenx-navy/10 bg-regenx-cream/40 overflow-hidden">
          <div className="grid grid-cols-2 grid-rows-2 gap-px h-full w-full bg-regenx-navy/10">
            {HERO_COLLAGE.map((url) => (
              <div
                key={url}
                className="bg-white bg-cover bg-center"
                style={{ backgroundImage: `url(${url})` }}
              />
            ))}
          </div>
          <div className="absolute top-4 left-4 bg-white/95 border border-regenx-navy/10 px-3 py-2">
            <span className="block text-[10px] uppercase tracking-widest text-regenx-muted font-semibold">
              Batch Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
