<?php
/**
 * Category Filter
 *
 * Server-side helpers for the blocklayouts/category-filter block: the URL
 * parameter convention and the Query Loop filtering that reads it.
 *
 * The filter uses the same naming convention as core's Query Loop pagination
 * (`query-{queryId}-page`), so a filter for the `category` taxonomy on Query
 * Loop 3 reads and writes `?query-3-category=news`. Because the parameter is
 * scoped to one queryId, it never leaks into other Query Loops on the page and
 * does not depend on the order in which blocks are rendered.
 *
 * @package Blocklayouts
 * @since 0.2.2
 */

namespace Blocklayouts;

defined( 'ABSPATH' ) || exit;

/**
 * Build the URL parameter name for a Query Loop + taxonomy pair.
 *
 * @param int    $query_id Query Loop queryId.
 * @param string $taxonomy Taxonomy name.
 * @return string
 */
function bl_category_filter_param( $query_id, $taxonomy ) {
	return 'query-' . absint( $query_id ) . '-' . $taxonomy;
}

/**
 * Read the selected term slug for a Query Loop + taxonomy pair from the request.
 *
 * @param int    $query_id Query Loop queryId.
 * @param string $taxonomy Taxonomy name.
 * @return string Term slug, or an empty string when nothing is selected.
 */
function bl_category_filter_get_selected( $query_id, $taxonomy ) {
	$param = bl_category_filter_param( $query_id, $taxonomy );

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter.
	if ( empty( $_GET[ $param ] ) || ! is_string( $_GET[ $param ] ) ) {
		return '';
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter.
	return sanitize_title( wp_unslash( $_GET[ $param ] ) );
}

/**
 * Convert a block style value such as `var:preset|spacing|40` to CSS.
 *
 * @param mixed $value Raw block style value.
 * @return string CSS value, or an empty string.
 */
function bl_category_filter_css_value( $value ) {
	if ( ! is_string( $value ) || '' === $value ) {
		return '';
	}

	if ( 0 === strpos( $value, 'var:' ) ) {
		$parts = explode( '|', substr( $value, 4 ) );
		return 'var(--wp--' . implode( '--', array_map( 'sanitize_key', $parts ) ) . ')';
	}

	return $value;
}

/**
 * Apply category filter URL parameters to a non-inherited Query Loop.
 *
 * @param array     $query The WP_Query args built from the Query Loop block.
 * @param \WP_Block $block The block instance (core/post-template).
 * @return array
 */
function bl_category_filter_query_vars( $query, $block ) {
	if ( empty( $_GET ) || ! isset( $block->context['queryId'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return $query;
	}

	$query_id   = absint( $block->context['queryId'] );
	$prefix     = 'query-' . $query_id . '-';
	$post_types = isset( $query['post_type'] ) ? (array) $query['post_type'] : array( 'post' );
	$tax_query  = array();

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter.
	foreach ( array_keys( $_GET ) as $param ) {
		if ( ! is_string( $param ) || 0 !== strpos( $param, $prefix ) ) {
			continue;
		}

		$taxonomy = substr( $param, strlen( $prefix ) );

		// `query-{id}-page` belongs to core pagination.
		if ( 'page' === $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
			continue;
		}

		// Only filter by taxonomies that are attached to the queried post type.
		if ( ! array_intersect( $post_types, get_taxonomy( $taxonomy )->object_type ) ) {
			continue;
		}

		$slug = bl_category_filter_get_selected( $query_id, $taxonomy );
		if ( '' === $slug ) {
			continue;
		}

		$tax_query[] = array(
			'taxonomy'         => $taxonomy,
			'field'            => 'slug',
			'terms'            => array( $slug ),
			'include_children' => true,
		);
	}

	if ( empty( $tax_query ) ) {
		return $query;
	}

	if ( ! empty( $query['tax_query'] ) ) {
		$tax_query[] = $query['tax_query'];
	}

	$tax_query['relation'] = 'AND';
	$query['tax_query']    = $tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query

	return $query;
}
add_filter( 'query_loop_block_query_vars', __NAMESPACE__ . '\bl_category_filter_query_vars', 20, 2 );
