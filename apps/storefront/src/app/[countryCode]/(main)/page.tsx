import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "RegenX Labs — Laboratory-Grade Research Peptides",
  description:
    "Research-use-only peptides manufactured in the USA, supported by independent testing and batch documentation.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      <Hero />
      <FeaturedProducts region={region} />
    </>
  )
}
