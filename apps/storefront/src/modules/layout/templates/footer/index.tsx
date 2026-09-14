import { listCategories } from "@lib/data/categories";

import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default async function Footer() {
  const productCategories = await listCategories();

  return (
    <footer className="w-full bg-regenx-navy text-white/70">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 small:flex-row items-start justify-between py-16 small:py-24">
          <div>
            <LocalizedClientLink
              href="/"
              className="font-display text-white font-semibold tracking-[0.05em] text-2xl"
            >
              RegenX Labs
            </LocalizedClientLink>
            <p className="mt-4 max-w-xs text-xs text-white/50 leading-relaxed">
              Research-use-only peptides manufactured in the USA. Not for
              human or veterinary consumption, diagnostic or therapeutic use.
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="text-white text-xs uppercase tracking-widest font-semibold">
                  Shop
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 8).map((c) => {
                    if (c.parent_category) {
                      return;
                    }
                    return (
                      <li key={c.id} className="text-white/60 text-sm">
                        <LocalizedClientLink
                          className="hover:text-white transition-colors"
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-3">
              <span className="text-white text-xs uppercase tracking-widest font-semibold">
                Company
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-white/60 text-sm">
                <li>
                  <LocalizedClientLink className="hover:text-white transition-colors" href="/">
                    About Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-white transition-colors" href="/">
                    Lab Results
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-white transition-colors" href="/">
                    Wholesale
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-3">
              <span className="text-white text-xs uppercase tracking-widest font-semibold">
                Legal
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-white/60 text-sm">
                <li>
                  <LocalizedClientLink className="hover:text-white transition-colors" href="/">
                    Terms of Service
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-white transition-colors" href="/">
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-white transition-colors" href="/">
                    Shipping Policy
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full py-6 border-t border-white/10 justify-between text-white/40 text-xs">
          <span>© {new Date().getFullYear()} RegenX Labs. All rights reserved.</span>
          <span className="hidden small:inline">Research Use Only — Not for human or veterinary use.</span>
        </div>
      </div>
    </footer>
  );
}
