<?php
/**
 * Icon Button
 *
 * Functions for handling icon button.
 *
 * @version 0.1.9
 */

namespace Blocklayouts;

defined( 'ABSPATH' ) || exit;

/**
 * Apply wrapper link to group
 *
 * @param string $block_content The block content.
 * @param array  $block The block data.
 * @return string The block content with the wrapper link.
 */
function bl_add_wrapper_link_to_group( $block_content, $block ) {

	if ( ! isset( $block['attrs']['wrapperLink']['linkDestination'] ) && ! isset( $block['attrs']['wrapperLink']['href'] ) ) {
		return $block_content;
	}

	$href             = $block['attrs']['wrapperLink']['href'] ?? '';
	$link_destination = $block['attrs']['wrapperLink']['linkDestination'] ?? '';
	$link_target      = $block['attrs']['wrapperLink']['linkTarget'] ?? '_self';
	$link_rel         = '_blank' === $link_target ? 'noopener noreferrer' : 'follow';

	$link = '';

	if ( 'custom' === $link_destination && $href ) {
		$link = $href;
	} elseif ( 'post' === $link_destination ) {
		$link = get_permalink();
	}

	if ( ! $link ) {
		return $block_content;
	}

	// Add the is-linked class to the group block.
	$p = new \WP_HTML_Tag_Processor( $block_content );
	if ( $p->next_tag() ) {
		$p->add_class( 'is-linked' );
	}
	$block_content = $p->get_updated_html();

	$link_markup = sprintf(
		'<a class="wp-block-group__link" href="%1$s" target="%2$s" rel="%3$s" aria-hidden="true" tabindex="-1">&nbsp;</a>',
		esc_url( $link ),
		esc_attr( $link_target ),
		esc_attr( $link_rel )
	);

	// Insert the link markup after the opening tag.
	$block_content = preg_replace(
		'/^\s*<(\w+)([^>]*)>/m',
		'<$1$2>' . $link_markup,
		$block_content,
		1
	);

	return $block_content;
}
add_filter( 'render_block_core/group', __NAMESPACE__ . '\bl_add_wrapper_link_to_group', 10, 2 );