import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="font-display text-3xl leading-tight text-regenx-navy font-medium"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {/* Imported product descriptions contain real HTML (headings,
            paragraphs, lists) from the WooCommerce source — render it as
            markup instead of literal text, styled via .regenx-prose in
            globals.css (no typography plugin installed, so plain rules). */}
        <div
          className="regenx-prose text-sm text-regenx-muted"
          data-testid="product-description"
          dangerouslySetInnerHTML={{ __html: product.description || "" }}
        />
      </div>
    </div>
  )
}

export default ProductInfo
