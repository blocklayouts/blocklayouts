<?php
/**
 * Related Posts
 *
 * Functions for handling related posts.
 *
 * @version 0.1.9
 */

namespace Blocklayouts;

defined( 'ABSPATH' ) || exit;

/**
 * Modify related posts query vars
 *
 * @param array $query_vars The query vars.
 * @param mixed $block The block instance.
 * @return array The modified query vars.
 */
function bl_modify_related_posts_query_vars( $query_vars, $block ) {
	$parsed_block = $block->parsed_block;

	if ( ! isset( $parsed_block['attrs']['namespace'] ) || 'blocklayouts/related-posts-template' !== $parsed_block['attrs']['namespace'] ) {
		return $query_vars;
	}

	// Ensure we have a valid post ID (we're on a single post).
	$current_post_id = get_the_ID();
	if ( ! $current_post_id || ! is_singular() ) {
		return $query_vars;
	}

	$context = $block->context;

	$query_vars['inherit']      = false;
	$query_vars['post_type']    = get_post_type();
	$query_vars['post__not_in'] = array( $current_post_id );

	// Get the selected taxonomies from block attributes.
	$selected_taxonomies = isset( $context['relatedPostsTaxonomies'] )
		? $context['relatedPostsTaxonomies']
		: array();

	// Get current post's taxonomy terms.
	$tax_query = array( 'relation' => 'AND' ); // All selected taxonomies must match.

	// If no specific taxonomies are selected, use current post type's taxonomies.
	if ( empty( $selected_taxonomies ) ) {
		$selected_taxonomies = get_object_taxonomies( get_post_type(), 'names' );
		$tax_query           = array( 'relation' => 'OR' ); // Any of the taxonomies in the current post type can match.
	}

	// Build tax_query based on selected taxonomies.
	foreach ( $selected_taxonomies as $taxonomy ) {
		// Check if taxonomy exists.
		if ( ! taxonomy_exists( $taxonomy ) ) {
			continue;
		}

		// Get terms for this taxonomy for the current post.
		$terms = wp_get_post_terms( $current_post_id, $taxonomy, array( 'fields' => 'ids' ) );

		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			$tax_query[] = array(
				'taxonomy' => $taxonomy,
				'field'    => 'term_id',
				'terms'    => $terms,
			);
		}
	}

	// Only apply tax_query if we have valid taxonomy queries.
	if ( count( $tax_query ) > 1 ) {
		$query_vars['tax_query'] = $tax_query;
	}

	return $query_vars;
}
add_filter( 'query_loop_block_query_vars', __NAMESPACE__ . '\bl_modify_related_posts_query_vars', 10, 2 );


/**
 * Add related posts context
 *
 * @param array $context The context.
 * @param array $parsed_block The parsed block data.
 * @return array The modified context.
 */
function bl_add_related_posts_context( $context, $parsed_block, $parent_block ) {

	if ( ! isset( $parsed_block['attrs']['namespace'] ) || 'blocklayouts/related-posts-template' !== $parsed_block['attrs']['namespace'] ) {
		return $context;
	}

	$parsed_parent_block = $parent_block->parsed_block;

	$context['relatedPostsTaxonomies'] = $parsed_parent_block['attrs']['relatedPostsTaxonomies'] ?? array();

	return $context;
}
add_filter( 'render_block_context', __NAMESPACE__ . '\bl_add_related_posts_context', 10, 3 );