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
 * Apply inline icon to button
 *
 * @param string $block_content The block content.
 * @return string The block content with the inline icon.
 */
function bl_add_inline_icon_to_button( $block_content ) {
	// Check if the button contains our inline icon.
	if ( strpos( $block_content, 'wp-blocklayouts-inline-icon' ) === false ) {
		return $block_content;
	}

	$processor = new \WP_HTML_Tag_Processor( $block_content );

	// Find the inline icon image.
	if ( $processor->next_tag(
		array(
			'tag_name'   => 'img',
			'class_name' => 'wp-blocklayouts-inline-icon',
		)
	) ) {

		// Extract attributes we need.
		$width        = $processor->get_attribute( 'width' );
		$icon_svg     = $processor->get_attribute( 'icon' );
		$icon_type    = $processor->get_attribute( 'icon-type' );
		$margin_left  = $processor->get_attribute( 'margin-left' );
		$margin_right = $processor->get_attribute( 'margin-right' );
		$color        = $processor->get_attribute( 'custom-color' );

		if ( $icon_svg ) {
			$icon_svg = html_entity_decode( $icon_svg );

			$styles = array();
			if ( $width ) {
				$styles[] = 'width: ' . esc_attr( $width ) . 'px';
				$styles[] = 'height: ' . esc_attr( $width ) . 'px';
			}
			if ( ! empty( $margin_left ) ) {
				$styles[] = 'margin-left: ' . esc_attr( $margin_left ) . 'px';
			}
			if ( ! empty( $margin_right ) ) {
				$styles[] = 'margin-right: ' . esc_attr( $margin_right ) . 'px';
			}
			if ( ! empty( $color ) ) {
				$styles[] = 'color: ' . esc_attr( $color );
			}
			$style_attr = $styles ? 'style="' . implode( '; ', $styles ) . ';"' : '';

			// Build class string with custom color class if color is set.
			$class_parts = array( 'wp-blocklayouts-inline-icon', 'is-' . esc_attr( $icon_type ) );
			if ( ! empty( $color ) ) {
				$class_parts[] = 'has-custom-color';
			}
			$class_string = implode( ' ', $class_parts );

			// Create the replacement span with inline SVG.
			$replacement   = sprintf(
				'<span class="%s" %s>%s</span>',
				$class_string,
				$style_attr,
				$icon_svg
			);
			$block_content = $processor->get_updated_html();

			// Remove the inline icon image and replace with SVG span.
			$block_content = preg_replace(
				'/<img[^>]*class="[^"]*wp-blocklayouts-inline-icon[^"]*"[^>]*>/',
				$replacement,
				$block_content
			);
		}
	}

	return $block_content;
}
add_filter( 'render_block_core/button', __NAMESPACE__ . '\bl_add_inline_icon_to_button', 10, 2 );