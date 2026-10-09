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
 * Allowed SVG tags/attributes for icon output via wp_kses().
 *
 * @return array Allowed tags map for wp_kses().
 */
function bl_get_allowed_icon_svg_tags() {
	return array(
		'svg' => array(
			'class' => true,
			'role' => true,
			'aria-hidden' => true,
			'aria-labelledby' => true,
			'focusable' => true,
			'xmlns' => true,
			'xmlns:xlink' => true,
			'width' => true,
			'height' => true,
			'viewbox' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'stroke-linecap' => true,
			'stroke-linejoin' => true,
			'style' => true,
		),
		'g' => array(
			'fill' => true,
			'stroke' => true,
			'transform' => true,
			'class' => true,
		),
		'title' => array(),
		'defs' => array(),
		'path' => array(
			'd' => true,
			'fill' => true,
			'fill-rule' => true,
			'clip-rule' => true,
			'stroke' => true,
			'stroke-width' => true,
			'stroke-linecap' => true,
			'stroke-linejoin' => true,
			'opacity' => true,
			'class' => true,
		),
		'circle' => array(
			'cx' => true,
			'cy' => true,
			'r' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'opacity' => true,
			'class' => true,
		),
		'ellipse' => array(
			'cx' => true,
			'cy' => true,
			'rx' => true,
			'ry' => true,
			'fill' => true,
			'stroke' => true,
			'class' => true,
		),
		'rect' => array(
			'x' => true,
			'y' => true,
			'width' => true,
			'height' => true,
			'rx' => true,
			'ry' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'opacity' => true,
			'class' => true,
		),
		'line' => array(
			'x1' => true,
			'y1' => true,
			'x2' => true,
			'y2' => true,
			'stroke' => true,
			'stroke-width' => true,
			'stroke-linecap' => true,
			'class' => true,
		),
		'polygon' => array(
			'points' => true,
			'fill' => true,
			'stroke' => true,
			'class' => true,
		),
		'polyline' => array(
			'points' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'stroke-linecap' => true,
			'stroke-linejoin' => true,
			'class' => true,
		),
		'lineargradient' => array(
			'id' => true,
			'x1' => true,
			'y1' => true,
			'x2' => true,
			'y2' => true,
			'gradientunits' => true,
		),
		'radialgradient' => array(
			'id' => true,
			'cx' => true,
			'cy' => true,
			'r' => true,
			'gradientunits' => true,
		),
		'stop' => array(
			'offset' => true,
			'stop-color' => true,
			'stop-opacity' => true,
		),
		'use' => array(
			'href' => true,
			'xlink:href' => true,
			'x' => true,
			'y' => true,
			'width' => true,
			'height' => true,
		),
	);
}

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
			$icon_svg = wp_kses( $icon_svg, bl_get_allowed_icon_svg_tags() );

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