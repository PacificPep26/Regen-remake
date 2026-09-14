import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="flex items-start relative">
      {/* Capped width — the original starter's `w-full` inside a flex-1
          column let this stretch to fill all remaining space in the
          3-column PDP layout (~800px+ wide, ~1000px tall at the 29:34
          ratio), reading as "giant" per Vu's feedback. Max 460px keeps it
          proportionate to a compact clinical product-shot presentation. */}
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4 max-w-[460px] mx-auto">
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle border border-regenx-navy/10"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-rounded"
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
