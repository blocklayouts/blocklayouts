<?php
/**
 * Infinite Scroll
 *
 * Server side of the blocklayouts/infinite-scroll block.
 *
 * "Load more" doesn't clone HTML into the page: cloned markup is never
 * hydrated by the Interactivity API, so interactive blocks inside the new
 * posts (copy buttons, etc.) would stay dead. Instead the block asks the
 * Interactivity API router for the same page with `query-{queryId}-loaded=N`,
 * and the server renders pages 1..N of the Query Loop in one go. The router
 * swaps the Query Loop region and hydrates everything in it.
 *
 * Queries that inherit the template query use `bl-loaded=N` instead.
 *
 * @package Blocklayouts
 * @since 0.2.2
 */

namespace Blocklayouts;

defined( 'ABSPATH' ) || exit;

/**
 * Most pages that can be loaded at once, to keep responses bounded.
 */
const BL_INFINITE_SCROLL_MAX_LOADED = 50;

/**
 * URL parameter holding the number of loaded pages.
 *
 * @param int  $query_id Query Loop queryId.
 * @param bool $inherit  Whether the Query Loop inherits the template query.
 * @return string
 */
function bl_infinite_scroll_param( $query_id, $inherit = false ) {
	return $inherit ? 'bl-loaded' : 'query-' . absint( $query_id ) . '-loaded';
}

/**
 * Number of loaded pages requested in the URL (at least 1).
 *
 * @param string $param URL parameter name.
 * @return int
 */
function bl_infinite_scroll_get_loaded( $param ) {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public parameter.
	$loaded = isset( $_GET[ $param ] ) ? absint( $_GET[ $param ] ) : 1;

	return max( 1, min( BL_INFINITE_SCROLL_MAX_LOADED, $loaded ) );
}

/**
 * Whether a parsed block contains an infinite scroll block.
 *
 * @param array $parsed_block Parsed block.
 * @return bool
 */
function bl_has_infinite_scroll( $parsed_block ) {
	foreach ( $parsed_block['innerBlocks'] ?? array() as $inner_block ) {
		if ( 'blocklayouts/infinite-scroll' === $inner_block['blockName'] || bl_has_infinite_scroll( $inner_block ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Render pages 1..N of a custom Query Loop.
 *
 * @param array     $query The WP_Query args built from the Query Loop block.
 * @param \WP_Block $block The block instance.
 * @return array
 */
function bl_infinite_scroll_query_vars( $query, $block ) {
	if ( ! isset( $block->context['queryId'] ) ) {
		return $query;
	}

	$loaded = bl_infinite_scroll_get_loaded( bl_infinite_scroll_param( $block->context['queryId'] ) );
	if ( $loaded < 2 || empty( $query['posts_per_page'] ) || $query['posts_per_page'] < 1 ) {
		return $query;
	}

	$query['posts_per_page'] = (int) $query['posts_per_page'] * $loaded;
	$query['paged']          = 1;

	if ( isset( $query['offset'] ) ) {
		$query['offset'] = absint( $block->context['query']['offset'] ?? 0 );
	}

	return $query;
}
add_filter( 'query_loop_block_query_vars', __NAMESPACE__ . '\bl_infinite_scroll_query_vars', 30, 2 );

/**
 * Render pages 1..N of the main query, for Query Loops that inherit it.
 *
 * @param \WP_Query $query The query.
 */
function bl_infinite_scroll_main_query( $query ) {
	if ( is_admin() || ! $query->is_main_query() || $query->is_singular() ) {
		return;
	}

	$loaded = bl_infinite_scroll_get_loaded( bl_infinite_scroll_param( 0, true ) );
	if ( $loaded < 2 ) {
		return;
	}

	$per_page = (int) ( $query->get( 'posts_per_page' ) ? $query->get( 'posts_per_page' ) : get_option( 'posts_per_page' ) );
	if ( $per_page < 1 ) {
		return;
	}

	$query->set( 'bl_per_page', $per_page );
	$query->set( 'posts_per_page', $per_page * $loaded );
	$query->set( 'paged', 1 );
}
add_action( 'pre_get_posts', __NAMESPACE__ . '\bl_infinite_scroll_main_query' );

/**
 * Turn a Query Loop that contains an infinite scroll block into a router region.
 *
 * Core only does this when "Reload full page" is off; infinite scroll needs
 * it either way. The region id matches core's, so both stay compatible.
 *
 * @param string $block_content The block content.
 * @param array  $block         The parsed block.
 * @return string
 */
function bl_infinite_scroll_router_region( $block_content, $block ) {
	if ( ! isset( $block['attrs']['queryId'] ) || ! bl_has_infinite_scroll( $block ) ) {
		return $block_content;
	}

	$processor = new \WP_HTML_Tag_Processor( $block_content );

	if ( $processor->next_tag() ) {
		if ( null === $processor->get_attribute( 'data-wp-interactive' ) ) {
			$processor->set_attribute( 'data-wp-interactive', 'blocklayouts/infinite-scroll' );
		}
		if ( null === $processor->get_attribute( 'data-wp-router-region' ) ) {
			$processor->set_attribute( 'data-wp-router-region', 'query-' . $block['attrs']['queryId'] );
		}
		$block_content = $processor->get_updated_html();
	}

	return $block_content;
}
add_filter( 'render_block_core/query', __NAMESPACE__ . '\bl_infinite_scroll_router_region', 10, 2 );

/**
 * Total number of pages of the Query Loop an infinite scroll block lives in,
 * at the original page size, with every query filter applied.
 *
 * @param \WP_Block $block The infinite scroll block.
 * @return int
 */
function bl_infinite_scroll_total_pages( $block ) {
	$query_attributes = $block->context['query'] ?? array();
	$max_pages        = absint( $query_attributes['pages'] ?? 0 );

	if ( ! empty( $query_attributes['inherit'] ) ) {
		global $wp_query;

		$per_page = (int) $wp_query->get( 'bl_per_page' );
		$per_page = $per_page > 0 ? $per_page : (int) $wp_query->get( 'posts_per_page' );
		$total    = $per_page > 0 ? (int) ceil( $wp_query->found_posts / $per_page ) : 1;
	} else {
		$query_args = build_query_vars_from_query_block( $block, 1 );
		$query_args = apply_filters( 'query_loop_block_query_vars', $query_args, $block, 1 ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Core hook.

		$per_page = absint( $query_attributes['perPage'] ?? get_option( 'posts_per_page' ) );
		$offset   = absint( $query_attributes['offset'] ?? 0 );

		$query_args['posts_per_page'] = 1;
		$query_args['paged']          = 1;
		$query_args['offset']         = 0;
		$query_args['fields']         = 'ids';
		$query_args['no_found_rows']  = false;

		$count_query = new \WP_Query( $query_args );
		$found_posts = max( 0, (int) $count_query->found_posts - $offset );
		$total       = $per_page > 0 ? (int) ceil( $found_posts / $per_page ) : 1;
	}

	return $max_pages > 0 ? min( $total, $max_pages ) : $total;
}
