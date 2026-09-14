/**
 * One-off import: reads scripts/migration/products.json (produced by the
 * WordPress export script) and creates the real RegenX Labs catalog in
 * Medusa — categories, then all 36 products (simple + variable) with
 * their real images uploaded via the File module.
 *
 * All products are created as DRAFT (not published) — the local WP dev DB
 * and the documented production state disagree on which products
 * (GLP-1s, Bundles) should actually be public; draft is the safe default
 * until Vu verifies real production status and manually publishes.
 *
 * Run with: npx medusa exec ./src/scripts/import-regenx-products.ts
 * (stop `pnpm run backend:dev` first — medusa exec boots its own instance
 * and the two will fight over the in-memory/Redis workflow lock.)
 */

import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows";
import * as fs from "fs";
import * as path from "path";

type ExportedVariation = {
  wc_variation_id: number;
  sku: string;
  slug: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  attributes: Record<string, string>;
  house_code: { is_masked: boolean; real_slug: string | null };
};

type ExportedProduct = {
  wc_id: number;
  type: "simple" | "variable";
  title: string;
  slug: string;
  sku: string;
  status: string;
  stock_status: string;
  regular_price: string;
  sale_price: string;
  short_description: string;
  description: string;
  categories: string[];
  image: { attachment_id: number; path: string; filename: string } | null;
  gallery: { attachment_id: number; path: string; filename: string }[];
  house_code: {
    is_masked: boolean;
    search_alias: string;
  };
  variations: ExportedVariation[];
};

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function categoryName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function uploadImage(
  container: MedusaContainer,
  imagePath: string
): Promise<string | null> {
  if (!imagePath || !fs.existsSync(imagePath)) {
    return null;
  }
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = MIME_BY_EXT[ext] || "image/jpeg";
  const content = fs.readFileSync(imagePath).toString("base64");
  const filename = path.basename(imagePath);

  const { result } = await uploadFilesWorkflow(container).run({
    input: {
      files: [
        {
          filename,
          mimeType,
          content,
          access: "public",
        },
      ],
    },
  });
  return result[0]?.url || null;
}

export default async function importRegenxProducts({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const jsonPath = path.resolve(
    __dirname,
    "../../../../scripts/migration/products.json"
  );
  if (!fs.existsSync(jsonPath)) {
    logger.error(`products.json not found at ${jsonPath} — run the WooCommerce export script first.`);
    return;
  }
  const products: ExportedProduct[] = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8")
  );
  logger.info(`Loaded ${products.length} products from export.`);

  // Resolve existing infra created by the initial seed script.
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultSalesChannel = salesChannels[0];
  if (!defaultSalesChannel) {
    logger.error("No sales channel found — run the initial seed first (it should have run automatically during create-medusa-app).");
    return;
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfiles[0];

  // Categories: create any that don't already exist.
  const categorySlugSet = new Set<string>();
  products.forEach((p) => p.categories.forEach((c) => categorySlugSet.add(c)));
  const categorySlugs = Array.from(categorySlugSet);

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  });
  const existingHandles = new Set(existingCategories.map((c) => c.handle));
  const toCreate = categorySlugs.filter((slug) => !existingHandles.has(slug));

  let createdCategories: { id: string; handle: string }[] = [];
  if (toCreate.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreate.map((slug) => ({
          name: categoryName(slug),
          handle: slug,
          is_active: true,
        })),
      },
    });
    createdCategories = result;
    logger.info(`Created ${result.length} categories.`);
  }

  const allCategories = [...existingCategories, ...createdCategories];
  const categoryIdBySlug = new Map(
    allCategories.map((c: any) => [c.handle, c.id])
  );

  // Build product inputs, uploading images as we go.
  const productInputs: any[] = [];
  let imagesUploaded = 0;
  let imagesFailed = 0;

  for (const p of products) {
    let imageUrl: string | null = null;
    if (p.image?.path) {
      try {
        imageUrl = await uploadImage(container, p.image.path);
        if (imageUrl) {
          imagesUploaded++;
        } else {
          imagesFailed++;
        }
      } catch (e) {
        imagesFailed++;
        logger.warn(`Image upload failed for ${p.title} (${p.image.path}): ${e}`);
      }
    }

    const category_ids = p.categories
      .map((slug) => categoryIdBySlug.get(slug))
      .filter(Boolean) as string[];

    const base: any = {
      title: p.title,
      handle: p.slug,
      description: p.description || p.short_description || undefined,
      status: ProductStatus.DRAFT, // safe default — verify prod status before publishing (see PROGRESS.md)
      category_ids,
      shipping_profile_id: shippingProfile?.id,
      images: imageUrl ? [{ url: imageUrl }] : [],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        wc_id: p.wc_id,
        search_alias: p.house_code.search_alias || undefined,
      },
    };

    if (p.type === "simple") {
      const price = parseFloat(p.sale_price || p.regular_price || "0");
      base.variants = [
        {
          title: "Default",
          sku: p.sku || `WC-${p.wc_id}`,
          manage_inventory: false,
          prices: [{ amount: price, currency_code: "usd" }],
        },
      ];
      base.options = [{ title: "Type", values: ["Default"] }];
      base.variants[0].options = { Type: "Default" };
    } else {
      // Variable product — derive a single option (usually "Strength"/"Volume")
      // from whichever attribute key the variations actually use.
      const firstVariationAttrs = p.variations[0]?.attributes || {};
      const optionTitle = Object.keys(firstVariationAttrs)[0] || "Option";
      const optionValues = Array.from(
        new Set(
          p.variations
            .map((v) => v.attributes[optionTitle])
            .filter(Boolean) as string[]
        )
      );
      base.options = [{ title: optionTitle, values: optionValues }];
      base.variants = p.variations.map((v) => {
        const price = parseFloat(v.sale_price || v.regular_price || "0");
        return {
          title: v.attributes[optionTitle] || v.sku,
          sku: v.sku || `WC-${v.wc_variation_id}`,
          manage_inventory: false,
          options: { [optionTitle]: v.attributes[optionTitle] || "" },
          prices: [{ amount: price, currency_code: "usd" }],
          metadata: { wc_variation_id: v.wc_variation_id },
        };
      });
    }

    productInputs.push(base);
  }

  logger.info(
    `Images: ${imagesUploaded} uploaded, ${imagesFailed} failed/missing. Creating ${productInputs.length} products...`
  );

  // Create in batches of 10 to keep each workflow call manageable.
  const BATCH = 10;
  let created = 0;
  for (let i = 0; i < productInputs.length; i += BATCH) {
    const batch = productInputs.slice(i, i + BATCH);
    try {
      await createProductsWorkflow(container).run({ input: { products: batch } });
      created += batch.length;
      logger.info(`Created products ${i + 1}-${i + batch.length} of ${productInputs.length}`);
    } catch (e) {
      logger.error(`Batch ${i / BATCH + 1} failed: ${e}`);
      // Fall back to one-by-one for this batch so a single bad product
      // doesn't sink the whole batch.
      for (const single of batch) {
        try {
          await createProductsWorkflow(container).run({ input: { products: [single] } });
          created++;
        } catch (e2) {
          logger.error(`Product "${single.title}" (handle ${single.handle}) failed: ${e2}`);
        }
      }
    }
  }

  logger.info(`Import complete: ${created}/${productInputs.length} products created (all as DRAFT).`);
}
