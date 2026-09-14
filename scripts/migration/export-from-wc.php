<?php
/**
 * One-off, read-only export of the RegenX Labs WooCommerce catalog into a
 * normalized intermediate JSON file (products.json) for the Medusa v2
 * remake's import step. Does NOT touch WordPress/WooCommerce data.
 *
 * Run from anywhere with the local WordPress PHP:
 *   D:\xampp\php\php.exe export-from-wc.php > products.json
 *
 * Source of truth for the house-code / real-name mapping: the redirect map
 * in inc/product-house-code-redirects.php (copied below) plus each
 * product's _regenx_search_alias meta — there is no separate canonical
 * "real name" field in the current system.
 */

define( 'WP_USE_THEMES', false );
require 'C:\\Vu\\Peptide\\Regenx\\wp-load.php';

// Mirrors inc/product-house-code-redirects.php exactly (old slug => house-code slug).
$house_code_redirects = array(
	'semaglutide-5mg'               => 'rp-100-5mg',
	'semaglutide-10mg'              => 'rp-100-10mg',
	'semaglutide-15mg'              => 'rp-100-15mg',
	'semaglutide-20mg'              => 'rp-100-20mg',
	'semaglutide-30mg'              => 'rp-100-30mg',
	'tirzepatide-5mg'               => 'rp-200-5mg',
	'tirzepatide-10mg'              => 'rp-200-10mg',
	'tirzepatide-15mg'              => 'rp-200-15mg',
	'tirzepatide-20mg'              => 'rp-200-20mg',
	'tirzepatide-30mg'              => 'rp-200-30mg',
	'tirzepatide-40mg'              => 'rp-200-40mg',
	'tirzepatide-45mg'              => 'rp-200-45mg',
	'tirzepatide-50mg'              => 'rp-200-50mg',
	'tirzepatide-60mg'              => 'rp-200-60mg',
	'retatrutide-5mg'               => 'rp-300-5mg',
	'retatrutide-10mg'              => 'rp-300-10mg',
	'retatrutide-15mg'              => 'rp-300-15mg',
	'retatrutide-20mg'              => 'rp-300-20mg',
	'retatrutide-30mg'              => 'rp-300-30mg',
	'retatrutide-40mg'              => 'rp-300-40mg',
	'retatrutide-50mg'              => 'rp-300-50mg',
	'cagrilintide-5mg'              => 'rp-400-5mg',
	'cagrilintide-10mg'             => 'rp-400-10mg',
	'cagrilintide-semaglutide-5mg'  => 'rp-450-5mg',
	'cagrilintide-semaglutide-10mg' => 'rp-450-10mg',
	'mazdutide-10mg'                => 'rp-500-10mg',
	'survodutide-10mg'              => 'rp-600-10mg',
);
// Invert to house-code-slug => old (real-name) slug, for easy lookup per product.
$house_code_to_real_slug = array_flip( $house_code_redirects );

/**
 * Resolve a WP attachment ID to a real, on-disk absolute file path.
 *
 * @param int $attachment_id Attachment post ID.
 * @return string|null Absolute path, or null if not found/not a real file.
 */
function regenx_export_attachment_path( $attachment_id ) {
	if ( ! $attachment_id ) {
		return null;
	}
	$path = get_attached_file( $attachment_id );
	return ( $path && file_exists( $path ) ) ? $path : null;
}

$product_ids = wc_get_products(
	array(
		'status' => array( 'publish', 'draft', 'private' ), // export everything; import step decides what to publish
		'limit'  => -1,
		'return' => 'ids',
		'type'   => array( 'simple', 'variable' ),
	)
);

$export = array();

foreach ( $product_ids as $product_id ) {
	$product = wc_get_product( $product_id );
	if ( ! $product ) {
		continue;
	}

	$slug          = $product->get_slug();
	$real_slug     = $house_code_to_real_slug[ $slug ] ?? null;
	$search_alias  = get_post_meta( $product_id, '_regenx_search_alias', true );

	// COA (Certificate of Analysis) data is deliberately NOT exported here —
	// all current records are placeholder/pending text anyway (not real lab
	// results), and the local DB has pre-existing charset corruption in some
	// of that placeholder text. Decision: skip for now, re-enter real COA
	// data directly in the new Medusa admin's COA module once built
	// (Phase 4) rather than migrating placeholder junk forward.

	$categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'slugs' ) );

	$image_id      = $product->get_image_id();
	$gallery_ids   = $product->get_gallery_image_ids();

	$entry = array(
		'wc_id'          => $product_id,
		'type'           => $product->is_type( 'variable' ) ? 'variable' : 'simple',
		'title'          => $product->get_name(),
		'slug'           => $slug,
		'sku'            => $product->get_sku(),
		'status'         => $product->get_status(), // publish|draft|private — verify against production before trusting
		'stock_status'   => $product->get_stock_status(),
		'regular_price'  => $product->get_regular_price(),
		'sale_price'     => $product->get_sale_price(),
		'short_description' => $product->get_short_description(),
		'description'    => $product->get_description(),
		'categories'     => $categories,
		'image'          => $image_id ? array(
			'attachment_id' => $image_id,
			'path'          => regenx_export_attachment_path( $image_id ),
			'filename'      => basename( (string) regenx_export_attachment_path( $image_id ) ),
		) : null,
		'gallery'        => array_values( array_filter( array_map(
			function ( $id ) {
				$path = regenx_export_attachment_path( $id );
				return $path ? array( 'attachment_id' => $id, 'path' => $path, 'filename' => basename( $path ) ) : null;
			},
			$gallery_ids
		) ) ),
		'house_code'     => array(
			// House-code slugs live on VARIATIONS (e.g. "rp-100-10mg"), not
			// the parent product (parent is just "smg1") — confirmed by
			// checking the actual local data (SMG1 parent id 172 has
			// children slugged "rp-100-10mg"/"rp-100-20mg"). is_masked/
			// search_alias stay parent-level; per-variation real_slug is
			// set below once each variation is processed.
			'is_masked'    => (bool) $search_alias || null !== $real_slug,
			'search_alias' => $search_alias,
		),
		'variations'     => array(),
	);

	if ( $product->is_type( 'variable' ) ) {
		foreach ( $product->get_children() as $variation_id ) {
			$variation = wc_get_product( $variation_id );
			if ( ! $variation ) {
				continue;
			}
			$variation_slug   = $variation->get_slug();
			$variation_real   = $house_code_to_real_slug[ $variation_slug ] ?? null;
			$entry['variations'][] = array(
				'wc_variation_id' => $variation_id,
				'sku'             => $variation->get_sku(),
				'slug'            => $variation_slug,
				'regular_price'   => $variation->get_regular_price(),
				'sale_price'      => $variation->get_sale_price(),
				'stock_status'    => $variation->get_stock_status(),
				'attributes'      => $variation->get_variation_attributes(),
				'house_code'      => array(
					'is_masked' => null !== $variation_real,
					'real_slug' => $variation_real, // e.g. "semaglutide-10mg" — the pre-migration slug
				),
			);
			if ( null !== $variation_real ) {
				$entry['house_code']['is_masked'] = true;
			}
		}
	}

	$export[] = $entry;
}

// Bundle SKUs (RX-BUNDLE-*) are ordinary simple products already included
// above via wc_get_products() — no separate handling needed; the import
// step keeps them as flat-priced simple products, matching current reality.

echo wp_json_encode( $export, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
