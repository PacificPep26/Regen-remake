/**
 * One-off: extend the existing fulfillment/shipping setup to cover the US
 * region — the initial Medusa seed only configured shipping for the demo
 * "Europe" service zone (gb/de/dk/se/fr/es/it), so after creating a real
 * "United States" region for RegenX, checkout had zero shipping options
 * to offer for a US address (blocked "Continue to payment").
 *
 * Adds a "United States" service zone to the existing fulfillment set,
 * with a flat-rate "Standard Shipping" option priced in USD — a
 * placeholder until Phase 8 (Shippo live-rate integration) replaces it
 * with real USPS/UPS rates.
 *
 * Run with: pnpm exec medusa exec ./src/scripts/add-us-shipping.ts
 */

import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function addUsShipping({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name", "service_zones.id", "service_zones.name"],
  })

  const fulfillmentSet = fulfillmentSets[0]
  if (!fulfillmentSet) {
    logger.error("No fulfillment set found — run the initial seed first.")
    return
  }

  const existingUsZone = fulfillmentSet.service_zones?.find(
    (z: any) => z.name === "United States"
  )
  if (existingUsZone) {
    logger.info("United States service zone already exists — nothing to do.")
    return
  }

  logger.info(`Adding "United States" service zone to fulfillment set ${fulfillmentSet.id}...`)
  const usServiceZone = await fulfillmentModuleService.createServiceZones({
    name: "United States",
    fulfillment_set_id: fulfillmentSet.id,
    geo_zones: [{ country_code: "us", type: "country" }],
  })

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfiles[0]

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: usServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 3-5 business days.",
          code: "standard",
        },
        prices: [{ currency_code: "usd", amount: 8 }],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: usServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 1-2 business days.",
          code: "express",
        },
        prices: [{ currency_code: "usd", amount: 25 }],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })

  logger.info("Added Standard ($8) and Express ($25) shipping for the United States service zone.")
}
