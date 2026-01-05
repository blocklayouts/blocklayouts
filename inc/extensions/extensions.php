<?php
/**
 * Extensions
 *
 * @version 0.1.9
 */

namespace Blocklayouts;

defined( 'ABSPATH' ) || exit;

// Include all extensions.
require_once __DIR__ . '/icon-button.php';
require_once __DIR__ . '/related-posts.php';
require_once __DIR__ . '/wrapper-link.php';
require_once __DIR__ . '/additional-css.php';

/**
 * Add router region data attribute to query block
 *
 * @param string $block_content The block content.
 * @param array  $block The block data.
 * @return string The block content with the router region attribute.
 */
function bl_add_router_region_to_query( $block_content, $block ) {
	// Check if queryId exists in the block attributes.
	if ( ! isset( $block['attrs']['queryId'] ) ) {
		return $block_content;
	}

	$query_id = $block['attrs']['queryId'];

	// Use WP_HTML_Tag_Processor to add the data attribute.
	$p = new \WP_HTML_Tag_Processor( $block_content );

	if ( $p->next_tag() ) {
		$p->set_attribute( 'data-blocklayouts-router-region', 'query-' . $query_id );
		$block_content = $p->get_updated_html();
	}

	return $block_content;
}
add_filter( 'render_block_core/query', __NAMESPACE__ . '\bl_add_router_region_to_query', 10, 2 );


/**
 * Add anchor to heading
 *
 * @param string $block_content The block content.
 * @param array  $block The block data.
 * @return string The block content with the anchor.
 */
function bl_add_anchor_to_heading( $block_content, $block ) {
	// Only add anchors on single posts/cpts.
	if ( ! is_single() ) {
		return $block_content;
	}

	$anchor_regex = '/[\s#]/';

	// Generate anchor from heading content.
	$anchor = trim( wp_strip_all_tags( $block_content ) );
	$anchor = strtolower( $anchor );
	$anchor = preg_replace( $anchor_regex, '-', $anchor );

	// Add the anchor ID to the heading using WP_HTML_Tag_Processor.
	$p = new \WP_HTML_Tag_Processor( $block_content );

	$header_tags = array( 'H1', 'H2', 'H3', 'H4', 'H5', 'H6' );
	if ( $p->next_tag() ) {
		if ( in_array( $p->get_tag(), $header_tags, true ) ) {
			// Only add if no ID exists.

			if ( ! $p->get_attribute( 'id' ) ) {
				$p->set_attribute( 'id', $anchor );
				$block_content = $p->get_updated_html();
			}
		}
	}

	return $block_content;
}
add_filter( 'render_block_core/heading', __NAMESPACE__ . '\bl_add_anchor_to_heading', 10, 2 );