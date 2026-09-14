/**
 * Slim top announcement strip — "Tested / Verified / Insured / USA
 * Manufactured" (moved here from the Hero's spec grid per Vu's request:
 * "để lên trên đầu kiểu cho nó thanh nhỏ chạy ngang"). Global, sits above
 * the main Nav, matching the equivalent top bar on the original WordPress
 * site.
 */
const TrustBar = () => {
  const items = ["Tested", "Verified", "Insured", "USA Manufactured"]

  return (
    <div className="w-full bg-regenx-navy">
      <div className="content-container flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-[10px] small:text-[11px] uppercase tracking-[0.2em] font-semibold text-white/90">
        {items.map((item, i) => (
          <span key={item} className="inline-flex items-center gap-2">
            {item}
            {i < items.length - 1 && (
              <span className="text-regenx-crimson-bright">&bull;</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

export default TrustBar
