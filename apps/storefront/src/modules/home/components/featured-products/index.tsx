import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

/**
 * The RegenX catalog is organized by Category (Cognitive, Recovery &
 * Healing, etc — see the migration import), not Medusa Collections, so
 * this pulls straight from the product list instead of a collection-based
 * rail (the original starter's rail returns nothing here since 0
 * collections exist for this store).
 */
export default async function FeaturedProducts({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 8,
      fields: "*variants.calculated_price",
      order: "-created_at",
    },
  })

  if (!products?.length) {
    return null
  }

  return (
    <div className="content-container py-16 small:py-28">
      <div className="flex items-end justify-between mb-10 small:mb-14">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-regenx-crimson mb-2">
            Most Popular
          </span>
          <h2 className="font-display text-3xl small:text-5xl font-medium tracking-tight text-regenx-navy">
            Best Sellers
          </h2>
        </div>
        <InteractiveLink href="/store">View all</InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-4 gap-4 small:gap-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
